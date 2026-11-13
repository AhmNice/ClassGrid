// import { ArrowLeft, Search } from "lucide-react";
// import { useId, useState } from "react";
// import { Link } from "react-router-dom";

// import { formatRange, startOfDay, weeksBetween } from "../utils/sessionUtils";
// import MainLayout from "../layout/MainLayout";

// // Swap for `new Date()` once the data is real.
// const TODAY = MOCK_TODAY;

// /* --------------------------------- helpers -------------------------------- */

// const TH = "px-space-md py-space-sm text-left text-xs font-medium";
// const TD = "px-space-md py-space-sm align-middle";

// /** Counts a session's terms and how many have a published timetable. */
// const summarizeTerms = (sessionId: string) => {
//   const terms = MOCK_TERMS.filter((t) => t.sessionId === sessionId);
//   const published = terms.filter((t) => t.timetableStatus === "published").length;
//   return { total: terms.length, published };
// };

// const TimetableBadge = ({ total, published }: { total: number; published: number }) => {
//   if (total === 0) {
//     return (
//       <span className="rounded-full bg-surface-container px-space-sm py-space-xs text-xs font-medium text-on-surface-variant">
//         No term data
//       </span>
//     );
//   }
//   if (published === total) {
//     return (
//       <span className="rounded-full bg-success-container px-space-sm py-space-xs text-xs font-medium text-on-success-container">
//         All terms published
//       </span>
//     );
//   }
//   return (
//     <span className="rounded-full bg-warning-container px-space-sm py-space-xs text-xs font-medium text-on-warning-container">
//       {published} of {total} published
//     </span>
//   );
// };

// /* ---------------------------------- page ---------------------------------- */

// const PastSessions = () => {
//   const [query, setQuery] = useState("");
//   const searchId = useId();
//   const today = startOfDay(TODAY);

//   // Past = already ended and not the current session. Newest first.
//   const pastSessions: IAcademicSession[] = MOCK_SESSIONS.filter(
//     (s) => !s.isCurrent && s.endDate && startOfDay(s.endDate) < today
//   ).sort((a, b) => b.endDate!.getTime() - a.endDate!.getTime());

//   const needle = query.trim().toLowerCase();
//   const visible = pastSessions.filter((s) => s.name.toLowerCase().includes(needle));

//   return (
//    <MainLayout>
//      <div className="flex flex-col gap-space-lg">
//       <header className="space-y-space-sm">
//         <Link
//           to="/sessions"
//           className="inline-flex items-center gap-space-xs rounded-sm text-sm text-on-surface-variant transition-colors hover:text-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
//         >
//           <ArrowLeft size={16} aria-hidden="true" />
//           Back to sessions &amp; terms
//         </Link>

//         <div className="flex flex-col gap-space-md sm:flex-row sm:items-end sm:justify-between">
//           <div>
//             <h1 className="font-heading text-2xl font-bold text-on-surface">
//               Past sessions
//             </h1>
//             <p className="mt-space-xs text-sm text-on-surface-variant">
//               Academic years that have ended. Open one to review its terms and
//               final timetables.
//             </p>
//           </div>

//           {pastSessions.length > 0 && (
//             <div className="relative sm:w-72">
//               <label htmlFor={searchId} className="sr-only">
//                 Filter past sessions by name
//               </label>
//               <Search
//                 size={16}
//                 aria-hidden="true"
//                 className="pointer-events-none absolute left-space-md top-1/2 -translate-y-1/2 text-on-surface-variant"
//               />
//               <input
//                 id={searchId}
//                 type="search"
//                 value={query}
//                 onChange={(e) => setQuery(e.target.value)}
//                 placeholder="Filter by name…"
//                 autoComplete="off"
//                 className="w-full rounded-sm border border-(--input-border) bg-(--input-bg) py-space-sm pl-9 pr-space-md text-sm text-on-surface placeholder:text-on-surface-variant/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
//               />
//             </div>
//           )}
//         </div>
//       </header>

//       {visible.length > 0 ? (
//         <div className="overflow-x-auto rounded-sm border border-outline-variant/40 bg-surface">
//           <table className="w-full min-w-176 border-collapse text-sm">
//             <caption className="sr-only">Past academic sessions</caption>
//             <thead className="bg-surface-container text-on-surface-variant">
//               <tr>
//                 <th scope="col" className={TH}>Session</th>
//                 <th scope="col" className={TH}>Dates</th>
//                 <th scope="col" className={TH}>Duration</th>
//                 <th scope="col" className={TH}>Terms</th>
//                 <th scope="col" className={TH}>Timetables</th>
//                 <th scope="col" className={`${TH} text-right`}>
//                   <span className="sr-only">Actions</span>
//                 </th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-outline-variant/40">
//               {visible.map((session) => {
//                 const { total, published } = summarizeTerms(session.id);
//                 return (
//                   <tr
//                     key={session.id}
//                     className="transition-colors hover:bg-surface-container-low motion-reduce:transition-none"
//                   >
//                     <th scope="row" className={`${TD} text-left font-medium text-on-surface`}>
//                       {session.name}
//                     </th>
//                     <td className={`${TD} font-mono text-on-surface-variant`}>
//                       {formatRange(session.startDate, session.endDate)}
//                     </td>
//                     <td className={`${TD} text-on-surface`}>
//                       {session.startDate && session.endDate
//                         ? `${weeksBetween(session.startDate, session.endDate)} weeks`
//                         : "Not set"}
//                     </td>
//                     <td className={`${TD} text-on-surface`}>
//                       {total > 0 ? `${total} terms` : "None"}
//                     </td>
//                     <td className={TD}>
//                       <TimetableBadge total={total} published={published} />
//                     </td>
//                     <td className={`${TD} text-right`}>
//                       <Link
//                         to={`/sessions/${session.id}`}
//                         aria-label={`View ${session.name} session`}
//                         className="inline-flex rounded-sm border border-outline-variant px-space-md py-space-xs font-medium text-on-surface transition-colors hover:bg-surface-container focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-surface motion-reduce:transition-none"
//                       >
//                         View
//                       </Link>
//                     </td>
//                   </tr>
//                 );
//               })}
//             </tbody>
//           </table>
//         </div>
//       ) : (
//         <p
//           role="status"
//           className="rounded-sm border border-dashed border-outline-variant p-space-xl text-center text-sm text-on-surface-variant"
//         >
//           {pastSessions.length === 0
//             ? "No past sessions yet. A session appears here once its end date has passed."
//             : `No sessions match “${query.trim()}”.`}
//         </p>
//       )}
//     </div>
//    </MainLayout>
//   );
// };

// export default PastSessions;
import React from 'react'

const PastSessions = () => {
  return (
    <div>PastSessions</div>
  )
}

export default PastSessions