import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Navigate, Route, BrowserRouter as Router, Routes } from "react-router";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import { AppThemeProvider } from "./theme/AppTheme";
import { DashboardLayout } from "./layouts/DashboardLayout";
import { ProtectedRoute } from "./routes/ProtectedRoute";
import { LoginPage } from "./features/auth/LoginPage";
import { DashboardPage } from "./features/dashboard/DashboardPage";
import { PatientsPage } from "./features/patients/PatientsPage";
import { PatientDetailsPage } from "./features/patients/PatientDetailsPage";
import { VisitsPage } from "./features/visits/VisitsPage";
import { UserManagementPage } from "./features/users/UserManagementPage";
import { MedicalHistoryPage } from "./features/history/MedicalHistoryPage";
import { SettingsPage } from "./features/settings/SettingsPage";
import { ErrorPage } from "./pages/ErrorPage";
import { AppErrorBoundary } from "./components/common/AppErrorBoundary";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppThemeProvider>
        <AppErrorBoundary>
          <AuthProvider>
            <Router>
              <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route element={<ProtectedRoute />}>
                  <Route element={<DashboardLayout />}>
                    <Route index element={<Navigate to="/dashboard" replace />} />
                    <Route path="/dashboard" element={<DashboardPage />} />
                    <Route path="/patients" element={<PatientsPage />} />
                    <Route path="/patients/:patientId" element={<PatientDetailsPage />} />
                    <Route path="/visits" element={<VisitsPage />} />
                    <Route path="/medical-history" element={<MedicalHistoryPage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                  </Route>
                </Route>
                <Route element={<ProtectedRoute roles={["admin"]} />}>
                  <Route element={<DashboardLayout />}>
                    <Route path="/users" element={<UserManagementPage />} />
                  </Route>
                </Route>
                <Route path="/401" element={<ErrorPage code="401" title="Authentication required" />} />
                <Route path="/403" element={<ErrorPage code="403" title="You do not have access to this page" />} />
                <Route path="*" element={<ErrorPage code="404" title="Page not found" />} />
              </Routes>
            </Router>
            <Toaster position="top-right" />
          </AuthProvider>
        </AppErrorBoundary>
      </AppThemeProvider>
    </QueryClientProvider>
  );
}
