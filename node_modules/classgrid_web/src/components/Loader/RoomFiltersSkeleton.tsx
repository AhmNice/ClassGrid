
const RoomFiltersSkeleton = () => {
  return (
    <div
      role="status"
      aria-label="Loading room filters"
      className="space-y-4 rounded-md border border-outline-variant/40 bg-surface p-4"
    >
      {/* Search & Type Chips */}
      <div className="flex flex-wrap items-center gap-space-sm">
        <div className="flex flex-wrap items-center gap-space-sm sm:flex-nowrap">
          {/* Search Input */}
          <div className="relative w-full shrink-0 sm:w-52">
            <div className="h-8 w-full animate-pulse rounded-sm bg-surface-container" />
          </div>

          {/* Type Filter Chips */}
          <div className="grid grid-cols-2 gap-space-sm sm:flex">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="h-7 w-20 animate-pulse rounded-sm bg-surface-container"
              />
            ))}
          </div>
        </div>

        {/* Capacity Filter */}
        <div className="flex w-full flex-col gap-1.5 sm:w-44">
          <div className="h-3 w-28 animate-pulse rounded-sm bg-surface-container" />
          <div className="h-8 w-full animate-pulse rounded-sm bg-surface-container" />
        </div>

        {/* Clear Filters */}
        <div className="flex items-end sm:justify-end">
          <div className="h-8 w-24 animate-pulse rounded-sm bg-surface-container" />
        </div>
      </div>

      <span className="sr-only">Loading...</span>
    </div>
  );
};

export default RoomFiltersSkeleton;
