import { useId, useState } from "react";
import type {
  IAcademicSession,
  ITerm,
} from "../../interface/AcademicSession.interface";

interface QueryFieldProps {
  setQuery: (query: { sessionId: string; termId: string }) => void;
  sessions: IAcademicSession[];
  terms: ITerm[];
}

const SELECT_CLASS =
  "w-full rounded-sm border border-(--input-border) bg-(--input-bg) px-space-md py-space-sm text-sm text-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60";

const LABEL_CLASS =
  "text-xs font-medium uppercase tracking-wide text-on-surface-variant";

const QueryField = ({ setQuery, sessions, terms }: QueryFieldProps) => {
  const sessionSelectId = useId();
  const termSelectId = useId();

  const [sessionId, setSessionId] = useState<string>("");
  const [termId, setTermId] = useState<string>("");

  const setSession = (value: string) => {
    setSessionId(value);
    setTermId(""); // Reset term when the session changes.
    setQuery({ sessionId: value, termId: "" });
  };

  const setTerm = (value: string) => {
    setTermId(value);
    setQuery({ sessionId, termId: value });
  };

  return (
    <div className="flex w-full flex-wrap gap-space-md rounded-md p-space-md">
      <div className="flex w-full flex-col gap-space-xs sm:w-64">
        <label htmlFor={sessionSelectId} className={LABEL_CLASS}>
          Session
        </label>
        <select
          id={sessionSelectId}
          value={sessionId}
          onChange={(e) => setSession(e.target.value)}
          className={SELECT_CLASS}
        >
          <option value="" disabled>
            Select a session…
          </option>
          {sessions.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex w-full flex-col gap-space-xs sm:w-64">
        <label htmlFor={termSelectId} className={LABEL_CLASS}>
          Term
        </label>
        <select
          id={termSelectId}
          value={termId}
          onChange={(e) => setTerm(e.target.value)}
          disabled={!sessionId || terms.length === 0}
          className={SELECT_CLASS}
        >
          <option value="" disabled>
            {!sessionId
              ? "Select a session first"
              : terms.length === 0
                ? "No terms available"
                : "Select a term…"}
          </option>
          {terms.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default QueryField;