import React, { useState } from 'react'
import { format } from 'date-fns'

export default function CompanyTable({ data, onEdit }) {
  console.log('CompanyTable received data:', data)
  const [expandedRows, setExpandedRows] = useState([])

  const toggleRow = (id) => {
    setExpandedRows(prevState => 
      prevState.includes(id)
        ? prevState.filter(rowId => rowId !== id)
        : [...prevState, id]
    )
  }

  // Ensure data is an array
  const companies = data?.results || []

  if (companies.length === 0) {
    return <p className="text-gray-500">No companies found.</p>
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reg Number</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reg Date</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact Person</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {companies.map((company) => (
            <React.Fragment key={company.id}>
              <tr className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => toggleRow(company.id)}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    {expandedRows.includes(company.id) ? '−' : '+'}
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{company.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">{company.registration_number}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {company.registration_date && format(new Date(company.registration_date), 'dd MMM yyyy')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{company.contact_person}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => onEdit(company)}
                    className="text-indigo-600 hover:text-indigo-900 mr-4"
                  >
                    Edit
                  </button>
                </td>
              </tr>
              {expandedRows.includes(company.id) && (
                <tr>
                  <td colSpan="6" className="px-6 py-4 bg-gray-50">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium text-gray-700">Address</h4>
                        <p className="text-gray-600">{company.address || 'Not provided'}</p>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-700">Contact Information</h4>
                        <p className="text-gray-600">Phone: {company.contact_phone || 'Not provided'}</p>
                        <p className="text-gray-600">Email: {company.email || 'Not provided'}</p>
                      </div>
                    </div>
                    <div className="mt-4">
                      <h4 className="font-medium text-gray-700">Departments</h4>
                      {company.departments && company.departments.length > 0 ? (
                        <ul className="list-disc list-inside text-gray-600">
                          {company.departments.map((dept) => (
                            <li key={dept.id}>{dept.name}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-gray-600">No departments listed</p>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  )
}