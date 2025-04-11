import { useDropzone } from 'react-dropzone'

export default function BulkUpload() {
  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
    },
    onDrop: acceptedFiles => {
      // Handle file upload logic
      console.log(acceptedFiles)
    }
  })

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Bulk Upload</h2>
      <div 
        {...getRootProps()}
        className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500"
      >
        <input {...getInputProps()} />
        <p>Drag & drop files here, or click to select files</p>
        <p className="text-sm text-gray-500 mt-2">Supports CSV, XLS, XLSX</p>
      </div>
    </div>
  )
}