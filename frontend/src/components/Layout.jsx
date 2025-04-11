import { Link, Outlet } from 'react-router-dom'

export default function Layout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-bold text-gray-800">Talent Verify</h1>
            <div className="space-x-4">
              <Link to="/" className="text-gray-600 hover:text-gray-800">Dashboard</Link>
              <Link to="/upload" className="text-gray-600 hover:text-gray-800">Bulk Upload</Link>
              <Link to="/search" className="text-gray-600 hover:text-gray-800">Search</Link>
            </div>
          </div>
        </div>
      </nav>
      
      <main className="max-w-7xl mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  )
}