import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Construction, Home } from "lucide-react";
import MainLayout from "../layout/MainLayout";

interface NotImplementedPageProps {
  /** What the user tried to reach. Defaults to the current path. */
  feature?: string;
  /** Optional extra context, e.g. "Coming in the next release". */
  note?: string;
}

const NotImplementedPage = ({
  feature,
  note = "This page hasn't been built yet. Check back soon.",
}: NotImplementedPageProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const path = feature ?? location.pathname;

  return (
    <MainLayout>
      <section className="flex min-h-[60vh] flex-col items-center justify-center gap-space-lg p-space-xl text-center">
        <span
          aria-hidden="true"
          className="grid h-16 w-16 place-items-center rounded-full bg-surface-container text-on-surface-variant"
        >
          <Construction size={28} strokeWidth={1.75} />
        </span>

        <div className="max-w-md space-y-space-sm">
          <h1 className="font-heading text-2xl font-semibold text-on-surface">
            Not implemented yet
          </h1>
          <p className="text-sm text-on-surface-variant">{note}</p>
          <p className="font-mono text-xs text-on-surface-variant/70">
            {path}
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-space-sm">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-space-xs rounded-sm border border-outline-variant px-space-lg py-space-sm text-sm font-medium text-on-surface transition-colors hover:bg-surface-container focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
          >
            <ArrowLeft size={14} aria-hidden="true" />
            Go back
          </button>
          <Link
            to="/"
            className="inline-flex items-center gap-space-xs rounded-sm bg-primary px-space-lg py-space-sm text-sm font-medium text-on-primary transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
          >
            <Home size={14} aria-hidden="true" />
            Go to dashboard
          </Link>
        </div>
      </section>
    </MainLayout>
  );
};

export default NotImplementedPage;