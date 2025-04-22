// CompanyManagement.jsx
import { useState, useEffect } from 'react'
import { api } from '../services/api'
import CompanyTable from '../components/companies/CompanyTable'
import CompanyForm from '../components/companies/CompanyForm'
import BulkUpload from '../components/BulkUpload'
import { useAuth } from '../context/AuthContext'
import toast, { Toaster } from 'react-hot-toast'

export default function CompanyManagement() {
  const [companies, setCompanies] = useState([])
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('single')
  const { user } = useAuth()

  // Load companies on component mount
  useEffect(() => {
    loadCompanies()
  }, [])

  const loadCompanies = async () => {
    try {
      setLoading(true)
      const response = await api.get('/companies/')
      console.log('API Response:', response) // Add this log
      console.log('Companies data:', response.data) // Add this log
      setCompanies(response.data)
    } catch (error) {
      console.error('Error loading companies:', error) // Improve error logging
      toast.error('Failed to load companies: ' + 
        (error.response?.data?.error || error.message))
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (data) => {
    try {
      await api.post('/companies/', data)
      toast.success('Company created successfully')
      loadCompanies()
    } catch (error) {
      toast.error(`Error creating company: ${error.response?.data?.error || error.message}`)
    }
  }

  const handleUpdate = async (data) => {
    try {
      await api.patch(`/companies/${data.id}/`, data)
      toast.success('Company updated successfully')
      loadCompanies()
    } catch (error) {
      toast.error(`Error updating company: ${error.response?.data?.error || error.message}`)
    }
  }
  
  // Refresh after bulk upload
  const handleBulkUploadSuccess = () => {
    loadCompanies()
    toast.success('Companies imported successfully')
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm">
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
                <h2 className="text-xl font-semibold mb-3">Add Company</h2>
                <CompanyForm onSubmit={handleCreate} />
              </div>
            ) : (
              <div>
                <h2 className="text-xl font-semibold mb-3">Bulk Upload Companies</h2>
                <BulkUpload 
                  onSuccess={handleBulkUploadSuccess}
                  uploadType="companies"
                />
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Company List</h3>
        {loading ? (
          <p>Loading companies...</p>
        ) : (
          <CompanyTable 
            data={companies}
            onEdit={handleUpdate}
          />
        )}
      </div>
      
      <Toaster position="top-right" />
    </div>
  )
}