import { create } from "zustand";
import type { RequestResponse } from "../interface/common.interface";
import type {
  CurrentAcademicSession,
  IAcademicSession,
  IAcademicSessionCreate,
  ITerm,
  ITermCreate,
  ITermUpdate,
} from "../interface/AcademicSession.interface";
import { handleRequest } from "../lib/request";
import api from "../lib/axios";
import { normalizeDateOnlyFields } from "../utils/apiUtils";
import { toApiDate } from "../utils/sessionUtils";

/* -------------------------------------------------------------------------- */
/*                                   Types                                    */
/* -------------------------------------------------------------------------- */

interface AcademicSessionState {
  currentSession: CurrentAcademicSession | null;
  sessions: IAcademicSession[];
  pastSessions: IAcademicSession[];
  loading: boolean;
  error: string | null;
}

interface AcademicSessionActions {
  createSession: (
    session: IAcademicSessionCreate,
  ) => Promise<RequestResponse<IAcademicSession>>;
  getCurrentSession: () => Promise<RequestResponse<CurrentAcademicSession>>;
  getSessions: () => Promise<RequestResponse<IAcademicSession[]>>;
  getPastSessions: () => Promise<RequestResponse<IAcademicSession[]>>;
  createTerm: (
    sessionId: string,
    payload: ITermCreate,
  ) => Promise<RequestResponse<ITerm>>;
  updateTerm: (
    sessionId: string,
    termId: string,
    payload: ITermUpdate,
  ) => Promise<RequestResponse<ITerm>>;
  deleteTerm: (
    sessionId: string,
    termId: string,
  ) => Promise<RequestResponse<null>>;
}

/* -------------------------------------------------------------------------- */
/*                                  Constants                                 */
/* -------------------------------------------------------------------------- */

const SESSION_ENDPOINT = "/academic-sessions";

const CREATE_SESSION_ERROR = "Could not create the session. Try again.";
const FETCH_CURRENT_ERROR = "Could not load the current session. Try again.";
const FETCH_SESSIONS_ERROR = "Could not load sessions. Try again.";
const FETCH_PAST_ERROR = "Could not load past sessions. Try again.";
const CREATE_TERM_ERROR = "Could not create the term. Try again.";
const UPDATE_TERM_ERROR = "Could not update the term. Try again.";
const DELETE_TERM_ERROR = "Could not delete the term. Try again.";

/* -------------------------------------------------------------------------- */
/*                                  Helpers                                   */
/* -------------------------------------------------------------------------- */

type SessionDateKey = "startDate" | "endDate";

type TermDateKey =
  | "startDate"
  | "endDate"
  | "midTermStartDate"
  | "midTermEndDate"
  | "examStartDate"
  | "examEndDate";

const SESSION_DATE_KEYS: SessionDateKey[] = ["startDate", "endDate"];

const TERM_DATE_KEYS: TermDateKey[] = [
  "startDate",
  "endDate",
  "midTermStartDate",
  "midTermEndDate",
  "examStartDate",
  "examEndDate",
];

/** Convert Date → API date string for every known term date field that's present. */
const serializeTermDates = <T extends object>(payload: T) => {
  const out = { ...payload } as Record<string, unknown>;
  for (const key of TERM_DATE_KEYS) {
    if (key in payload) {
      out[key] = toApiDate((payload as Record<string, Date | null>)[key]);
    }
  }
  return out;
};

/** Convert API date strings → Date for every known term date field. */
const normalizeTerm = (term: ITerm): ITerm =>
  normalizeDateOnlyFields<ITerm, TermDateKey>(term, TERM_DATE_KEYS) as ITerm;

/** Convert API date strings → Date for a session and each of its terms. */
const normalizeSession = (session: IAcademicSession): IAcademicSession => {
  const normalized = normalizeDateOnlyFields<IAcademicSession, SessionDateKey>(
    session,
    SESSION_DATE_KEYS,
  );
  return {
    ...normalized,
    terms: normalized.terms?.map(normalizeTerm),
  } as IAcademicSession;
};

