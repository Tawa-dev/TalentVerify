import { useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { api } from '../services/api'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import DownloadTemplateButton from '../components/DownloadTemplateButton'

export default function BulkUpload({ onSuccess, uploadType = 'employees' }) {
  const { user } = useAuth()
  const [isUploading, setIsUploading] = useState(false)
  
  // Determine if user can upload companies
  const canUploadCompanies = user?.role === 'talent_verify_staff';

  // Prevent unauthorized company uploads
  if (uploadType === 'companies' && !canUploadCompanies) {
    return (
      <div className="bg-red-100 p-4 rounded-lg border border-red-200 text-red-600">
        Company management requires Talent Verify administrator privileges
      </div>
    )
  }

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'text/plain': ['.txt']
    },
    onDrop: async acceptedFiles => {
      try {
        setIsUploading(true)
        
        const formData = new FormData()
        formData.append('file', acceptedFiles[0])
        
        // For employee uploads, add company ID if available
        if (uploadType === 'employees' && user.company) {
          formData.append('company', user.company.toString())
        } else if (!user.company && uploadType === 'employees') {
          toast.error('Company ID is required for employee uploads')
          setIsUploading(false)
          return
        }

        // Use the backend's URL format with an underscore (bulk_upload)
        const endpoint = uploadType === 'employees' 
          ? '/employees/bulk_upload/' 
          : '/companies/bulk_upload/'

        const response = await api.post(endpoint, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        
        toast.success(`${uploadType} uploaded successfully!`)
        
        // Call the onSuccess callback if provided
        if (onSuccess && typeof onSuccess === 'function') {
          onSuccess()
        }
        
      } catch (error) {
        const errorMessage = error.response?.data?.error || error.message
        toast.error(`Upload failed: ${errorMessage}`)
      } finally {
        setIsUploading(false)
      }
    }
  })

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div 
        {...getRootProps()}
        className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500"
      >
        <input {...getInputProps()} />
        {isUploading ? (
          <p>Uploading...</p>
        ) : (
          <>
            <p>Drag & drop {uploadType} file here, or click to select</p>
            <p className="text-sm text-gray-500 mt-2">
              {uploadType === 'employees' 
                ? 'Expected columns: name, employee_id, department, role, date_started(YYYY-MM-DD), date_left, duties' 
                : 'Expected columns: name, registration_date(YYYY-MM-DD), registration_number, address, contact_person, contact_phone, email'
              }
            </p>
          </>
        )}
      </div>
      
      <div className="mt-4 flex justify-between items-center">
        <p className="text-xs text-gray-500">
          Supported file formats: CSV, Excel (.xls, .xlsx), Text file (.txt)
        </p>
        <DownloadTemplateButton templateType={uploadType} />
      </div>
    </div>
  )
}