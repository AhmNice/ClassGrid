import { Plus, SlidersHorizontal } from "lucide-react";
import { useEffect, useState } from "react";
import AddTermModal from "../../components/modal/AddTermModal";
import { getTermStatus, startOfDay } from "../../utils/sessionUtils";
import TermCard from "../TermCard";
import type {
  CurrentAcademicSession,
  ITerm,
} from "../../interface/AcademicSession.interface";
import { useAcademicSessionStore } from "../../store/academic-session.store";

/* ------------------------------- side header ------------------------------ */
export type TermName = "FIRST" | "SECOND" | "THIRD";
const TERM_NAMES: TermName[] = ["FIRST", "SECOND", "THIRD"];

const SideHeader = () => {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-2">
        <SlidersHorizontal className="text-primary font-bold" size={16} aria-hidden="true" />
      <h2 className="font-heading text-sm font-bold text-primary">
        Cycle Parameters
      </h2>
      </div>

    </div>
  );
};

/* ------------------------------- main header ------------------------------ */

interface AddTermButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

const AddTermButton = ({ onClick, disabled }: AddTermButtonProps) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    title={disabled ? "All terms have been added" : undefined}
    className="inline-flex cursor-pointer items-center gap-space-xs rounded-sm border border-outline-variant px-space-md py-space-xs text-xs font-medium text-on-surface transition-colors hover:bg-surface-container focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-60 motion-reduce:transition-none"
  >
    <Plus size={14} strokeWidth={2} aria-hidden="true" />
    Add term
  </button>
);

interface MainHeaderProps {
  /** Leave out to hide the button (for example, when there is no session). */
  onAddTerm?: () => void;
  addDisabled?: boolean;
}

const MainHeader = ({ onAddTerm, addDisabled }: MainHeaderProps) => {
  return (
    <div className="flex items-center justify-between gap-4">
      <h2 className="font-heading text-sm font-bold text-primary">
        Academic Terms Configuration
      </h2>
      <div className="flex items-center gap-space-sm">
        <span className="rounded-full bg-on-surface-variant/15 px-space-sm py-space-xs font-mono text-xs font-medium text-on-surface-variant">
          cycle 2026/2027
        </span>
        {onAddTerm && <AddTermButton onClick={onAddTerm} disabled={addDisabled} />}
      </div>
    </div>
  );
};

/* ---------------------------------- side ---------------------------------- */

const Side = () => {
  return (
    <div className="flex flex-col gap-space-sm">
      <SideHeader />
      {/* side content */}
    </div>
  );
};

/* ---------------------------------- main ---------------------------------- */


const Main = () => {
  // MOCK_TODAY is gone with the mock data, so use the real date.
  const today = startOfDay(new Date());
  const current: CurrentAcademicSession | null =
    useAcademicSessionStore((state) => state.currentSession) ?? null;

  const [terms, setTerms] = useState<ITerm[]>(current?.terms ?? []);
  useEffect(() => {
    setTimeout(()=>{
      setTerms(current?.terms ?? []);
    },0)
  }, [current]);

  // `null` = closed. `{}` = adding. `{ term }` = editing that term.
  const [modal, setModal] = useState<{ term?: ITerm } | null>(null);

  const allAdded = terms.length >= TERM_NAMES.length;



  return (
    <div className="flex flex-col gap-space-sm">
      <MainHeader
        onAddTerm={current ? () => setModal({}) : undefined}
        addDisabled={allAdded}
      />

      {terms.length > 0 ? (
        terms.map((term) => (
          <TermCard
            key={term.id}
            term={term}
            status={getTermStatus(term, today)}
            onEditDates={(t) => setModal({ term: t })}
            onDelete={() => {
              setTerms((prev) => prev.filter((t) => t.id !== term.id));
            }}
          />
        ))
      ) : (
        <div className="flex flex-col items-start gap-space-md rounded-sm border border-dashed border-outline-variant p-space-lg">
          <p className="text-sm text-on-surface-variant">
            {current
              ? "This session has no terms yet. Add terms to start planning its timetables."
              : "No current session. Add one to set up its terms."}
          </p>
          {current && <AddTermButton onClick={() => setModal({})} />}
        </div>
      )}

      {modal && current && (
        <AddTermModal
          sessionId={current.id}
          sessionStart={current.startDate}
          sessionEnd={current.endDate}
          existingTerms={terms}
          term={modal.term}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
};

/* --------------------------------- content -------------------------------- */

const Content = () => {
  return (
    <div className="sm:grid sm:grid-cols-3 gap-space-lg">
      <div className="col-span-2">
        <Main />
      </div>
      <div>
        <Side />
      </div>
    </div>
  );
};

export default Content;