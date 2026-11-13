import { create } from "zustand";
import type { RequestResponse } from "../interface/common.interface";
import type { ITeacher, ITeacherCreate } from "../interface/teacher.interface";
import { handleRequest } from "../lib/request";
import api from "../lib/axios";

interface storeState {
  teachers: ITeacher[];
  loading: boolean;
  error: string | null;
}
interface storeActions {
  createTeacher: (teacher: ITeacherCreate) => Promise<RequestResponse<ITeacher>>;
  getTeachers: () => Promise<RequestResponse<ITeacher[]>>;
}

const initialState: storeState = {
  teachers: [],
  loading: false,
  error: null,
};

const ENDPOINT = "/teachers";

const FETCH_ERROR = "Could not load teachers. Try again.";
const CREATE_ERROR = "Could not add the teacher. Try again.";

/** A teacher as the API sends it: JSON has no Date type. */
type RawTeacher = Omit<ITeacher, "createdAt" | "updatedAt"> & {
  createdAt: string;
  updatedAt: string;
};

const toTeacher = (raw: RawTeacher): ITeacher => ({
  ...raw,
  createdAt: new Date(raw.createdAt ?? Date.now()),
  updatedAt: new Date(raw.updatedAt ?? raw.createdAt ?? Date.now()),
});

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

export const useTeacherStore = create<storeState & storeActions>((set) => ({
  ...initialState,

  createTeacher: async (teacher) => {
    const result: RequestResponse<ITeacher> = {
      success: false,
      message: CREATE_ERROR,
    };

    await handleRequest<RawTeacher>({
      request: () => api.post(ENDPOINT, teacher),
      onSuccess: (response) => {
        if (!response.data) {
          result.message = CREATE_ERROR;
          return;
        }

        const created = toTeacher(response.data);
        set((state) => ({
          teachers: [...state.teachers, created],
          error: null,
        }));
        result.success = true;
        result.message = response.message ?? "Teacher added";
        result.data = created;
      },
      onError: (error) => {
        const { message, errors } = resolveError(error, CREATE_ERROR);
        set({ error: message });
        result.success = false;
        result.message = message;
        result.errors = errors;
      },
      showToast: true,
    });

    return result;
  },

  getTeachers: async () => {
    const result: RequestResponse<ITeacher[]> = {
      success: false,
      message: "",
    };
    set({ loading: true, error: null });

    await handleRequest<RawTeacher[]>({
      request: () => api.get(ENDPOINT),
      onSuccess: (response) => {
        const raw = Array.isArray(response.data) ? response.data : [];
        const teachers = raw.map(toTeacher);

        set({ teachers, loading: false, error: null });
        result.success = true;
        result.message = (response.message as string) ?? "";
        result.data = teachers;
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
}));