import { BrowserRouter, Routes, Route } from "react-router-dom";
import NotFound from "../pages/NotFound";
import Login from "../pages/Auth/Login";
import ProtectedRoute from "./ProtectedRoute";
import ForgotPassword from "../pages/Auth/ForgotPassword";

// Admin Pages
import AdminDashboard from "../pages/Admin/Dashboard";
import AdminStudents from "../pages/Admin/Students";
import AdminCourses from "../pages/Admin/Courses";
import AdminDepartments from "../pages/Admin/Departments";
import AdminSchools from "../pages/Admin/Schools";
import AdminResults from "../pages/Admin/Results";
import AdminGrades from "../pages/Admin/Grades";
import AdminSettings from "../pages/Admin/Settings";
import AdminLayout from "../components/AdminLayout";
import Probation from "../pages/Admin/Probation";
import ResultUploadPage from "../pages/Admin/ResultsDisplayPage";
import TranscriptDisplayPage from "../pages/Admin/TranscriptDisplayPage";
import Transcripts from "../pages/Admin/Transcripts";
import StaffSettings from "../pages/Admin/Staff";

// Student Pages
import StudentDashboard from "../pages/Student/Dashboard";
import Profile from "../pages/Student/Profile";
import Results from "../pages/Student/Results";
import StudentLayout from "../components/StudentLayout";
import Settings from "../pages/Student/Settings";

const AppRouter = () => (
  <BrowserRouter>
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* Admin Routes (protected + wrapped in AdminLayout) */}
        <Route
        path="/admin"
        element={
          <ProtectedRoute roles={["admin", "superadmin"]}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >

        <Route path="staff" element={<StaffSettings />} />
        <Route path="settings" element={<AdminSettings />} />
        <Route path="transcripts" element={<Transcripts />} />
      </Route>

      <Route
        path="/admin"
        element={
          <ProtectedRoute roles={["admin", "staff", "superadmin"]}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="students" element={<AdminStudents />} />
        <Route path="courses" element={<AdminCourses />} />
        <Route path="departments" element={<AdminDepartments />} />
        <Route path="schools" element={<AdminSchools />} />
        <Route path="results" element={<AdminResults />} />
        <Route path="transcripts" element={<Transcripts />} />
        <Route path="grades" element={<AdminGrades />} />
        <Route path="staff" element={<StaffSettings />} />
        <Route path="settings" element={<AdminSettings />} />
        <Route path="probation" element={<Probation />} />
        <Route path="/admin/results/:departmentId" element={<ResultUploadPage />} />
        <Route path="/admin/transcripts/:departmentId" element={<TranscriptDisplayPage />} />
        <Route path="results/:id" element={<ResultUploadPage />} />
      </Route>

      {/* Student Routes (protected + wrapped in StudentLayout) */}
      <Route
        path="/student"
        element={
          <ProtectedRoute roles={["student"]}>
            <StudentLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<StudentDashboard />} />
        <Route path="profile" element={<Profile />} />
        <Route path="results" element={<Results />} />
         <Route path="settings" element={<Settings />} />
  "
      </Route>
      {/* Catch-all route for 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  </BrowserRouter>
);

export default AppRouter;
