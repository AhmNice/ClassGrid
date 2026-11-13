import { Search } from "lucide-react";
import toast from "react-hot-toast";

const SearchButton = () => {
  const openCommandPalette = () => {
    toast.success("Todo: Implement command palette functionality");
  };

  return (
    <button
      type="button"
      onClick={openCommandPalette}
      aria-label="Search (Command K)"
      className="hidden h-9 w-64 items-center gap-2 rounded-lg border border-outline-variant/40 bg-surface px-3 text-sm text-on-surface-variant transition-colors hover:bg-surface-container focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background md:flex"
    >
      <Search size={16} strokeWidth={1.75} aria-hidden="true" className="shrink-0" />
      <span className="flex-1 truncate text-left">Search…</span>
      <kbd className="shrink-0 rounded border border-outline-variant/40 bg-surface-container px-1.5 py-0.5 font-mono text-[10px] leading-none text-on-surface-variant/80">
        ⌘K
      </kbd>
    </button>
  );
};

export default SearchButton;