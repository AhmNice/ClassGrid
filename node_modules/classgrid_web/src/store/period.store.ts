import type { IPeriodSchedule } from "../interface/schedule.interface";
import type { IPeriod, IPeriodCreate } from "../interface/period.interface";
import type { RequestResponse } from "../interface/common.interface";
import { create } from "zustand";
import { handleRequest } from "../lib/request";
import api from "../lib/axios";

interface storeState {
  periods: IPeriod[];
  periodSchedules: IPeriodSchedule[];
  loading: boolean;
  error: string | null;
}

interface storeActions {
  getPeriods: () => Promise<RequestResponse<IPeriod[]>>;
  getPeriodSchedules: () => Promise<RequestResponse<IPeriodSchedule[]>>;
  createPeriod: (period: IPeriodCreate) => Promise<RequestResponse<IPeriod>>;
  updatePeriod: (
    periodId: string,
    data: Partial<IPeriodCreate>,
  ) => Promise<RequestResponse<IPeriod>>;
  deletePeriod: (periodId: string) => Promise<RequestResponse<null>>;
}

const initialState: storeState = {
  periods: [],
  periodSchedules: [],
  loading: false,
  error: null,
};

const PERIOD_ENDPOINT = "/periods";
const PERIOD_SCHEDULE_ENDPOINT = "/period-schedules";

const FETCH_PERIODS_ERROR = "Could not load periods. Try again.";
const FETCH_SCHEDULES_ERROR = "Could not load period schedules. Try again.";
const CREATE_PERIOD_ERROR = "Could not add the period. Try again.";
const UPDATE_ERROR = "Could not update the period. Try again.";
const DELETE_ERROR = "Could not delete the period. Try again.";


/** A period as the API sends it: JSON has no Date type. */
type RawPeriod = Omit<IPeriod, "createdAt" | "updatedAt"> & {
  createdAt: string;
  updatedAt: string;
};

/** A schedule as the API sends it: JSON has no Date type. */
type RawPeriodSchedule = Omit<IPeriodSchedule, "createdAt" | "updatedAt"> & {
  createdAt: string;
  updatedAt: string;
};

const toPeriod = (raw: RawPeriod): IPeriod => ({
  ...raw,
  createdAt: new Date(raw.createdAt ?? Date.now()),
  updatedAt: new Date(raw.updatedAt ?? raw.createdAt ?? Date.now()),
});

const toPeriodSchedule = (raw: RawPeriodSchedule): IPeriodSchedule => ({
  ...raw,
  createdAt: new Date(raw.createdAt ?? Date.now()),
  updatedAt: new Date(raw.updatedAt ?? raw.createdAt ?? Date.now()),
});

/** Keep periods in teaching order, then by whatever start-time field exists. */
const byStartThenOrder = (a: IPeriod, b: IPeriod) => {
  // Replace these with your actual field names from IPeriod.
  const aStart = (a as IPeriod).startTime ?? "";
  const bStart = (b as IPeriod).startTime ?? "";
  if (aStart !== bStart) return aStart.localeCompare(bStart);
  const aOrder = (a as IPeriod).sequence ?? 0;
  const bOrder = (b as IPeriod).sequence ?? 0;
  return aOrder - bOrder;
};

type FieldErrors = Array<{ field: string; message: string }>;

const resolveError = (
  error: any,
  fallback: string,
): { message: string; errors?: FieldErrors } => {
  const body = error?.response?.data;
  return {
    message: body?.message ?? fallback,
    errors: body?.errors,
  };
};

