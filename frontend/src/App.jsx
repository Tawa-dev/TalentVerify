import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom" 
import { AuthProvider } from "./contexts/AuthContext" 
import ProtectedRoute from "./components/ProtectedRoute" 
import LoginForm from "./components/auth/login-form" 
import RegisterForm from "./components/auth/register-form" 
import CompanyDashboard from "./components/dashboards/company-dashboard" 
import VerificationDashboard from "./components/dashboards/verification-dashboard" 
import GeneralDashboard from "./components/dashboards/general-dashboard" 
import UnauthorizedPage from "./pages/UnauthorizedPage" 
import TokenDemoPage from "./pages/TokenDemoPage" 
import HomePage from "./components/home-page" 
import { useAuth } from "./contexts/AuthContext"  

// Dashboard selector component based on user role 
const DashboardSelector = () => {
  const { user, logout } = useAuth()

  if (!user) return <Navigate to="/login" />

  switch (user.role) {
    case "company_user":
      return <CompanyDashboard user={user} onLogout={logout} />
    case "talent_verify":
      return <VerificationDashboard user={user} onLogout={logout} />
    case "general_user":
      return <GeneralDashboard user={user} onLogout={logout} />
    default:
      console.error("Invalid role:", user.role)
      return <Navigate to="/unauthorized" />
  }
} 

function App() {   
  return (     
    <AuthProvider>       
      <Router>         
      <Routes>
        <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/register" element={<RegisterForm />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardSelector />
              </ProtectedRoute>
            }
          />

          <Route
            path="/company/*"
            element={
              <ProtectedRoute requiredRole="company_user">
                <CompanyDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/verification/*"
            element={
              <ProtectedRoute requiredRole="talent_verify">
                <VerificationDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/general/*"
            element={
              <ProtectedRoute requiredRole="general_user">
                <GeneralDashboard />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>       
      </Router>     
    </AuthProvider>   
  ) 
}  

export default App