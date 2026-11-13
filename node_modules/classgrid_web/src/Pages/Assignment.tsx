import {
  ArrowRight,
  LibraryBig,
  UserCheck,
  UserCog,
  type LucideIcon,
} from "lucide-react";
import { Link } from "react-router-dom";
import MainLayout from "../layout/MainLayout";

interface AssignmentFunction {
  to: string;
  step: string;
  title: string;
  description: string;
  actionLabel: string;
  Icon: LucideIcon;
}

const FUNCTIONS: AssignmentFunction[] = [
  {
    to: "/assignments/subjects",
    step: "Step 1",
    title: "Assign Subjects to Class Levels",
    description:
      "Manage the subjects offered by each class level, so every level has its own list of what it studies.",
    actionLabel: "Assign subjects",
    Icon: LibraryBig,
  },
  {
    to: "/assignments/teacher-subjects",
    step: "Step 2",
    title: "Assign Subjects to Teachers",
    description:
      "Set which subjects each teacher is qualified to teach, so they can later be matched to class arm and subject combinations.",
    actionLabel: "Assign subjects to teachers",
    Icon: UserCog,
  },
  {
    to: "/assignments/teachers",
    step: "Step 3",
    title: "Assign Teachers to Class Subjects",
    description:
      "Assign eligible teachers to specific class arm and subject combinations, once the subjects are set.",
    actionLabel: "Assign teachers",
    Icon: UserCheck,
  },
];

const Assignments = () => {
  return (
    <MainLayout>
      <section className="flex flex-col gap-space-lg">
        <header className="rounded-sm bg-primary-container p-space-lg">
          <h1 className="font-heading text-2xl font-bold text-on-primary-container">
            Assignments
          </h1>
          <p className="mt-space-xs max-w-2xl text-sm leading-relaxed text-on-primary-container">
            Decide what each class arm studies, then choose who teaches it.
            Start with subjects, because teachers are assigned to the subjects
            an arm already offers.
          </p>
        </header>

        <ul className="grid gap-space-md md:grid-cols-2">
          {FUNCTIONS.map(
            ({ to, step, title, description, actionLabel, Icon }) => (
              <li key={to} className="flex">
                {/* The link stretches over the whole card, so the card is one
                  big target, but screen readers still get a clear link name. */}
                <article className="group relative flex w-full flex-col gap-space-md rounded-sm border border-outline-variant/40 bg-surface p-space-lg transition-colors focus-within:ring-2 focus-within:ring-ring hover:border-primary/50 hover:bg-surface-container-low motion-reduce:transition-none">
                  <div className="flex items-start justify-between gap-space-md">
                    <span className="grid h-12 w-12 place-items-center rounded-sm bg-primary-container text-on-primary-container">
                      <Icon size={24} strokeWidth={1.75} aria-hidden="true" />
                    </span>
                    <span className="rounded-sm bg-surface-container px-space-sm py-space-xs font-mono text-xs font-medium text-on-surface-variant">
                      {step}
                    </span>
                  </div>

                  <div className="space-y-space-xs">
                    <h2 className="font-heading text-lg font-bold text-on-surface">
                      {title}
                    </h2>
                    <p className="text-sm leading-relaxed text-on-surface-variant">
                      {description}
                    </p>
                  </div>

                  <Link
                    to={to}
                    aria-label={title}
                    className="mt-auto inline-flex items-center gap-space-xs self-start text-sm font-medium text-primary outline-none after:absolute after:inset-0"
                  >
                    {actionLabel}
                    <ArrowRight
                      size={16}
                      aria-hidden="true"
                      className="transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0"
                    />
                  </Link>
                </article>
              </li>
            ),
          )}
        </ul>
      </section>
    </MainLayout>
  );
};

export default Assignments;
