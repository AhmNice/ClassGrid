import React, { createContext,  useState, useEffect, useContext } from "react";

interface SidebarContextType {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  closeSidebar: () => void;
  openSidebar: () => void;
  isMobile: boolean;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

const getIsMobile = () =>
  typeof window !== "undefined" && window.innerWidth < 1024;

export const SidebarProvider = ({ children }: { children: React.ReactNode }) => {
  const [isMobile, setIsMobile] = useState(getIsMobile);
  // Start closed on mobile, open on desktop — computed once, correctly, up front.
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => !getIsMobile());

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile((prevMobile) => {
        // Only force the sidebar open/closed when crossing the breakpoint,
        // not on every resize event, so a manual close/open on desktop persists.
        if (mobile !== prevMobile) {
          setIsSidebarOpen(!mobile);
        }
        return mobile;
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSidebar = () => setIsSidebarOpen((open) => !open);
  const closeSidebar = () => setIsSidebarOpen(false);
  const openSidebar = () => setIsSidebarOpen(true);

  return (
    <SidebarContext.Provider
      value={{ isSidebarOpen, toggleSidebar, closeSidebar, openSidebar, isMobile }}
    >
      {children}
    </SidebarContext.Provider>
  );
};
// The hook intentionally shares this module with the provider's context.
// eslint-disable-next-line react-refresh/only-export-components
export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
};
