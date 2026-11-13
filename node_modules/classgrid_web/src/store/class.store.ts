import { create } from "zustand";
import type {
  ClassStage,
  IClassLevel,
  IClassLevelCreate,
} from "../interface/class.interface";
import type { RequestResponse } from "../interface/common.interface";
import { handleRequest } from "../lib/request";
import api from "../lib/axios";
import type {
  IClassArm,
  IClassArmCreate,
} from "../interface/classArm.interface";

interface ClassState {
  classes: IClassLevel[];
  classArms: IClassArm[];
  loading: boolean;
  error: string | null;
}

type ClassLevelUpdate = Partial<IClassLevelCreate>;

interface ClassActions {
  getClassLevels: () => Promise<RequestResponse<IClassLevel[]>>;
  createClassLevel: (
    payload: IClassLevelCreate,
  ) => Promise<RequestResponse<IClassLevel>>;
  updateClassLevel: (
    id: string,
    payload: ClassLevelUpdate,
  ) => Promise<RequestResponse<IClassLevel>>;
  deleteClassLevel: (id: string) => Promise<RequestResponse<null>>;

  getClassArms: () => Promise<RequestResponse<IClassArm[]>>;
  createClassArm: (
    payload: IClassArmCreate,
  ) => Promise<RequestResponse<IClassArm>>;
}
type RawClassArm = Omit<IClassArm, "createdAt" | "updatedAt"> & {
  createdAt: string;
  updatedAt: string;
};

const toClassArm = (raw: RawClassArm): IClassArm => ({
  ...raw,
  createdAt: new Date(raw.createdAt ?? Date.now()),
  updatedAt: new Date(raw.updatedAt ?? raw.createdAt ?? Date.now()),
});

/** A class level as the API sends it: JSON has no Date type. */
type RawClassLevel = Omit<IClassLevel, "createdAt" | "updatedAt"> & {
  createdAt: string;
  updatedAt: string;
};

const toClassLevel = (raw: RawClassLevel): IClassLevel => ({
  ...raw,
  createdAt: new Date(raw.createdAt ?? Date.now()),
  updatedAt: new Date(raw.updatedAt ?? raw.createdAt ?? Date.now()),
});

// Keep the list in teaching order: JSS before SS, then by rank.
const STAGE_ORDER: Record<ClassStage, number> = { JSS: 0, SS: 1 };
const byStageThenRank = (a: IClassLevel, b: IClassLevel) =>
  STAGE_ORDER[a.stage] - STAGE_ORDER[b.stage] || a.rank - b.rank;

const ENDPOINT = "/class-levels"; // Change to your real route.

const FETCH_ERROR = "Could not load classes. Try again.";
const CREATE_ERROR = "Could not add the class. Try again.";
const UPDATE_ERROR = "Could not update the class. Try again.";
const DELETE_ERROR = "Could not delete the class. Try again.";
const FETCH_ARMS_ERROR = "Could not load class arms. Try again.";
const CREATE_ARM_ERROR = "Could not add the class arm. Try again.";

type FieldErrors = Array<{ field: string; message: string }>;

/**
 * Pull a user-facing message and field errors out of an Axios error,
 * preferring the API's message over the technical one.
 */
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

const initialState: ClassState = {
  classes: [],
  classArms: [],
  loading: false,
  error: null,
};

