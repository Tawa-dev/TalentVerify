"use client"

import { useState } from "react"
import { DocumentArrowUpIcon, ExclamationTriangleIcon, CheckCircleIcon } from "@heroicons/react/24/outline"

export default function BulkUploadForm({ onUpload, entityType = "employee", isVerificationStaff = false }) {
  const [file, setFile] = useState(null)
  const [fileType, setFileType] = useState("csv")
  const [isUploading, setIsUploading] = useState(false)
  const [previewData, setPreviewData] = useState(null)
  const [uploadErrors, setUploadErrors] = useState([])
  const [uploadSuccess, setUploadSuccess] = useState(false)

  // Handle file selection
  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      const selectedFile = e.target.files[0]
      setFile(selectedFile)

      // Reset states
      setPreviewData(null)
      setUploadErrors([])
      setUploadSuccess(false)

      // Preview file (in a real app, this would parse the file)
      previewFile(selectedFile)
    }
  }

  // Preview the selected file
  const previewFile = (file) => {
    // This is a simplified preview. In a real app, you would parse the file
    // based on its type (CSV, Excel, etc.)
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        if (fileType === "csv") {
          // Simple CSV parsing for preview
          const content = e.target.result
          const lines = content.split("\n")
          const headers = lines[0].split(",")

          // Get a few rows for preview
          const previewRows = []
          for (let i = 1; i < Math.min(lines.length, 6); i++) {
            if (lines[i].trim()) {
              const values = lines[i].split(",")
              const row = {}
              headers.forEach((header, index) => {
                row[header.trim()] = values[index] ? values[index].trim() : ""
              })
              previewRows.push(row)
            }
          }

          setPreviewData({
            headers: headers.map((h) => h.trim()),
            rows: previewRows,
          })

          // Validate required fields
          validateFields(headers.map((h) => h.trim()))
        }
      } catch (error) {
        setUploadErrors(["Error parsing file. Please check the file format."])
      }
    }

    reader.readAsText(file)
  }

  // Validate required fields based on entity type
  const validateFields = (headers) => {
    const errors = []

    if (entityType === "employee") {
      const requiredFields = ["name", "employeeId", "department", "role", "startDate"]
      requiredFields.forEach((field) => {
        if (!headers.some((h) => h.toLowerCase().includes(field.toLowerCase()))) {
          errors.push(`Missing required field: ${field}`)
        }
      })
    } else if (entityType === "company") {
      const requiredFields = ["name", "registrationNumber", "registrationDate", "address", "contactPerson"]
      requiredFields.forEach((field) => {
        if (!headers.some((h) => h.toLowerCase().includes(field.toLowerCase()))) {
          errors.push(`Missing required field: ${field}`)
        }
      })
    }

    setUploadErrors(errors)
  }

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault()

    if (!file) {
      setUploadErrors(["Please select a file to upload"])
      return
    }

    if (uploadErrors.length > 0) {
      return
    }

    setIsUploading(true)

    // Simulate file upload
    setTimeout(() => {
      setIsUploading(false)
      setUploadSuccess(true)
      onUpload({ file, fileType, entityType })

      // Reset form after successful upload
      setTimeout(() => {
        setFile(null)
        setPreviewData(null)
        setUploadSuccess(false)
      }, 3000)
    }, 1500)
  }

  return (
    <div className="card">
      <h2 className="text-2xl font-bold mb-4">
        Bulk Upload {entityType === "employee" ? "Employee Data" : "Company Data"}
      </h2>

      <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
        <div className="flex">
          <div className="ml-3">
            <p className="text-sm text-blue-700">
              {entityType === "employee" ? (
                <>
                  Upload employee data in bulk using CSV, Excel, or text files. The file should contain columns for
                  employee name, ID, department, role, start date, end date, and duties.
                </>
              ) : (
                <>
                  Upload company data in bulk using CSV, Excel, or text files. The file should contain columns for
                  company name, registration number, registration date, address, contact person, and other required
                  information.
                </>
              )}
            </p>
            {isVerificationStaff && (
              <p className="text-sm text-blue-700 mt-2">
                As a verification staff member, you can upload data for any company in the system.
              </p>
            )}
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="form-label">File Type</label>
          <div className="mt-2 flex items-center space-x-4">
            <div className="flex items-center">
              <input
                id="csv"
                name="fileType"
                type="radio"
                className="h-4 w-4 text-emerald-600 focus:ring-emerald-500"
                checked={fileType === "csv"}
                onChange={() => setFileType("csv")}
              />
              <label htmlFor="csv" className="ml-2 block text-sm text-gray-700">
                CSV
              </label>
            </div>
            <div className="flex items-center">
              <input
                id="excel"
                name="fileType"
                type="radio"
                className="h-4 w-4 text-emerald-600 focus:ring-emerald-500"
                checked={fileType === "excel"}
                onChange={() => setFileType("excel")}
              />
              <label htmlFor="excel" className="ml-2 block text-sm text-gray-700">
                Excel
              </label>
            </div>
            <div className="flex items-center">
              <input
                id="text"
                name="fileType"
                type="radio"
                className="h-4 w-4 text-emerald-600 focus:ring-emerald-500"
                checked={fileType === "text"}
                onChange={() => setFileType("text")}
              />
              <label htmlFor="text" className="ml-2 block text-sm text-gray-700">
                Text
              </label>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <label className="form-label">Upload File</label>
          <div className="mt-2 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
            <div className="space-y-1 text-center">
              <DocumentArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
              <div className="flex text-sm text-gray-600">
                <label
                  htmlFor="file-upload"
                  className="relative cursor-pointer bg-white rounded-md font-medium text-emerald-600 hover:text-emerald-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-emerald-500"
                >
                  <span>Upload a file</span>
                  <input
                    id="file-upload"
                    name="file-upload"
                    type="file"
                    className="sr-only"
                    accept={fileType === "csv" ? ".csv" : fileType === "excel" ? ".xlsx,.xls" : ".txt"}
                    onChange={handleFileChange}
                  />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs text-gray-500">
                {fileType === "csv" ? "CSV" : fileType === "excel" ? "Excel (.xlsx, .xls)" : "Text (.txt)"} up to 10MB
              </p>
            </div>
          </div>
          {file && (
            <p className="mt-2 text-sm text-gray-600">
              Selected file: <span className="font-medium">{file.name}</span>
            </p>
          )}
        </div>

        {/* File Preview */}
        {previewData && (
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2">File Preview</h3>
            <div className="overflow-x-auto border rounded-md">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {previewData.headers.map((header, index) => (
                      <th
                        key={index}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {previewData.rows.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      {previewData.headers.map((header, colIndex) => (
                        <td
                          key={`${rowIndex}-${colIndex}`}
                          className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                        >
                          {row[header] || ""}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-2 text-xs text-gray-500">
              Showing {previewData.rows.length} of {file ? file.size : 0} records
            </p>
          </div>
        )}

        {/* Validation Errors */}
        {uploadErrors.length > 0 && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4">
            <div className="flex">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Please fix the following errors before uploading:</h3>
                <ul className="mt-2 text-sm text-red-700 list-disc list-inside">
                  {uploadErrors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Success Message */}
        {uploadSuccess && (
          <div className="mb-6 bg-green-50 border-l-4 border-green-400 p-4">
            <div className="flex">
              <CheckCircleIcon className="h-5 w-5 text-green-400" />
              <div className="ml-3">
                <p className="text-sm text-green-700">File uploaded successfully! The data is being processed.</p>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end">
          <button type="submit" className="btn-primary" disabled={!file || isUploading || uploadErrors.length > 0}>
            {isUploading ? "Uploading..." : "Upload"}
          </button>
        </div>
      </form>
    </div>
  )
}
