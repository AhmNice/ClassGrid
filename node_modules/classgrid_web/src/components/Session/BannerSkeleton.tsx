const BannerSkeleton = () => (
  <div
    role="status"
    aria-busy="true"
    className="flex flex-col gap-space-lg rounded-sm bg-surface-container p-space-lg motion-safe:animate-pulse lg:flex-row lg:items-center lg:justify-between"
  >
    <span className="sr-only">Loading current session…</span>

    <div className="space-y-space-sm">
      <div className="h-5 w-48 max-w-full rounded-full bg-surface-container-highest" />
      <div className="h-8 w-72 max-w-full rounded-sm bg-surface-container-highest" />
      <div className="h-4 w-96 max-w-full rounded-sm bg-surface-container-highest" />
    </div>

    <div className="flex gap-space-md">
      <div className="h-24 w-full rounded-sm bg-surface-container-highest sm:w-60" />
      <div className="hidden h-24 w-32 rounded-sm bg-surface-container-highest sm:block" />
    </div>
  </div>
);

export default BannerSkeleton;