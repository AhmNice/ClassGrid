// store/teacher-availability.store.ts
import { create } from "zustand";
import type { RequestResponse } from "../interface/common.interface";
import type {
  ITeacherAvailability,
  ITeacherAvailabilityCreate,
} from "../interface/teacher-availability.interface";
import { handleRequest } from "../lib/request";
import api from "../lib/axios";

interface storeState {
  availabilities: ITeacherAvailability[];
  loading: boolean;
  error: string | null;
}

interface storeActions {
  getAvailabilities: (
    teacherId: string,
  ) => Promise<RequestResponse<ITeacherAvailability[]>>;
  createAvailability: (
    data: ITeacherAvailabilityCreate,
  ) => Promise<RequestResponse<ITeacherAvailability>>;
  deleteAvailability: (
    id: string,
    teacherId: string,
  ) => Promise<RequestResponse<null>>;
  resetErrorState: () => void;
}

const initialState: storeState = {
  availabilities: [],
  loading: false,
  error: null,
};

const ENDPOINT = "/teachers";

const FETCH_ERROR = "Could not load availability. Try again.";
const CREATE_ERROR = "Could not save availability. Try again.";
const DELETE_ERROR = "Could not remove availability. Try again.";

type FieldErrors = Array<{ field: string; message: string }>;

const resolveError = (
  error: any,
  fallback: string,
): { message: string; errors?: FieldErrors } => {
  const body = error?.response?.data;
  return { message: body?.message ?? fallback, errors: body?.errors };
};

const toAvailability = (raw: any): ITeacherAvailability => ({
  ...raw,
  createdAt: new Date(raw.createdAt),
  updatedAt: new Date(raw.updatedAt),
});

export const useTeacherAvailabilityStore = create<
  storeState & storeActions
>((set) => ({
  ...initialState,

  getAvailabilities: async (teacherId) => {
    const result: RequestResponse<ITeacherAvailability[]> = {
      success: false,
      message: "",
    };
    set({ loading: true, error: null });

    await handleRequest<ITeacherAvailability[]>({
      request: () => api.get(`${ENDPOINT}/${teacherId}/availability`),
      onSuccess: (response) => {
        const raw = Array.isArray(response.data) ? response.data : [];
        const availabilities = raw.map(toAvailability);
        set({ availabilities, loading: false, error: null });
        result.success = true;
        result.message = (response.message as string) ?? "";
        result.data = availabilities;
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

  createAvailability: async (data) => {
    const result: RequestResponse<ITeacherAvailability> = {
      success: false,
      message: CREATE_ERROR,
    };
    set({ loading: true, error: null });

    await handleRequest<ITeacherAvailability>({
      request: () => api.post(`${ENDPOINT}/${data.teacherId}/availability`, data),
      onSuccess: (response) => {
        if (!response.data) {
          set({ loading: false });
          result.message = CREATE_ERROR;
          return;
        }
        const created = toAvailability(response.data);
        set((state) => ({
          availabilities: [...state.availabilities, created],
          loading: false,
          error: null,
        }));
        result.success = true;
        result.message = response.message ?? "Availability saved";
        result.data = created;
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

  deleteAvailability: async (id: string, teacherId: string) => {
    const result: RequestResponse<null> = {
      success: false,
      message: DELETE_ERROR,
    };
    set({ loading: true, error: null });

    await handleRequest({
      request: () => api.delete(`${ENDPOINT}/${teacherId}/availability/${id}`),
      onSuccess: (response) => {
        set((state) => ({
          availabilities: state.availabilities.filter((a) => a.id !== id),
          loading: false,
          error: null,
        }));
        result.success = true;
        result.message = response.message ?? "Availability removed";
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

  resetErrorState: () => set({ error: null }),
}));