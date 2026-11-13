import { create } from "zustand";
import type { RequestResponse } from "../interface/common.interface";
import type {
  IClassLevelSubject,
  IManageClassSubjectAllocations,
} from "../interface/subject.assignment.interface";
import { handleRequest } from "../lib/request";
import api from "../lib/axios";
import type {
  ClassArmTeachingAssignmentData,
  getTeachingAssignmentParams,
  ITeachingAssignmentCreate,
  TeachingAssignmentSummary,
} from "../interface/Teaching-assignment.interface";

interface storeState {
  subjectAssignments: IClassLevelSubject[];
  teachingAssignments: ClassArmTeachingAssignmentData | null;
  isLoading: boolean;
  error: string | null;
}

interface storeActions {
  getSubjectAssignments: () => Promise<RequestResponse<IClassLevelSubject[]>>;
  updateSubjectAssignments: (
    assignments: IManageClassSubjectAllocations,
  ) => Promise<RequestResponse<IClassLevelSubject[]>>;
  createTeachingAssignment: (
    data: ITeachingAssignmentCreate,
  ) => Promise<RequestResponse<TeachingAssignmentSummary>>;
  updateAssignment: (
    assignmentId: string,
    data: Partial<ITeachingAssignmentCreate>,
  ) => Promise<RequestResponse<TeachingAssignmentSummary>>;
  getTeachingAssignments(
    params: getTeachingAssignmentParams,
  ): Promise<RequestResponse<ClassArmTeachingAssignmentData>>;
  resetErrorState: () => void;
}

const initialState: storeState = {
  subjectAssignments: [],
  teachingAssignments: null,
  isLoading: false,
  error: null,
};

const SUBJECT_ENDPOINT = "/assignments/subjects";
const TEACHING_ENDPOINT = "/assignments/teaching";

const FETCH_ERROR = "Could not load subject assignments. Try again.";
const UPDATE_ERROR = "Could not save the subject assignments. Try again.";
const FETCH_TEACHING_ERROR = "Could not load teaching assignments. Try again.";
const CREATE_TEACHING_ERROR = "Could not save the assignment. Try again.";
const UPDATE_ASSIGNMENT_ERROR = "Could not update the assignment. Try again.";

type FieldErrors = Array<{ field: string; message: string }>;

const resolveError = (
  error: any,
  fallback: string,
): { message: string; errors?: FieldErrors } => {
  const body = error?.response?.data;
  return { message: body?.message ?? fallback, errors: body?.errors };
};

export const useAssignmentStore = create<storeState & storeActions>((set) => ({
  ...initialState,

  getSubjectAssignments: async () => {
    const result: RequestResponse<IClassLevelSubject[]> = {
      success: false,
      message: "",
    };
    set({ isLoading: true, error: null });

    await handleRequest<IClassLevelSubject[]>({
      request: () => api.get(SUBJECT_ENDPOINT),
      onSuccess: (response) => {
        const raw = Array.isArray(response.data) ? response.data : [];
        set({ subjectAssignments: raw, isLoading: false, error: null });
        result.success = true;
        result.message = (response.message as string) ?? "";
        result.data = raw;
      },
      onError: (error) => {
        const { message } = resolveError(error, FETCH_ERROR);
        set({ error: message, isLoading: false });
        result.success = false;
        result.message = message;
      },
      showToast: false,
    });

    return result;
  },

  updateSubjectAssignments: async (assignments) => {
    const result: RequestResponse<IClassLevelSubject[]> = {
      success: false,
      message: UPDATE_ERROR,
    };
    set({ isLoading: true, error: null });

    await handleRequest<IClassLevelSubject[]>({
      request: () => api.put(`${SUBJECT_ENDPOINT}/allocations`, assignments),
      onSuccess: (response) => {
        const raw = Array.isArray(response.data) ? response.data : [];
        set({ subjectAssignments: raw, isLoading: false, error: null });
        result.success = true;
        result.message = response.message ?? "Assignments saved";
        result.data = raw;
      },
      onError: (error) => {
        const { message, errors } = resolveError(error, UPDATE_ERROR);
        set({ error: message, isLoading: false });
        result.success = false;
        result.message = message;
        result.errors = errors;
      },
      showToast: true,
    });

    return result;
  },

  createTeachingAssignment: async (data) => {
    const result: RequestResponse<TeachingAssignmentSummary> = {
      success: false,
      message: CREATE_TEACHING_ERROR,
    };
    set({ isLoading: true, error: null });

    await handleRequest<TeachingAssignmentSummary>({
      request: () => api.post(`${TEACHING_ENDPOINT}/`, data),
      onSuccess: (response) => {
        if (!response.data) {
          set({ isLoading: false });
          result.success = false;
          result.message = CREATE_TEACHING_ERROR;
          return;
        }
        set({ isLoading: false, error: null });
        result.success = true;
        result.message = response.message ?? "Teacher assigned";
        result.data = response.data;
      },
      onError: (error) => {
        const { message, errors } = resolveError(error, CREATE_TEACHING_ERROR);
        set({ error: message, isLoading: false });
        result.success = false;
        result.message = message;
        result.errors = errors;
      },
      showToast: true,
    });

    return result;
  },

  getTeachingAssignments: async (params) => {
    const result: RequestResponse<ClassArmTeachingAssignmentData> = {
      success: false,
      message: "",
    };
    set({ isLoading: true, error: null });

    await handleRequest<ClassArmTeachingAssignmentData>({
      request: () =>
        api.get(
          `${TEACHING_ENDPOINT}/sessions/${params.sessionId}/class-levels/${params.classLevelId}/class-arms/${params.classArmId}`,
        ),
      onSuccess: (response) => {
        if (!response.data) {
          set({ isLoading: false });
          result.success = false;
          result.message = "No teaching assignment data returned.";
          return;
        }
        set({
          teachingAssignments: response.data,
          isLoading: false,
          error: null,
        });
        result.success = true;
        result.message = (response.message as string) ?? "";
        result.data = response.data;
      },
      onError: (error) => {
        const { message } = resolveError(error, FETCH_TEACHING_ERROR);
        set({ error: message, isLoading: false });
        result.success = false;
        result.message = message;
      },
      showToast: false,
    });

    return result;
  },
  updateAssignment: async (assignmentId, data) => {
    const result: RequestResponse<TeachingAssignmentSummary> = {
      success: false,
      message: UPDATE_ASSIGNMENT_ERROR,
    };
    set({ isLoading: true, error: null });

    await handleRequest<TeachingAssignmentSummary>({
      request: () => api.patch(`${TEACHING_ENDPOINT}/${assignmentId}`, data),
      onSuccess: (response) => {
        if (!response.data) {
          set({ isLoading: false });
          result.success = false;
          result.message = UPDATE_ASSIGNMENT_ERROR;
          return;
        }
        set({ isLoading: false, error: null });
        result.success = true;
        result.message = response.message ?? "Assignment updated";
        result.data = response.data;
      },
      onError: (error) => {
        const { message, errors } = resolveError(
          error,
          UPDATE_ASSIGNMENT_ERROR,
        );
        set({ error: message, isLoading: false });
        result.success = false;
        result.message = message;
        result.errors = errors;
      },
      showToast: true,
    });

    return result;
  },
  resetErrorState: () => {
    set({ error: null });
  },
}));
