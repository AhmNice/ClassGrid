import { create } from "zustand";
import type { RequestResponse } from "../interface/common.interface";
import type {
  ISubject,
  ISubjectCreate,
  ISubjectUpdate,
} from "../interface/subject.interface";
import { handleRequest } from "../lib/request";
import api from "../lib/axios";

interface storeState {
  subjects: ISubject[];
  loading: boolean;
  error: string | null;
}
interface storeActions {
  createSubject: (
    subject: ISubjectCreate,
  ) => Promise<RequestResponse<ISubject>>;
  updateSubject: (
    subject: ISubjectUpdate,
  ) => Promise<RequestResponse<ISubject>>;
  getSubjects: () => Promise<RequestResponse<ISubject[]>>;
}

const initialState: storeState = {
  subjects: [],
  loading: false,
  error: null,
};
const ENDPOINT = "/subjects";

const FETCH_ERROR = "Could not load subjects. Try again.";
const CREATE_ERROR = "Could not add the subject. Try again.";

/** A subject as the API sends it: JSON has no Date type. */
type RawSubject = Omit<ISubject, "createdAt" | "updatedAt"> & {
  createdAt: string;
  updatedAt: string;
};

const toSubject = (raw: RawSubject): ISubject => ({
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

export const useSubjectStore = create<storeState & storeActions>((set) => ({
  ...initialState,

  createSubject: async (subject) => {
    const result: RequestResponse<ISubject> = {
      success: false,
      message: CREATE_ERROR,
    };

    await handleRequest<RawSubject>({
      request: () => api.post(ENDPOINT, subject),
      onSuccess: (response) => {
        if (!response.data) {
          result.message = CREATE_ERROR;
          return;
        }

        const created = toSubject(response.data);
        set((state) => ({
          subjects: [...state.subjects, created],
          error: null,
        }));
        result.success = true;
        result.message = response.message ?? "Subject added";
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
  updateSubject: async (subject) => {
    const result: RequestResponse<ISubject> = {
      success: false,
      message: "Could not update the subject. Try again.",
    };

    await handleRequest<RawSubject>({
      request: () => api.patch(`${ENDPOINT}/${subject.id}`, subject),
      onSuccess: (response) => {
        if (!response.data) {
          result.message = "Could not update the subject. Try again.";
          return;
        }

        const updated = toSubject(response.data);
        set((state) => ({
          subjects: state.subjects.map((s) => (s.id === updated.id ? updated : s)),
          error: null,
        }));
        result.success = true;
        result.message = response.message ?? "Subject updated";
        result.data = updated;
      },
      onError: (error) => {
        const { message, errors } = resolveError(error, "Could not update the subject. Try again.");
        set({ error: message });
        result.success = false;
        result.message = message;
        result.errors = errors;
      },
      showToast: true,
    });

    return result;
  },
  getSubjects: async () => {
    const result: RequestResponse<ISubject[]> = {
      success: false,
      message: "",
    };
    set({ loading: true, error: null });

    await handleRequest<RawSubject[]>({
      request: () => api.get(ENDPOINT),
      onSuccess: (response) => {
        const raw = Array.isArray(response.data) ? response.data : [];
        const subjects = raw.map(toSubject);

        set({ subjects, loading: false, error: null });
        result.success = true;
        result.message = (response.message as string) ?? "";
        result.data = subjects;
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
