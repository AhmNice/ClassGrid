// import { ArrowLeft } from "lucide-react";
// import { Link, useParams } from "react-router-dom";
// import TermCard from "../components/TermCard";
// import {
//   MOCK_SESSIONS,
//   MOCK_TERMS,
//   MOCK_TODAY,
//   type IAcademicSession,
// } from "../data/sessions.mock";
// import {
//   formatDate,
//   formatRange,
//   getTermStatus,
//   startOfDay,
//   weeksBetween,
// } from "../utils/sessionUtils";
// import MainLayout from "../layout/MainLayout";

// // Swap for `new Date()` once the data is real.
// const TODAY = MOCK_TODAY;

// /* --------------------------------- helpers -------------------------------- */

// type SessionStatus = "current" | "upcoming" | "completed" | "inactive";

// const getSessionStatus = (session: IAcademicSession, today: Date): SessionStatus => {
//   if (session.isCurrent) return "current";
//   if (session.startDate && startOfDay(session.startDate) > today) return "upcoming";
//   if (session.endDate && startOfDay(session.endDate) < today) return "completed";
//   return "inactive";
// };

// const STATUS_BADGE: Record<SessionStatus, { label: string; className: string }> = {
//   current: {
//     label: "Current",
//     className: "bg-success-container text-on-success-container",
//   },
//   upcoming: {
//     label: "Upcoming",
//     className: "bg-info-container text-on-info-container",
//   },
//   completed: {
//     label: "Completed",
//     className: "bg-surface-container text-on-surface-variant",
//   },
//   inactive: {
//     label: "Not current",
//     className: "bg-surface-container text-on-surface-variant",
//   },
// };

// const BACK_LINK =
//   "inline-flex items-center gap-space-xs rounded-sm text-sm text-on-surface-variant transition-colors hover:text-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none";

// interface InfoTileProps {
//   label: string;
//   value: string;
//   mono?: boolean;
// }

// const InfoTile = ({ label, value, mono }: InfoTileProps) => (
//   <div className="rounded-sm bg-surface-container p-space-md">
//     <dt className="text-xs text-on-surface-variant">{label}</dt>
//     <dd
//       className={
//         mono
//           ? "mt-space-xs font-mono text-sm font-medium text-on-surface"
//           : "mt-space-xs text-sm font-medium text-on-surface"
//       }
//     >
//       {value}
//     </dd>
//   </div>
// );

// /* ---------------------------------- page ---------------------------------- */

// const SessionDetails = () => {
//   const { id } = useParams<{ id: string }>();
//   const today = startOfDay(TODAY);

//   const session = MOCK_SESSIONS.find((s) => (s.id).toLocaleLowerCase() === id);

//   if (!session) {
//     return (
//    <MainLayout>
//        <div className="flex flex-col gap-space-md">
//         <Link to="/sessions/past" className={BACK_LINK}>
//           <ArrowLeft size={16} aria-hidden="true" />
//           Back to past sessions
//         </Link>
//         <p
//           role="status"
//           className="rounded-sm border border-dashed border-outline-variant p-space-xl text-center text-sm text-on-surface-variant"
//         >
//           We couldn’t find that session. It may have been removed.
//         </p>
//       </div>
//    </MainLayout>
//     );
//   }

//   const status = getSessionStatus(session, today);
//   const badge = STATUS_BADGE[status];

//   const terms = MOCK_TERMS.filter((t) => t.sessionId === session.id).sort(
//     (a, b) => a.startDate.getTime() - b.startDate.getTime()
//   );
//   const published = terms.filter((t) => t.timetableStatus === "published").length;

//   const back =
//     status === "completed"
//       ? { to: "/sessions/past", label: "Back to past sessions" }
//       : { to: "/sessions", label: "Back to sessions & terms" };

//   return (
//    <MainLayout>
//      <div className="flex flex-col gap-space-lg">
//       <header className="space-y-space-sm">
//         <Link to={back.to} className={BACK_LINK}>
//           <ArrowLeft size={16} aria-hidden="true" />
//           {back.label}
//         </Link>

//         <div className="flex flex-wrap items-center justify-between gap-space-md">
//           <div className="min-w-0">
//             <div className="flex flex-wrap items-center gap-space-sm">
//               <h1 className="font-heading text-2xl font-bold text-on-surface">
//                 {session.name} academic session
//               </h1>
//               <span
//                 className={`rounded-full px-space-sm py-space-xs text-xs font-medium ${badge.className}`}
//               >
//                 {badge.label}
//               </span>
//             </div>
//             <p className="mt-space-xs text-sm text-on-surface-variant">
//               Created {formatDate(session.createdAt)} · Last updated{" "}
//               {formatDate(session.updatedAt)}
//             </p>
//           </div>

//           {status === "current" && (
//             <Link
//               to="/sessions"
//               className="inline-flex items-center rounded-sm border border-outline-variant px-space-lg py-space-sm text-sm font-medium text-on-surface transition-colors hover:bg-surface-container focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
//             >
//               Manage terms
//             </Link>
//           )}
//         </div>
//       </header>

//       <dl className="grid gap-space-sm sm:grid-cols-2 lg:grid-cols-4">
//         <InfoTile
//           mono
//           label="Dates"
//           value={formatRange(session.startDate, session.endDate)}
//         />
//         <InfoTile
//           label="Duration"
//           value={
//             session.startDate && session.endDate
//               ? `${weeksBetween(session.startDate, session.endDate)} weeks`
//               : "Not set"
//           }
//         />
//         <InfoTile
//           label="Terms"
//           value={terms.length > 0 ? `${terms.length} terms` : "None recorded"}
//         />
//         <InfoTile
//           label="Timetables"
//           value={
//             terms.length > 0 ? `${published} of ${terms.length} published` : "No terms"
//           }
//         />
//       </dl>

//       <section aria-labelledby="session-terms-heading" className="space-y-space-sm">
//         <h2
//           id="session-terms-heading"
//           className="font-heading text-lg font-semibold text-on-surface"
//         >
//           Terms
//         </h2>

//         {terms.length > 0 ? (
//           <div className="flex flex-col gap-space-sm">
//             {terms.map((term) => (
//               <TermCard
//                 key={term.id}
//                 term={term}
//                 status={getTermStatus(term, today)}
//                 readOnly={status !== "current"}
//               />
//             ))}
//           </div>
//         ) : (
//           <p className="rounded-sm border border-dashed border-outline-variant p-space-lg text-sm text-on-surface-variant">
//             No terms were recorded for this session.
//           </p>
//         )}
//       </section>
//     </div>
//    </MainLayout>
//   );
// };

// export default SessionDetails;
import React from 'react'

const SessionDetails = () => {
  return (
    <div>SessionDetails</div>
  )
}

export default SessionDetails