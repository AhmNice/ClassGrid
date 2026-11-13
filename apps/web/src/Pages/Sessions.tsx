import { CalendarX } from "lucide-react";
import React, { useEffect } from "react";
import MainLayout from "../layout/MainLayout";
import TitleCard from "../components/TitleCard";
import Banner from "../components/Session/Banner";
import BannerSkeleton from "../components/Session/BannerSkeleton";
import AddSessionModal from "../components/modal/AddSessionModal";
import Content from "../components/Session/Content";
import type { IAcademicSessionCreate } from "../interface/AcademicSession.interface";
import { useAcademicSessionStore } from "../store/academic-session.store";
import { useAuthStore } from "../store/auth.store";

const Sessions = () => {
  const [openAddModal, setOpenAddModal] = React.useState(false);
  // True until the first fetch of the current session has finished.
  const [loading, setLoading] = React.useState(true);

  const createSession = useAcademicSessionStore((state) => state.createSession);
  const getCurrentSession = useAcademicSessionStore(
    (state) => state.getCurrentSession,
  );
  const currentSession = useAcademicSessionStore(
    (state) => state.currentSession,
  );
  const user = useAuthStore((state) => state.user);

  // Read straight from the user, so there is no copy to keep in sync.
  const schoolId = user?.schoolId ?? null;

  // One fetch, once the user (and so the school) is known.
  useEffect(() => {
    if (!schoolId) return;

    let cancelled = false;
    const loadingTimer = window.setTimeout(() => {
      if (!cancelled) setLoading(true);
    }, 0);

    Promise.resolve(getCurrentSession()).finally(() => {
      window.clearTimeout(loadingTimer);
      if (!cancelled) setLoading(false);
    });

    return () => {
      cancelled = true;
      window.clearTimeout(loadingTimer);
    };
  }, [schoolId, getCurrentSession]);

  const handleOpenAddModal = () => {
    setOpenAddModal((prev) => !prev);
  };

  const onSubmit = async (data: IAcademicSessionCreate) => {
    const res = await createSession(data);
    return res;
  };

  return (
    <MainLayout>
      <section className="flex flex-col gap-3">
        <TitleCard onButtonClick={handleOpenAddModal} />

        {loading ? (
          <BannerSkeleton />
        ) : currentSession ? (
          <Banner {...currentSession} />
        ) : (
          <div className="flex flex-col items-center gap-space-sm rounded-sm border border-dashed border-outline-variant p-space-xl text-center">
            <CalendarX
              size={28}
              strokeWidth={1.75}
              aria-hidden="true"
              className="text-on-surface-variant"
            />
            <h2 className="font-heading text-lg font-semibold text-on-surface">
              No current session
            </h2>
            <p className="max-w-md text-sm text-on-surface-variant">
              Use “Add new session” above and mark it as the current session to
              start setting up terms and timetables.
            </p>
          </div>
        )}

        {openAddModal && schoolId && (
          <AddSessionModal
            schoolId={schoolId}
            onClose={handleOpenAddModal}
            onSubmit={onSubmit}
          />
        )}

        <Content />
      </section>
    </MainLayout>
  );
};

export default Sessions;