export const useClassStore = create<ClassState & ClassActions>((set, get) => ({
  ...initialState,

  getClassLevels: async () => {
    const result: RequestResponse<IClassLevel[]> = {
      success: false,
      message: "",
    };
    set({ loading: true, error: null });

    await handleRequest<RawClassLevel[]>({
      request: () => api.get(ENDPOINT),
      onSuccess: (response) => {
        // Never let a missing or odd `data` put a non-array into the store.
        const raw = Array.isArray(response.data) ? response.data : [];
        const classes = raw.map(toClassLevel).sort(byStageThenRank);

        set({ classes, loading: false, error: null });
        result.success = true;
        result.message = (response.message as string) ?? "";
        result.data = classes;
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

  createClassLevel: async (payload) => {
    const result: RequestResponse<IClassLevel> = {
      success: false,
      message: CREATE_ERROR,
    };

    await handleRequest<RawClassLevel>({
      request: () => api.post(ENDPOINT, payload),
      onSuccess: (response) => {
        if (!response.data) {
          result.message = CREATE_ERROR;
          return;
        }

        const level = toClassLevel(response.data);
        set((state) => ({
          classes: [...state.classes, level].sort(byStageThenRank),
          error: null,
        }));
        result.success = true;
        result.message = response.message ?? "Class added";
        result.data = level;
      },
      onError: (error) => {
        const { message, errors } = resolveError(error, CREATE_ERROR);
        result.success = false;
        result.message = message;
        result.errors = errors;
      },
      showToast: true,
    });

    return result;
  },

  updateClassLevel: async (id, payload) => {
    const result: RequestResponse<IClassLevel> = {
      success: false,
      message: UPDATE_ERROR,
    };

    await handleRequest<RawClassLevel>({
      request: () => api.patch(`${ENDPOINT}/${id}`, payload),
      onSuccess: (response) => {
        if (!response.data) {
          result.message = UPDATE_ERROR;
          return;
        }

        const level = toClassLevel(response.data);
        // Replace in place, then re-sort in case the stage or rank changed.
        set((state) => ({
          classes: state.classes
            .map((c) => (c.id === level.id ? level : c))
            .sort(byStageThenRank),
          error: null,
        }));
        result.success = true;
        result.message = response.message ?? "Class updated";
        result.data = level;
      },
      onError: (error) => {
        const { message, errors } = resolveError(error, UPDATE_ERROR);
        result.success = false;
        result.message = message;
        result.errors = errors;
      },
      showToast: false,
    });

    return result;
  },

  deleteClassLevel: async (id) => {
    const result: RequestResponse<null> = {
      success: false,
      message: DELETE_ERROR,
    };

    await handleRequest({
      request: () => api.delete(`${ENDPOINT}/${id}`),
      onSuccess: (response) => {
        // A delete response usually has no data, so don't require any.
        set((state) => ({
          classes: state.classes.filter((c) => c.id !== id),
          error: null,
        }));
        result.success = true;
        result.message = (response.message as string) ?? "Class deleted";
      },
      onError: (error) => {
        const { message } = resolveError(error, DELETE_ERROR);
        result.success = false;
        result.message = message;
      },
      showToast: false,
    });

    return result;
  },

  // Class arms
  getClassArms: async () => {
    const result: RequestResponse<IClassArm[]> = {
      success: false,
      message: "",
    };
    set({ loading: true, error: null });

    await handleRequest<RawClassArm[]>({
      request: () => api.get(`${ENDPOINT}/arms/all`),
      onSuccess: (response) => {
        const raw = Array.isArray(response.data) ? response.data : [];
        const classArms = raw.map(toClassArm);

        set({ classArms, loading: false, error: null });
        result.success = true;
        result.message = (response.message as string) ?? "";
        result.data = classArms;
      },
      onError: (error) => {
        const { message } = resolveError(error, FETCH_ARMS_ERROR);
        set({ error: message, loading: false });
        result.success = false;
        result.message = message;
      },
      showToast: false,
    });

    return result;
  },

  createClassArm: async (payload: IClassArmCreate) => {
    const result: RequestResponse<IClassArm> = {
      success: false,
      message: CREATE_ARM_ERROR,
    };

    await handleRequest<RawClassArm>({
      request: () =>
        api.post(`${ENDPOINT}/${payload.classLevelId}/arms`, {
          name: payload.name,
          isActive: payload.isActive, // NOTE: was `payload.name` — bug
        }),
      onSuccess: async(response) => {
        if (!response.data) {
          result.message = CREATE_ARM_ERROR;
          return;
        }
        await get().getClassArms()

        result.success = true;
        result.message = response.message ?? "Class arm added";

      },
      onError: (error) => {
        const { message, errors } = resolveError(error, CREATE_ARM_ERROR);
        result.success = false;
        result.message = message;
        result.errors = errors;
      },
      showToast: true,
    });

    return result;
  },
}));
