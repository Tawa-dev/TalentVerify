import { Navigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, loading } = useAuth()

  // Show loading state while auth state is being determined
  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" replace />
  }
  
  // If requiredRole is specified, check if user has the required role
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/unauthorized" replace />
  }
  
  // User is authenticated and has the required role
  return children
}

export default ProtectedRoute