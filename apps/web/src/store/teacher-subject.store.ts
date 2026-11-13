import { create } from "zustand";
import type { RequestResponse } from "../interface/common.interface";
import type {
  BulkITeacherSubjectCreate,
  ITeacherSubjectDetails,
  ITeacherSubjectListQuery,
} from "../interface/teacher-subject.interface";
import { handleRequest } from "../lib/request";
import api from "../lib/axios";

interface storeState {
  loading: boolean;
  error: string | null;
}

interface storeAction {
  getTeacherSubjects: (
    params: ITeacherSubjectListQuery,
  ) => Promise<RequestResponse<ITeacherSubjectDetails[]>>;
  updateTeacherSubject: (
    data: BulkITeacherSubjectCreate,
  ) => Promise<RequestResponse<void>>;
}

const initialState: storeState = {
  loading: false,
  error: null,
};

const ENDPOINT = "/assignments/teacher-subjects";

const FETCH_ERROR = "Could not load teacher subjects. Try again.";
const UPDATE_ERROR = "Could not save the teacher subjects. Try again.";

type FieldErrors = Array<{ field: string; message: string }>;

const resolveError = (
  error: any,
  fallback: string,
): { message: string; errors?: FieldErrors } => {
  const body = error?.response?.data;
  return { message: body?.message ?? fallback, errors: body?.errors };
};

export const useTeacherSubjectStore = create<storeState & storeAction>(
  (set) => ({
    ...initialState,

    getTeacherSubjects: async (params) => {
      const result: RequestResponse<ITeacherSubjectDetails[]> = {
        success: false,
        message: "",
      };
      set({ loading: true, error: null });

      await handleRequest<ITeacherSubjectDetails[]>({
        request: () => api.get(ENDPOINT, { params }),
        onSuccess: (response) => {
          const raw = Array.isArray(response.data) ? response.data : [];
          set({ loading: false, error: null });
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
    updateTeacherSubject: async (data: BulkITeacherSubjectCreate) => {
      const result: RequestResponse<void> = {
        success: false,
        message: UPDATE_ERROR,
      };
      set({ loading: true, error: null });

      await handleRequest({
        request: () => api.patch(`${ENDPOINT}/bulk-update`, data),
        onSuccess: (response) => {
          set({ loading: false, error: null });
          result.success = true;
          result.message = response.message ?? "Teacher subjects updated";
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
  }),
);
