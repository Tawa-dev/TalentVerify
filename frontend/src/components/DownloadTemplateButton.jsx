import { useState } from 'react'

export default function DownloadTemplateButton({ templateType = 'employees' }) {
  const [isGenerating, setIsGenerating] = useState(false)
  
  const generateCSV = () => {
    setIsGenerating(true)
    
    try {
      let headers, sampleRow
      
      if (templateType === 'employees') {
        headers = ['name', 'employee_id', 'department', 'role', 'date_started', 'date_left', 'duties']
        sampleRow = ['John Doe', 'EMP001', 'HR', 'HR Manager', '2023-01-01', '', 'Management of HR department']
      } else if (templateType === 'companies') {
        headers = ['name', 'registration_date', 'registration_number', 'address', 'contact_person', 'contact_phone', 'email']
        sampleRow = ['Acme Corp', '2020-05-15', 'REG12345', '123 Main St', 'Jane Smith', '555-1234', 'contact@acmecorp.com']
      } else {
        throw new Error('Unknown template type')
      }
      
      const csvContent = [
        headers.join(','),
        sampleRow.join(',')
      ].join('\n')
      
      // Create downloadable link
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      
      link.setAttribute('href', url)
      link.setAttribute('download', `${templateType}_template.csv`)
      link.style.visibility = 'hidden'
      
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
    } catch (error) {
      console.error('Error generating template:', error)
    } finally {
      setIsGenerating(false)
    }
  }
  
  return (
    <button
      onClick={generateCSV}
      disabled={isGenerating}
      className="text-blue-500 hover:text-blue-700 underline text-sm"
    >
      {isGenerating ? 'Generating...' : `Download ${templateType} template`}
    </button>
  )
}