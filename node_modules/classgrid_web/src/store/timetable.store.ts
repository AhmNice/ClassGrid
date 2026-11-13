import { create } from "zustand";
import type { RequestResponse } from "../interface/common.interface";
import type {
  ITimetable,
  ITimetableCreate,
  ITimetableListItem,
  ITimetableListQuery,
} from "../interface/timetable.interface";
import { handleRequest } from "../lib/request";
import api from "../lib/axios";

interface storeState {
  loading: boolean;
  error: string | null;
  timeTables: ITimetableListItem[];
}

interface storeAction {
  getTimeTables: (
    params: ITimetableListQuery,
  ) => Promise<RequestResponse<ITimetableListItem[]>>;
  createTimetable: (
    data: ITimetableCreate,
  ) => Promise<RequestResponse<ITimetable>>;
  publishTimetable: (id: string) => Promise<RequestResponse<ITimetable>>;
  archiveTimetable: (id: string) => Promise<RequestResponse<ITimetable>>;
  resetErrorState: () => void;
}

const initialState: storeState = {
  loading: false,
  error: null,
  timeTables: [],
};

const ENDPOINT = "/timetables";

const FETCH_ERROR = "Could not load timetables. Try again.";
const CREATE_ERROR = "Could not create the timetable. Try again.";
const PUBLISH_ERROR = "Could not publish the timetable. Try again.";
const ARCHIVE_ERROR = "Could not archive the timetable. Try again.";

type FieldErrors = Array<{ field: string; message: string }>;

const resolveError = (
  error: any,
  fallback: string,
): { message: string; errors?: FieldErrors } => {
  const body = error?.response?.data;
  return { message: body?.message ?? fallback, errors: body?.errors };
};

export const useTimetableStore = create<storeState & storeAction>((set) => ({
  ...initialState,

  /* ------------------------------- list ---------------------------------- */

  getTimeTables: async (params) => {
    const result: RequestResponse<ITimetableListItem[]> = {
      success: false,
      message: "",
    };
    set({ loading: true, error: null });

    await handleRequest<ITimetableListItem[]>({
      request: () => api.get(ENDPOINT, { params }),
      onSuccess: (response) => {
        const raw = Array.isArray(response.data) ? response.data : [];
        set({ timeTables: raw, loading: false, error: null });
        result.success = true;
        result.message = (response.message as string) ?? "";
        result.data = raw;
      },
      onError: (error) => {
        const { message } = resolveError(error, FETCH_ERROR);
        set({ error: message, loading: false });
        result.success = false;
        result.message = message;
      },
      showToast: false,
    });

    return result;
  },

  /* ------------------------------ create --------------------------------- */

  createTimetable: async (data) => {
    const result: RequestResponse<ITimetable> = {
      success: false,
      message: CREATE_ERROR,
    };
    set({ loading: true, error: null });

    await handleRequest<ITimetable>({
      request: () => api.post(ENDPOINT, data),
      onSuccess: (response) => {
        if (!response.data) {
          set({ loading: false });
          result.success = false;
          result.message = CREATE_ERROR;
          return;
        }
        set({ loading: false, error: null });
        result.success = true;
        result.message = response.message ?? "Timetable created";
        result.data = response.data;
      },
      onError: (error) => {
        const { message, errors } = resolveError(error, CREATE_ERROR);
        set({ error: message, loading: false });
        result.success = false;
        result.message = message;
        result.errors = errors;
      },
      showToast: true,
    });

    return result;
  },

  /* ------------------------------ publish -------------------------------- */

  publishTimetable: async (id) => {
    const result: RequestResponse<ITimetable> = {
      success: false,
      message: PUBLISH_ERROR,
    };
    set({ loading: true, error: null });

    await handleRequest<ITimetable>({
      request: () => api.patch(`${ENDPOINT}/${id}/publish`),
      onSuccess: (response) => {
        if (!response.data) {
          set({ loading: false });
          result.success = false;
          result.message = PUBLISH_ERROR;
          return;
        }
        set({ loading: false, error: null });
        result.success = true;
        result.message = response.message ?? "Timetable published";
        result.data = response.data;
      },
      onError: (error) => {
        const { message } = resolveError(error, PUBLISH_ERROR);
        set({ error: message, loading: false });
        result.success = false;
        result.message = message;
      },
      showToast: true,
    });

    return result;
  },

  /* ------------------------------ archive -------------------------------- */

  archiveTimetable: async (id) => {
    const result: RequestResponse<ITimetable> = {
      success: false,
      message: ARCHIVE_ERROR,
    };
    set({ loading: true, error: null });

    await handleRequest<ITimetable>({
      request: () => api.patch(`${ENDPOINT}/${id}/archive`),
      onSuccess: (response) => {
        if (!response.data) {
          set({ loading: false });
          result.success = false;
          result.message = ARCHIVE_ERROR;
          return;
        }
        set({ loading: false, error: null });
        result.success = true;
        result.message = response.message ?? "Timetable archived";
        result.data = response.data;
      },
      onError: (error) => {
        const { message } = resolveError(error, ARCHIVE_ERROR);
        set({ error: message, loading: false });
        result.success = false;
        result.message = message;
      },
      showToast: true,
    });

    return result;
  },

  /* ------------------------------- misc ---------------------------------- */

  resetErrorState: () => set({ error: null }),
}));