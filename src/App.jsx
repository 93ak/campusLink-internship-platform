import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import { DataProvider } from "./context/DataContext";
import ProtectedRoute from "./routes/ProtectedRoute";
import DashboardLayout from "./components/layout/DashboardLayout";

import Login from "./pages/auth/Login";
import ForgotPassword from "./pages/auth/ForgotPassword";

import StudentDashboard from "./pages/student/StudentDashboard";
import Opportunities from "./pages/student/Opportunities";
import OpportunityDetails from "./pages/student/OpportunityDetails";
import MyApplications from "./pages/student/MyApplications";
import ApplicationDetails from "./pages/student/ApplicationDetails";
import StudentInterviews from "./pages/student/Interviews";
import MyInternship from "./pages/student/MyInternship";
import StudentProfile from "./pages/student/Profile";
import StudentNotifications from "./pages/student/Notifications";

import ProfessorDashboard from "./pages/professor/ProfessorDashboard";
import Students from "./pages/professor/Students";
import StudentDetail from "./pages/professor/StudentDetail";
import ListingApprovals from "./pages/professor/ListingApprovals";
import ListingApprovalDetails from "./pages/professor/ListingApprovalDetails";
import ProfessorApplications from "./pages/professor/Applications";
import Companies from "./pages/professor/Companies";
import CompanyDetail from "./pages/professor/CompanyDetail";
import Verification from "./pages/professor/Verification";
import VerificationDetails from "./pages/professor/VerificationDetails";
import Reports from "./pages/professor/Reports";
import ProfessorNotifications from "./pages/professor/Notifications";
import ProfessorProfile from "./pages/professor/Profile";

import CompanyDashboard from "./pages/company/CompanyDashboard";
import CompanyProfile from "./pages/company/CompanyProfile";
import CreateListing from "./pages/company/CreateListing";
import MyListings from "./pages/company/MyListings";
import ListingDetail from "./pages/company/ListingDetail";
import Applicants from "./pages/company/Applicants";
import ApplicantDetail from "./pages/company/ApplicantDetail";
import CompanyInterviews from "./pages/company/Interviews";
import SelectedStudents from "./pages/company/SelectedStudents";
import CompanyNotifications from "./pages/company/Notifications";

function RootRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={`/${user.role}/dashboard`} replace />;
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <DataProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<RootRedirect />} />
              <Route path="/login" element={<Login />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />

              {/* ---------------- STUDENT ---------------- */}
              <Route
                path="/student"
                element={
                  <ProtectedRoute role="student">
                    <DashboardLayout role="student" />
                  </ProtectedRoute>
                }
              >
                <Route path="dashboard" element={<StudentDashboard />} />
                <Route path="opportunities" element={<Opportunities />} />
                <Route path="opportunities/:listingId" element={<OpportunityDetails />} />
                <Route path="applications" element={<MyApplications />} />
                <Route path="applications/:applicationId" element={<ApplicationDetails />} />
                <Route path="interviews" element={<StudentInterviews />} />
                <Route path="internship" element={<MyInternship />} />
                <Route path="profile" element={<StudentProfile />} />
                <Route path="notifications" element={<StudentNotifications />} />
              </Route>

              {/* ---------------- PROFESSOR ---------------- */}
              <Route
                path="/professor"
                element={
                  <ProtectedRoute role="professor">
                    <DashboardLayout role="professor" />
                  </ProtectedRoute>
                }
              >
                <Route path="dashboard" element={<ProfessorDashboard />} />
                <Route path="students" element={<Students />} />
                <Route path="students/:studentId" element={<StudentDetail />} />
                <Route path="listings" element={<ListingApprovals />} />
                <Route path="listings/:listingId" element={<ListingApprovalDetails />} />
                <Route path="applications" element={<ProfessorApplications />} />
                <Route path="companies" element={<Companies />} />
                <Route path="companies/:companyId" element={<CompanyDetail />} />
                <Route path="verification" element={<Verification />} />
                <Route path="verification/:internshipId" element={<VerificationDetails />} />
                <Route path="reports" element={<Reports />} />
                <Route path="notifications" element={<ProfessorNotifications />} />
                <Route path="profile" element={<ProfessorProfile />} />
              </Route>

              {/* ---------------- COMPANY ---------------- */}
              <Route
                path="/company"
                element={
                  <ProtectedRoute role="company">
                    <DashboardLayout role="company" />
                  </ProtectedRoute>
                }
              >
                <Route path="dashboard" element={<CompanyDashboard />} />
                <Route path="profile" element={<CompanyProfile />} />
                <Route path="listings" element={<MyListings />} />
                <Route path="listings/new" element={<CreateListing />} />
                <Route path="listings/:listingId" element={<ListingDetail />} />
                <Route path="listings/:listingId/edit" element={<CreateListing />} />
                <Route path="listings/:listingId/applicants" element={<Applicants />} />
                <Route path="applicants" element={<Applicants />} />
                <Route path="applicants/:applicationId" element={<ApplicantDetail />} />
                <Route path="interviews" element={<CompanyInterviews />} />
                <Route path="selected" element={<SelectedStudents />} />
                <Route path="notifications" element={<CompanyNotifications />} />
              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </DataProvider>
      </AuthProvider>
    </ToastProvider>
  );
}
