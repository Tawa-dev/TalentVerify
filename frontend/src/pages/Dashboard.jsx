import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { api } from '../services/api'
import toast from 'react-hot-toast'

export default function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    totalEmployees: 0,
    totalCompanies: 0,
    departments: [],
    recentActivity: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [user?.role])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      if (user?.role === 'talent_verify_staff') {
        const response = await api.get('/dashboard/admin-stats/')
        setStats(response.data)
      } else if (user?.role === 'company_admin' || user?.role === 'company_staff') {
        const response = await api.get('/dashboard/company-stats/')
        setStats(response.data)
      }
    } catch (error) {
      toast.error('Failed to load dashboard data')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>
  }

  // Talent Verify Staff Dashboard
  if (user?.role === 'talent_verify_staff') {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold mb-4">System Overview</h2>
        
        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-gray-500 text-sm">Total Companies</h3>
            <p className="text-3xl font-semibold">{stats.totalCompanies}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-gray-500 text-sm">Total Employees</h3>
            <p className="text-3xl font-semibold">{stats.totalEmployees}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-gray-500 text-sm">Recent Uploads</h3>
            <p className="text-3xl font-semibold">{stats.recentUploads || 0}</p>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {stats.recentActivity?.map((activity, index) => (
              <div key={index} className="flex items-center justify-between border-b pb-2">
                <div>
                  <p className="font-medium">{activity.action}</p>
                  <p className="text-sm text-gray-500">{activity.details}</p>
                </div>
                <span className="text-sm text-gray-500">{activity.timestamp}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Company User Dashboard
  if (user?.role === 'company_admin' || user?.role === 'company_staff') {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold mb-4">Company Dashboard</h2>
        
        {/* Company Stats */}
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-gray-500 text-sm">Total Employees</h3>
            <p className="text-3xl font-semibold">{stats.totalEmployees}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-gray-500 text-sm">Departments</h3>
            <p className="text-3xl font-semibold">{stats.departments?.length || 0}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-gray-500 text-sm">Recent Updates</h3>
            <p className="text-3xl font-semibold">{stats.recentUpdates || 0}</p>
          </div>
        </div>

        {/* Department List */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Departments Overview</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {stats.departments?.map((dept, index) => (
              <div key={index} className="border rounded p-4">
                <h4 className="font-medium">{dept.name}</h4>
                <p className="text-sm text-gray-500">Employees: {dept.employeeCount}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Employee Updates */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Recent Employee Updates</h3>
          <div className="space-y-4">
            {stats.recentActivity?.map((activity, index) => (
              <div key={index} className="flex items-center justify-between border-b pb-2">
                <div>
                  <p className="font-medium">{activity.employee}</p>
                  <p className="text-sm text-gray-500">{activity.action}</p>
                </div>
                <span className="text-sm text-gray-500">{activity.date}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Regular User Dashboard (if needed)
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold mb-4">Welcome to Talent Verify</h2>
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <p>Use the search feature to verify employment history.</p>
      </div>
    </div>
  )
}