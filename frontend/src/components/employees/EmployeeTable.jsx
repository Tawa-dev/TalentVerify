import { useState } from 'react'
import { format } from 'date-fns'
import EmployeeForm from './EmployeeForm'

export default function EmployeeTable({ data, onUpdate }) {
  const [expandedEmployee, setExpandedEmployee] = useState(null)
  const [editingEmployee, setEditingEmployee] = useState(null)
  
  const employees = data?.results || []

  const toggleExpand = (id) => {
    setExpandedEmployee(expandedEmployee === id ? null : id)
  }

  const handleEditClick = (employee) => {
    setEditingEmployee(employee)
  }

  const handleEditClose = () => {
    setEditingEmployee(null)
  }

  if (!employees || employees.length === 0) {
    return <p className="text-gray-500">No employees found.</p>
  }
  
  return (
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
              Department
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Current Role
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Start Date
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {employees.map((employee) => (
            <tr key={employee.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {employee.name}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {employee.employee_id || 'N/A'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {employee.current_department || 'N/A'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {employee.current_role?.role || 'N/A'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {employee.current_role?.date_started ? 
                  format(new Date(employee.current_role.date_started), 'dd MMM yyyy') :
                  'N/A'
                }
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button
                  onClick={() => handleEditClick(employee)}
                  className="text-indigo-600 hover:text-indigo-900 mr-3"
                >
                  Edit
                </button>
                <button
                  onClick={() => toggleExpand(employee.id)}
                  className="text-blue-600 hover:text-blue-900"
                >
                  {expandedEmployee === employee.id ? 'Hide History' : 'Show History'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {/* Role History Section */}
      {expandedEmployee && (
        <div className="mt-4 p-4 bg-gray-50 rounded">
          <h3 className="text-lg font-medium mb-2">
            Role History
          </h3>
          {employees.find(e => e.id === expandedEmployee)?.roles?.length > 0 ? (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Department
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Start Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    End Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Duties
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {employees.find(e => e.id === expandedEmployee).roles.map((role) => (
                  <tr key={role.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {role.department_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {role.role}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {role.date_started ? format(new Date(role.date_started), 'dd MMM yyyy') : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {role.date_left ? format(new Date(role.date_left), 'dd MMM yyyy') : 'Current'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {role.duties || 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-gray-500">No role history available.</p>
          )}
        </div>
      )}

      {/* Edit Employee Modal */}
      {editingEmployee && (
        <div className="fixed inset-0 flex items-center justify-center p-4 z-50">
          {/* Overlay */}
          <div 
            className="absolute inset-0 bg-gray-500 bg-opacity-10"
            onClick={handleEditClose}
          ></div>
          
          {/* Modal content */}
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto relative z-10 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Edit Employee: {editingEmployee.name}</h2>
              <button 
                onClick={handleEditClose}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <EmployeeForm 
              initialData={editingEmployee}
              onSubmit={async (data) => {
                await onUpdate(data);
                handleEditClose();
              }}
              isEditing={true}
            />
          </div>
        </div>
      )}
    </div>
  )
}