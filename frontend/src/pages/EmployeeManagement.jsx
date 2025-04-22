import { useState, useEffect } from 'react'
import { api } from '../services/api'
import EmployeeTable from '../components/employees/EmployeeTable'
import EmployeeForm from '../components/employees/EmployeeForm'
import { useAuth } from '../context/AuthContext'
import BulkUpload from '../components/BulkUpload'
import toast, { Toaster } from 'react-hot-toast'

export default function EmployeeManagement() {
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('single')
  const { user } = useAuth()

  // Load employees on component mount
  useEffect(() => {
    loadEmployees()
  }, [])

  const loadEmployees = async () => {
    try {
      setLoading(true)
      const response = await api.get('/employees/', {
        params: {
          company: user.company?.id, // Match the parameter name with backend
        }
      })
      setEmployees(response.data)
    } catch (error) {
      toast.error('Failed to load employees: ' + 
        (error.response?.data?.error || error.message))
    } finally {
      setLoading(false)
    }
  }

  const handleUpdate = async (data) => {
    if(user.can_manage_company_data) {
      try {
        await api.patch(`/employees/${data.id}/`, data) // Note the trailing slash
        toast.success('Employee updated successfully')
        loadEmployees()
      } catch (error) {
        toast.error(`Error updating employee: ${error.response?.data?.error || error.message}`)
      }
    }
  }

  const handleCreate = async (employeeData) => {
    try {
      // Ensure company is set if not provided
      if (!employeeData.company && user.company?.id) {
        employeeData.company = user.company.id
      }
      
      const response = await api.post('/employees/', employeeData)
      toast.success('Employee created successfully')
      loadEmployees()
    } catch (error) {
      toast.error(`Error creating employee: ${error.response?.data?.error || error.message}`)
    }
  }
  
  // Refresh after bulk upload
  const handleBulkUploadSuccess = () => {
    loadEmployees()
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm">
        {/* <h3 className="text-lg font-semibold mb-4">Add New Employee</h3>
        <EmployeeForm onSubmit={handleCreate} />
      </div>

      <BulkUpload onSuccess={handleBulkUploadSuccess} /> */}


      <div className="mb-6">
        <div className="flex border-b">
          <button 
            className={`py-2 px-4 ${activeTab === 'single' ? 'border-b-2 border-blue-500 font-medium' : ''}`}
            onClick={() => setActiveTab('single')}
          >
            Single Entry
          </button>
          <button 
            className={`py-2 px-4 ${activeTab === 'bulk' ? 'border-b-2 border-blue-500 font-medium' : ''}`}
            onClick={() => setActiveTab('bulk')}
          >
            Bulk Upload
          </button>
        </div>

        <div className="mt-4">
          {activeTab === 'single' ? (
            <div>
              <h2 className="text-xl font-semibold mb-3">Add Employee</h2>
              <EmployeeForm onSubmit={handleCreate} />
            </div>
          ) : (
            <div>
              <h2 className="text-xl font-semibold mb-3">Bulk Upload Employees</h2>
              <BulkUpload onSuccess={handleBulkUploadSuccess} />
            </div>
          )}
        </div>
      </div>

    </div>


      
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Employee List</h3>
        {loading ? (
          <p>Loading employees...</p>
        ) : (
          <EmployeeTable 
            data={employees}
            onEdit={handleUpdate}
          />
        )}
      </div>
      
      <Toaster position="top-right" />
    </div>
  )
}