export const usePeriodStore = create<storeState & storeActions>((set) => ({
  ...initialState,

  getPeriods: async () => {
    const result: RequestResponse<IPeriod[]> = {
      success: false,
      message: "",
    };
    set({ loading: true, error: null });

    await handleRequest<RawPeriod[]>({
      request: () => api.get(`${PERIOD_ENDPOINT}`),
      onSuccess: (response) => {
        const raw = Array.isArray(response.data) ? response.data : [];
        const periods = raw.map(toPeriod).sort(byStartThenOrder);

        set({ periods, loading: false, error: null });
        result.success = true;
        result.message = (response.message as string) ?? "";
        result.data = periods;
      },
      onError: (error) => {
        const { message } = resolveError(error, FETCH_PERIODS_ERROR);
        set({ error: message, loading: false });
        result.success = false;
        result.message = message;
      },
      showToast: false,
    });

    return result;
  },

  getPeriodSchedules: async () => {
    const result: RequestResponse<IPeriodSchedule[]> = {
      success: false,
      message: "",
    };
    set({ loading: true, error: null });

    await handleRequest<RawPeriodSchedule[]>({
      request: () => api.get(PERIOD_SCHEDULE_ENDPOINT),
      onSuccess: (response) => {
        const raw = Array.isArray(response.data) ? response.data : [];
        const periodSchedules = raw.map(toPeriodSchedule);

        set({ periodSchedules, loading: false, error: null });
        result.success = true;
        result.message = (response.message as string) ?? "";
        result.data = periodSchedules;
      },
      onError: (error) => {
        const { message } = resolveError(error, FETCH_SCHEDULES_ERROR);
        set({ error: message, loading: false });
        result.success = false;
        result.message = message;
      },
      showToast: false,
    });

    return result;
  },

  createPeriod: async (period: IPeriodCreate) => {
    const result: RequestResponse<IPeriod> = {
      success: false,
      message: CREATE_PERIOD_ERROR,
    };

    await handleRequest<RawPeriod>({
      request: () => api.post(PERIOD_ENDPOINT, period),
      onSuccess: (response) => {
        if (!response.data) {
          result.message = CREATE_PERIOD_ERROR;
          return;
        }

        const created = toPeriod(response.data);
        set((state) => ({
          periods: [...state.periods, created].sort(byStartThenOrder),
          error: null,
        }));
        result.success = true;
        result.message = response.message ?? "Period added";
        result.data = created;
      },
      onError: (error) => {
        const { message, errors } = resolveError(error, CREATE_PERIOD_ERROR);
        set({ error: message });
        result.success = false;
        result.message = message;
        result.errors = errors;
      },
      showToast: true,
    });

    return result;
  },
  updatePeriod: async (periodId, data) => {
    const result: RequestResponse<IPeriod> = {
      success: false,
      message: UPDATE_ERROR,
    };
    set({ loading: true, error: null });

    await handleRequest<IPeriod>({
      request: () => api.patch(`${PERIOD_ENDPOINT}/${periodId}`, data),
      onSuccess: (response) => {
        if (!response.data) {
          set({ loading: false });
          result.message = UPDATE_ERROR;
          return;
        }
        const updated = response.data;
        set((state) => ({
          periods: state.periods
            .map((p) => (p.id === updated.id ? updated : p))
            .sort((a, b) => a.sequence - b.sequence),
          loading: false,
          error: null,
        }));
        result.success = true;
        result.message = response.message ?? "Period updated";
        result.data = updated;
      },
      onError: (error) => {
        const { message, errors } = resolveError(error, UPDATE_ERROR);
        set({ error: message, loading: false });
        result.success = false;
        result.message = message;
        result.errors = errors;
      },
      showToast: true,
    });

    return result;
  },
  deletePeriod: async (periodId) => {
  const result: RequestResponse<null> = {
    success: false,
    message: DELETE_ERROR,
  };
  set({ loading: true, error: null });

  await handleRequest({
    request: () => api.delete(`${PERIOD_ENDPOINT}/${periodId}`),
    onSuccess: (response) => {
      set((state) => ({
        periods: state.periods.filter((p) => p.id !== periodId),
        loading: false,
        error: null,
      }));
      result.success = true;
      result.message = response.message ?? "Period deleted";
    },
    onError: (error) => {
      const { message } = resolveError(error, DELETE_ERROR);
      set({ error: message, loading: false });
      result.success = false;
      result.message = message;
    },
    showToast: true,
  });

  return result;
},
}));
