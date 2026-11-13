type FancyLoaderProps = {
  label?: string;
};

const FancyLoader = ({ label = "Loading…" }: FancyLoaderProps) => {
  return (
    <div className="flex flex-col items-center justify-center h-screen gap-8 bg-background overflow-hidden">
      {/* Bouncing mark — the one bold, animated element */}
      <div className="flex items-end gap-2 h-10" aria-hidden="true">
        <span className="fancy-loader-dot h-3 w-3 rounded-full bg-primary" />
        <span
          className="fancy-loader-dot h-3 w-3 rounded-full bg-primary"
          style={{ animationDelay: "0.15s" }}
        />
        <span
          className="fancy-loader-dot h-3 w-3 rounded-full bg-primary"
          style={{ animationDelay: "0.3s" }}
        />
      </div>

      {/* Quiet wordmark + label */}
      <div className="text-center">
        <p className="fancy-loader-shimmer font-heading text-lg font-semibold tracking-tight">
          ClassGrid
        </p>
        <p
          className="font-body text-body-sm text-on-surface-variant mt-1"
          role="status"
        >
          {label}
        </p>
      </div>

      <style>{`
        .fancy-loader-dot {
          animation: fancy-loader-bounce 0.9s cubic-bezier(0.45, 0, 0.55, 1) infinite;
        }
        @keyframes fancy-loader-bounce {
          0%, 80%, 100% {
            transform: translateY(0);
            opacity: 0.6;
          }
          40% {
            transform: translateY(-14px);
            opacity: 1;
          }
        }
        .fancy-loader-shimmer {
          background: linear-gradient(
            100deg,
            var(--tw-prose-body, currentColor) 40%,
            var(--color-primary, #6d5efc) 50%,
            var(--tw-prose-body, currentColor) 60%
          );
          background-size: 200% 100%;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          animation: fancy-loader-shimmer 2.2s ease-in-out infinite;
        }
        @keyframes fancy-loader-shimmer {
          0% {
            background-position: 120% 0;
          }
          100% {
            background-position: -20% 0;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .fancy-loader-dot,
          .fancy-loader-shimmer {
            animation: none;
          }
          .fancy-loader-dot {
            opacity: 0.6;
          }
          .fancy-loader-shimmer {
            color: inherit;
            background: none;
          }
        }
      `}</style>
    </div>
  );
};

const FullScreenLoader = ({ label }: { label: string }) => (
  <div className="flex flex-col items-center justify-center h-screen gap-3 bg-background">
    {/* <Loader2 className="h-6 w-6 animate-spin text-primary" aria-hidden="true" /> */}
    <FancyLoader label={label} />
    <p className="font-body text-body-sm text-on-surface-variant" role="status">
      {label}
    </p>
  </div>
);

export  { FancyLoader, FullScreenLoader };
