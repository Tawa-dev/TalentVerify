import React, { useState } from 'react'
import { api } from '../services/api'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

export default function Search() {
  const [filters, setFilters] = useState({
    name: '',
    employer: '',
    position: '',
    department: '',
    yearStarted: '',
    yearLeft: ''
  })
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [expandedEmployee, setExpandedEmployee] = useState(null)

  const handleSearch = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const response = await api.get('/employees/search/', {
        params: {
          name: filters.name,
          employer: filters.employer,
          position: filters.position,
          department: filters.department,
          year_started: filters.yearStarted,
          year_left: filters.yearLeft
        }
      })
      setResults(response.data)
    } catch (error) {
      toast.error('Search failed: ' + (error.response?.data?.error || error.message))
    } finally {
      setLoading(false)
    }
  }

  const toggleEmployeeHistory = (employeeId) => {
    setExpandedEmployee(expandedEmployee === employeeId ? null : employeeId)
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold mb-4">Employee Search</h2>
      
      {/* Search Form */}
      <form onSubmit={handleSearch} className="bg-white p-6 rounded-lg shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <input
            type="text"
            placeholder="Name"
            className="border rounded p-2"
            value={filters.name}
            onChange={e => setFilters({...filters, name: e.target.value})}
          />
          <input
            type="text"
            placeholder="Employer"
            className="border rounded p-2"
            value={filters.employer}
            onChange={e => setFilters({...filters, employer: e.target.value})}
          />
          <input
            type="text"
            placeholder="Position"
            className="border rounded p-2"
            value={filters.position}
            onChange={e => setFilters({...filters, position: e.target.value})}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <input
            type="text"
            placeholder="Department"
            className="border rounded p-2"
            value={filters.department}
            onChange={e => setFilters({...filters, department: e.target.value})}
          />
          <input
            type="number"
            placeholder="Year Started"
            className="border rounded p-2"
            value={filters.yearStarted}
            onChange={e => setFilters({...filters, yearStarted: e.target.value})}
          />
          <input
            type="number"
            placeholder="Year Left"
            className="border rounded p-2"
            value={filters.yearLeft}
            onChange={e => setFilters({...filters, yearLeft: e.target.value})}
          />
        </div>
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          disabled={loading}
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>
      
      {/* Loading State */}
      {loading && (
        <div className="text-center py-4">
          <p>Searching...</p>
        </div>
      )}

      {/* Results Table */}
      {!loading && results.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Employee ID
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Current Company
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Current Role
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Department
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {results.map((employee) => (
                  <React.Fragment key={employee.id}>
                    <tr className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">{employee.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{employee.employee_id || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{employee.current_company}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{employee.current_role}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{employee.department}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => toggleEmployeeHistory(employee.id)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          {expandedEmployee === employee.id ? 'Hide History' : 'Show History'}
                        </button>
                      </td>
                    </tr>
                    {expandedEmployee === employee.id && (
                      <tr>
                        <td colSpan="6" className="px-6 py-4 bg-gray-50">
                          <div className="space-y-4">
                            <h4 className="font-medium text-gray-700">Employment History</h4>
                            {employee.roles.map((role, index) => (
                              <div key={index} className="border-l-2 border-blue-500 pl-4">
                                <div className="font-medium">{role.company}</div>
                                <div className="text-sm text-gray-600">
                                  <p>Role: {role.title}</p>
                                  <p>Department: {role.department}</p>
                                  <p>Duration: {format(new Date(role.date_started), 'MMM yyyy')} - 
                                    {role.date_left ? format(new Date(role.date_left), 'MMM yyyy') : 'Present'}</p>
                                  <p className="mt-1">Duties:</p>
                                  <p className="text-sm text-gray-500">{role.duties || 'No duties listed'}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {/* No Results Message */}
      {!loading && results.length === 0 && filters.name && (
        <div className="text-center text-gray-500 mt-4">
          No results found. Try adjusting your search criteria.
        </div>
      )}
    </div>
  )
}