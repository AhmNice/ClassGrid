import { School } from "lucide-react";
import { useEffect, useState } from "react";
import ClassCard from "../components/class/ClassCard";
import AddClass_armModal, {
  type ClassLevelUpdate,
} from "../components/modal/AddClass_armModal";
import TitleCard from "../components/TitleCard";
import type {
  ClassStage,
  IClassLevel,
  IClassLevelCreate,
} from "../interface/class.interface";
import MainLayout from "../layout/MainLayout";
import { useClassStore } from "../store/class.store";

// The order the groups appear in, and what each is called.
const STAGES: { stage: ClassStage; heading: string }[] = [
  { stage: "JSS", heading: "Junior secondary (JSS)" },
  { stage: "SS", heading: "Senior secondary (SS)" },
];

const GRID = "grid gap-space-md sm:grid-cols-2 xl:grid-cols-3";

const ClassCardSkeleton = () => (
  <div className="flex animate-pulse flex-col gap-space-md rounded-sm border border-l-4 border-outline-variant/40 border-l-outline-variant bg-surface p-space-md">
    <div className="flex items-start justify-between gap-space-sm">
      <div className="space-y-space-sm">
        <div className="h-5 w-24 rounded-sm bg-surface-container-high" />
        <div className="h-3 w-36 rounded-sm bg-surface-container-high" />
      </div>
      <div className="h-6 w-16 rounded-full bg-surface-container-high" />
    </div>
    <div className="h-3 w-16 rounded-sm bg-surface-container-high" />
    <div className="flex justify-end">
      <div className="h-8 w-14 rounded-sm bg-surface-container-high" />
    </div>
  </div>
);

const ClassLevel = () => {
  const createClassLevel = useClassStore((s) => s.createClassLevel);
  const updateClassLevel = useClassStore((s) => s.updateClassLevel);
  const getClassLevels = useClassStore((s) => s.getClassLevels);
  const classLevels = useClassStore((s) => s.classes);
  const isFetching = useClassStore((s) => s.loading);
  const error = useClassStore((s) => s.error);

  // `null` = closed. `{}` = adding. `{ level }` = editing that class level.
  const [modal, setModal] = useState<{ level?: IClassLevel } | null>(null);

  // True once the first fetch has finished, so we don't flash "No classes yet".
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    let cancelled = false;
    getClassLevels().finally(() => {
      if (!cancelled) setLoaded(true);
    });
    return () => {
      cancelled = true;
    };
  }, [getClassLevels]);

  const showSkeleton = isFetching || !loaded;

  // The modal closes itself when this finishes normally. Throwing keeps it
  // open and shows the message inside the form.
  const handleSubmit = async (values: IClassLevelCreate | ClassLevelUpdate) => {
    const editing = modal?.level;

    const res = editing
      ? await updateClassLevel(editing.id, values)
      : await createClassLevel(values as IClassLevelCreate);

    if (!res.success) {
      throw new Error(res.message);
    }
  };

  const groups = STAGES.map(({ stage, heading }) => ({
    stage,
    heading,
    levels: classLevels.filter((level) => level.stage === stage),
  })).filter((group) => group.levels.length > 0);

  return (
    <MainLayout>
      <section className="flex flex-col gap-3">
        {modal && (
          <AddClass_armModal
            type="CLASS"
            classLevel={modal.level}
            onClose={() => setModal(null)}
            onSubmit={handleSubmit}
          />
        )}

        <TitleCard
          secondaryAction={{
            label: "View Class Arms",
            to: "/classes",
            icon: <School size={16} strokeWidth={2} />,
          }}
          title="Class Level Management"
          actionLabel="Add New Class Level"
          onButtonClick={() => setModal({})}
          description="Configure student cohorts, stream tracks (Sciences, Arts), assigned form tutors, base homeroom allocations, and period loads."
        />

        {showSkeleton ? (
          <div aria-busy="true" className={GRID}>
            <span className="sr-only" role="status">
              Loading classes…
            </span>
            {Array.from({ length: 6 }).map((_, i) => (
              <ClassCardSkeleton key={i} />
            ))}
          </div>
        ) : error && classLevels.length === 0 ? (
          /* LOAD ERROR */
          <div
            role="alert"
            className="flex flex-col items-center justify-center rounded-sm border border-dashed border-outline-variant bg-surface px-4 py-16 text-center"
          >
            <p className="mb-4 text-sm text-on-surface-variant">{error}</p>
            <button
              type="button"
              onClick={() => getClassLevels()}
              className="cursor-pointer rounded-sm border border-outline-variant px-space-md py-space-sm text-sm font-medium text-on-surface transition-colors hover:bg-surface-container focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Try again
            </button>
          </div>
        ) : groups.length > 0 ? (
          /* CLASSES, GROUPED BY STAGE */
          groups.map((group) => (
            <section
              key={group.stage}
              aria-labelledby={`stage-${group.stage}`}
              className="space-y-space-sm"
            >
              <h2
                id={`stage-${group.stage}`}
                className="flex items-baseline gap-space-sm font-heading text-sm font-bold text-primary"
              >
                {group.heading}
                <span className="font-mono text-xs font-medium text-on-surface-variant">
                  {group.levels.length}{" "}
                  {group.levels.length === 1 ? "class" : "classes"}
                </span>
              </h2>

              <div className={GRID}>
                {group.levels.map((level) => (
                  <ClassCard
                    key={level.id}
                    classLevel={level}
                    onEdit={(l) => setModal({ level: l })}
                  />
                ))}
              </div>
            </section>
          ))
        ) : (
          /* EMPTY STATE */
          <div className="flex flex-col items-center justify-center rounded-sm border border-outline-variant/40 bg-surface px-4 py-16 text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-surface-container text-on-surface-variant">
              <School size={24} aria-hidden="true" />
            </div>
            <h3 className="mb-1 text-sm font-medium text-on-surface">
              No classes added yet
            </h3>
            <p className="mb-6 max-w-sm text-sm text-on-surface-variant">
              Start with your class levels, such as JSS 1 or SS 2. You can add
              arms to each one afterwards.
            </p>
            <button
              type="button"
              onClick={() => setModal({})}
              className="cursor-pointer rounded-sm bg-primary px-space-md py-space-sm text-sm font-medium text-on-primary transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Add New Class Level
            </button>
          </div>
        )}
      </section>
    </MainLayout>
  );
};

export default ClassLevel;