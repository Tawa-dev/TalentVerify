import { useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { api } from '../services/api'
import toast from 'react-hot-toast'

export default function BulkUpload() {
  const [uploadType, setUploadType] = useState('employees') // 'employees' or 'companies'
  
  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
    },
    onDrop: async acceptedFiles => {
      try {
        const formData = new FormData()
        formData.append('file', acceptedFiles[0])
        
        const endpoint = uploadType === 'employees' 
          ? '/employees/bulk-upload' 
          : '/companies/bulk-upload'

        const response = await api.post(endpoint, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        
        toast.success(`${uploadType} uploaded successfully!`)
        console.log('Upload response:', response.data)
      } catch (error) {
        toast.error(`Upload failed: ${error.response?.data?.message || error.message}`)
      }
    }
  })

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Bulk Upload</h2>
      
      <div className="mb-6 flex gap-4">
        <button
          onClick={() => setUploadType('employees')}
          className={`px-4 py-2 rounded ${
            uploadType === 'employees' 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-200 hover:bg-gray-300'
          }`}
        >
          Employees
        </button>
        <button
          onClick={() => setUploadType('companies')}
          className={`px-4 py-2 rounded ${
            uploadType === 'companies' 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-200 hover:bg-gray-300'
          }`}
        >
          Companies
        </button>
      </div>

      <div 
        {...getRootProps()}
        className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500"
      >
        <input {...getInputProps()} />
        <p>Drag & drop {uploadType} file here, or click to select</p>
        <p className="text-sm text-gray-500 mt-2">
          {uploadType === 'employees' 
            ? 'Expected columns: name, employee_id, department, role, start_date, end_date, duties' 
            : 'Expected columns: company_name, registration_number, address, contact_person, phone, email'
          }
        </p>
      </div>
    </div>
  )
}