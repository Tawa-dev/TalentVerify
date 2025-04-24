// CompanyManagement.jsx
import { useState, useEffect } from 'react'
import { api } from '../services/api'
import CompanyTable from '../components/companies/CompanyTable'
import CompanyForm from '../components/companies/CompanyForm'
import BulkUpload from '../components/BulkUpload'
import BulkEditForm from '../components/BulkEditForm'
import { useAuth } from '../context/AuthContext'
import toast, { Toaster } from 'react-hot-toast'

export default function CompanyManagement() {
  const [companies, setCompanies] = useState([])
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('single')
  const [editingCompany, setEditingCompany] = useState(null)
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
      const formattedData = {
        ...data,
        registration_date: data.registration_date instanceof Date 
          ? data.registration_date.toISOString().split('T')[0]
          : data.registration_date,
        departments: data.departments?.map(dept => ({
          name: dept.name
        }))
      };

      await api.patch(`/companies/${data.id}/`, formattedData);
      toast.success('Company updated successfully');
      loadCompanies();
      setEditingCompany(null); // Close modal after successful update
    } catch (error) {
      console.error('Update error:', error.response?.data);
      toast.error(`Error updating company: ${error.response?.data?.error || error.message}`);
    }
  }

  // Add handlers for edit modal
  const handleEditClick = (company) => {
    setEditingCompany(company);
  };

  const handleEditClose = () => {
    setEditingCompany(null);
  };
  
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
              Bulk Operations
            </button>
          </div>

          <div className="mt-4">
            {activeTab === 'single' ? (
              <div>
                <h2 className="text-xl font-semibold mb-3">Add Company</h2>
                <CompanyForm onSubmit={handleCreate} />
              </div>
            ) : (
              <div className="space-y-8">
                <div>
                  <h2 className="text-xl font-semibold mb-3">Bulk Upload Companies</h2>
                  <BulkUpload 
                    onSuccess={handleBulkUploadSuccess}
                    uploadType="companies"
                  />
                </div>
                
                <div>
                  <h2 className="text-xl font-semibold mb-3">Bulk Update Companies</h2>
                  <BulkEditForm onSuccess={handleBulkUploadSuccess} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* edit modal  */}
      {editingCompany && (
        <div className="fixed inset-0 flex items-center justify-center p-4 z-50">
          {/* More transparent overlay */}
          <div 
            className="absolute inset-0 bg-gray-500 bg-opacity-10 "
            onClick={handleEditClose}
          ></div>
          
          {/* Modal content with shadow for better visibility */}
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto relative z-10 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Edit Company</h2>
              <button 
                onClick={handleEditClose}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <CompanyForm 
              initialData={editingCompany} 
              onSubmit={async (data) => {
                await handleUpdate(data);
                handleEditClose();
              }}
            />
          </div>
        </div>
      )}
      
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Company List</h3>
        {loading ? (
          <p>Loading companies...</p>
        ) : (
          <CompanyTable 
            data={companies}
            onEdit={handleEditClick}
          />
        )}
      </div>
      
      <Toaster position="top-right" />
    </div>
  )
}