import { Link, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Layout() {
  const { user, logout } = useAuth();

  // Check user role directly from user.role
  const isTalentVerifyStaff = user?.role === 'talent_verify_staff';
  const isCompanyUser = ['company_admin', 'company_staff'].includes(user?.role);

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-bold text-gray-800">Talent Verify</h1>
            <div className="flex items-center gap-4">
              {user ? (
                <>
                  <Link to="/" className="text-gray-600 hover:text-gray-800">
                    Dashboard
                  </Link>

                  {/* Show Employees link only to company users and talent verify staff */}
                  {(isCompanyUser || isTalentVerifyStaff) && (
                    <Link to="/employees" className="text-gray-600 hover:text-gray-800">
                      Employees
                    </Link>
                  )}

                  {/* Show Companies link only to talent verify staff */}
                  {isTalentVerifyStaff && (
                    <Link to="/companies" className="text-gray-600 hover:text-gray-800">
                      Companies
                    </Link>
                  )}

                  <Link to="/search" className="text-gray-600 hover:text-gray-800">
                    Search
                  </Link>
                  
                  <button
                    onClick={logout}
                    className="text-red-500 hover:text-red-700"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <Link to="/login" className="text-gray-600 hover:text-gray-800">
                  Login
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>
      
      <main className="max-w-7xl mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}