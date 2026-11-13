import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import RootLayout from "./layout/RootLayout";
import DashBoard from "./Pages/DashBoard";
import NotFound from "./Pages/NotFound";
import Sessions from "./Pages/Sessions";
import PastSessions from "./Pages/PastSessions";
import SessionDetails from "./Pages/SessionDetails";
import Login from "./Pages/auth/Login";
import ResetPassword from "./Pages/auth/ResetPassword";
import ForgotPassword from "./Pages/auth/ForgotPassword";
import RootIndex from "./Pages/Index";
import ProtectedRoute from "./hooks/Protected";
import GuestRoute from "./hooks/Guest";
import Rooms from "./Pages/Rooms";
import ErrorElement from "./components/error/ErrorElement";
import Classes from "./Pages/ClassArm";
import NetworkBanner from "./components/NetworkBanner";
import ClassLevel from "./Pages/Class_Level";
import Teachers from "./Pages/Teachers/Teachers";
import Subjects from "./Pages/Subjects";
import Period from "./Pages/Period";
import Assignments from "./Pages/Assignment";
import AssignSubjects from "./Pages/AssignSubject";
import AssignTeachers from "./Pages/Teachers/TeacherAssignment";
import NotImplementedPage from "./Pages/NotImplemented";
import AssignTeacherSubjects from "./Pages/SubjectTeacherAssignment";
import Timetables from "./Pages/timetable/Timetables";
import TimetableView from "./Pages/TimetableView";
import TeacherAvailability from "./Pages/Teachers/TeacherAvailability";
import TimetableEditor from "./Pages/TimetableEditor";


const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" errorElement={<ErrorElement />} element={<RootLayout />}>
      <Route index element={<RootIndex />} />
      <Route
        path="/auth/login"
        element={
          <GuestRoute>
            <Login />
          </GuestRoute>
        }
      />
      <Route path="/auth/forgot-password" element={<ForgotPassword />} />
      <Route path="/auth/reset-password" element={<ResetPassword />} />

      <Route
        path="/overview"
        element={
          <ProtectedRoute>
            <DashBoard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/sessions"
        element={
          <ProtectedRoute>
            <Sessions />
          </ProtectedRoute>
        }
      />
      <Route
        path="/sessions/past"
        element={
          <ProtectedRoute>
            <PastSessions />
          </ProtectedRoute>
        }
      />
      <Route
        path="/sessions/:id"
        element={
          <ProtectedRoute>
            <SessionDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/classes"
        element={
          <ProtectedRoute>
            <Classes />
          </ProtectedRoute>
        }
      />
      <Route
        path="/classes/level"
        element={
          <ProtectedRoute>
            <ClassLevel />
          </ProtectedRoute>
        }
      />
      <Route
        path="/rooms"
        element={
          <ProtectedRoute>
            <Rooms />
          </ProtectedRoute>
        }
      />
      <Route
        path="/teachers"
        element={
          <ProtectedRoute>
            <Teachers />
          </ProtectedRoute>
        }
      />
      <Route
        path="/subjects"
        element={
          <ProtectedRoute>
            <Subjects />
          </ProtectedRoute>
        }
      />
      <Route
        path="/periods"
        element={
          <ProtectedRoute>
            <Period />
          </ProtectedRoute>
        }
      />
      <Route
        path="/assignments"
        element={
          <ProtectedRoute>
            <Assignments />
          </ProtectedRoute>
        }
      />
      <Route
        path="/assignments/subjects"
        element={
          <ProtectedRoute>
            <AssignSubjects />
          </ProtectedRoute>
        }
      />
      <Route
        path="/assignments/teachers"
        element={
          <ProtectedRoute>
            <AssignTeachers />
          </ProtectedRoute>
        }
      />
      <Route
        path="/teacher-availability"
        element={
          <ProtectedRoute>
            <TeacherAvailability />
          </ProtectedRoute>
        }
      />
      <Route
        path="/assignments/teacher-subjects"
        element={
          <ProtectedRoute>
            <AssignTeacherSubjects />
          </ProtectedRoute>
        }
      />
      <Route
        path="/timetables"
        element={
          <ProtectedRoute>
            <Timetables />
          </ProtectedRoute>
        }
      />
      <Route
        path="/timetables/:id"
        element={
          <ProtectedRoute>
            <TimetableView />
          </ProtectedRoute>
        }
      />
      <Route
        path="/timetables/:id/edit"
        element={
          <ProtectedRoute>
            <NotImplementedPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/timetable-editor"
        element={
          <ProtectedRoute>
            <TimetableEditor />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<NotFound />} />
    </Route>,
  ),
);

function App() {

  return (
    <>
      <Toaster
        position="bottom-right"
        gutter={8}
        toastOptions={{
          duration: 3000,
          style: {
            background: "var(--color-surface)",
            color: "var(--color-on-surface)",
            border: "1px solid var(--color-outline-variant)",
            borderRadius: "0.25rem",
            padding:
              "var(--spacing-space-md, 0.75rem) var(--spacing-space-lg, 1rem)",
            fontFamily: "var(--font-body)",
            fontSize: "0.875rem",
            lineHeight: "1.25rem",
            maxWidth: "26rem",
            boxShadow: "0 4px 12px rgb(0 0 0 / 0.12)",
          },
          success: {
            iconTheme: {
              primary: "var(--color-success)",
              secondary: "var(--color-surface)",
            },
          },
          error: {
            // Errors stay longer and are announced immediately by screen readers.
            duration: 6000,
            iconTheme: {
              primary: "var(--color-error)",
              secondary: "var(--color-surface)",
            },
            ariaProps: { role: "alert", "aria-live": "assertive" },
          },
        }}
      />
      <NetworkBanner/>
      <RouterProvider router={router} />
    </>
  );
}

export default App;