/** Same as normalizeSession, but typed for the current-session shape. */
const normalizeCurrentSession = (
  session: CurrentAcademicSession,
): CurrentAcademicSession => {
  const normalized = normalizeDateOnlyFields<
    CurrentAcademicSession,
    SessionDateKey
  >(session, SESSION_DATE_KEYS);
  return {
    ...normalized,
    terms: normalized.terms?.map(normalizeTerm),
  } as CurrentAcademicSession;
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

const initialState: AcademicSessionState = {
  currentSession: null,
  sessions: [],
  pastSessions: [],
  loading: false,
  error: null,
};

/* -------------------------------------------------------------------------- */
/*                                   Store                                    */
/* -------------------------------------------------------------------------- */

export const useAcademicSessionStore = create<
  AcademicSessionState & AcademicSessionActions
>()((set, get) => ({
  ...initialState,

  /* ------------------------------ Sessions ------------------------------ */

  createSession: async (session) => {
    const result: RequestResponse<IAcademicSession> = {
      success: false,
      message: CREATE_SESSION_ERROR,
    };
    set({ loading: true, error: null });

    await handleRequest<IAcademicSession>({
      request: () => api.post(SESSION_ENDPOINT, session),
      onSuccess: async (response) => {
        const created = response.data
          ? normalizeSession(response.data)
          : undefined;

        result.success = true;
        result.message = response.message ?? "Session created";
        result.data = created;

        // The server is the source of truth for "current" — refetch it.
        // Do this after the result is filled so a slow refetch can't
        // swallow the create-success response.
        set({ loading: false, error: null });
        await get().getCurrentSession();
      },
      onError: (error) => {
        const { message, errors } = resolveError(error, CREATE_SESSION_ERROR);
        set({ error: message, loading: false });
        result.success = false;
        result.message = message;
        result.errors = errors;
      },
      showToast: true,
    });

    return result;
  },

  getCurrentSession: async () => {
    const result: RequestResponse<CurrentAcademicSession> = {
      success: false,
      message: "",
    };
    set({ loading: true, error: null });

    await handleRequest<CurrentAcademicSession>({
      request: () => api.get(`${SESSION_ENDPOINT}/current`),
      onSuccess: (response) => {
        if (!response.data) {
          set({ loading: false });
          result.success = false;
          result.message = "No current session returned.";
          return;
        }

        const normalized = normalizeCurrentSession(response.data);
        set({ currentSession: normalized, loading: false, error: null });
        result.success = true;
        result.message = (response.message as string) ?? "";
        result.data = normalized;
      },
      onError: (error) => {
        const { message } = resolveError(error, FETCH_CURRENT_ERROR);
        set({ error: message, loading: false });
        result.success = false;
        result.message = message;
      },
      showToast: false,
    });

    return result;
  },

  getSessions: async () => {
    const result: RequestResponse<IAcademicSession[]> = {
      success: false,
      message: "",
    };
    set({ loading: true, error: null });

    await handleRequest<IAcademicSession[]>({
      request: () => api.get(SESSION_ENDPOINT),
      onSuccess: (response) => {
        const raw = Array.isArray(response.data) ? response.data : [];
        const sessions = raw.map(normalizeSession);

        set({ sessions, loading: false, error: null });
        result.success = true;
        result.message = (response.message as string) ?? "";
        result.data = sessions;
      },
      onError: (error) => {
        const { message } = resolveError(error, FETCH_SESSIONS_ERROR);
        set({ error: message, loading: false });
        result.success = false;
        result.message = message;
      },
      showToast: false,
    });

    return result;
  },

  getPastSessions: async () => {
    const result: RequestResponse<IAcademicSession[]> = {
      success: false,
      message: "",
    };
    set({ loading: true, error: null });

    await handleRequest<IAcademicSession[]>({
      request: () => api.get(`${SESSION_ENDPOINT}/past`),
      onSuccess: (response) => {
        const raw = Array.isArray(response.data) ? response.data : [];
        const pastSessions = raw.map(normalizeSession);

        set({ pastSessions, loading: false, error: null });
        result.success = true;
        result.message = (response.message as string) ?? "";
        result.data = pastSessions;
      },
      onError: (error) => {
        const { message } = resolveError(error, FETCH_PAST_ERROR);
        set({ error: message, loading: false });
        result.success = false;
        result.message = message;
      },
      showToast: false,
    });

    return result;
  },

  /* -------------------------------- Terms ------------------------------- */

  createTerm: async (sessionId, payload) => {
    const result: RequestResponse<ITerm> = {
      success: false,
      message: CREATE_TERM_ERROR,
    };
    set({ loading: true, error: null });

    await handleRequest<ITerm>({
      request: () =>
        api.post(
          `${SESSION_ENDPOINT}/${sessionId}/terms`,
          serializeTermDates(payload),
        ),
      onSuccess: (response) => {
        if (!response.data) {
          set({ loading: false });
          result.success = false;
          result.message = CREATE_TERM_ERROR;
          return;
        }

        const term = normalizeTerm(response.data);
        const current = get().currentSession;

        result.success = true;
        result.message = response.message ?? "Term created";
        result.data = term;

        set({
          loading: false,
          error: null,
          ...(current
            ? {
                currentSession: {
                  ...current,
                  terms: [...(current.terms ?? []), term],
                },
              }
            : {}),
        });
      },
      onError: (error) => {
        const { message, errors } = resolveError(error, CREATE_TERM_ERROR);
        set({ error: message, loading: false });
        result.success = false;
        result.message = message;
        result.errors = errors;
      },
      showToast: true,
    });

    return result;
  },

  updateTerm: async (sessionId, termId, payload) => {
    const result: RequestResponse<ITerm> = {
      success: false,
      message: UPDATE_TERM_ERROR,
    };
    set({ loading: true, error: null });

    await handleRequest<ITerm>({
      request: () =>
        api.patch(
          `${SESSION_ENDPOINT}/${sessionId}/terms/${termId}`,
          serializeTermDates(payload),
        ),
      onSuccess: (response) => {
        if (!response.data) {
          set({ loading: false });
          result.success = false;
          result.message = UPDATE_TERM_ERROR;
          return;
        }

        const term = normalizeTerm(response.data);
        const current = get().currentSession;

        result.success = true;
        result.message = response.message ?? "Term updated";
        result.data = term;

        set({
          loading: false,
          error: null,
          ...(current
            ? {
                currentSession: {
                  ...current,
                  terms: current.terms?.map((t) =>
                    t.id === term.id ? term : t,
                  ),
                },
              }
            : {}),
        });
      },
      onError: (error) => {
        const { message, errors } = resolveError(error, UPDATE_TERM_ERROR);
        set({ error: message, loading: false });
        result.success = false;
        result.message = message;
        result.errors = errors;
      },
      showToast: true,
    });

    return result;
  },

  deleteTerm: async (sessionId, termId) => {
    const result: RequestResponse<null> = {
      success: false,
      message: DELETE_TERM_ERROR,
    };
    set({ loading: true, error: null });

    await handleRequest({
      request: () =>
        api.delete(`${SESSION_ENDPOINT}/${sessionId}/terms/${termId}`),
      onSuccess: (response) => {
        const current = get().currentSession;

        result.success = true;
        result.message = response.message ?? "Term deleted";

        set({
          loading: false,
          error: null,
          ...(current
            ? {
                currentSession: {
                  ...current,
                  terms: current.terms?.filter((t) => t.id !== termId),
                },
              }
            : {}),
        });
      },
      onError: (error) => {
        const { message } = resolveError(error, DELETE_TERM_ERROR);
        set({ error: message, loading: false });
        result.success = false;
        result.message = message;
      },
      showToast: true,
    });

    return result;
  },
}));