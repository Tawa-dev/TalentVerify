"use client"

import { useState, useEffect } from "react"
import { PlusIcon, XMarkIcon } from "@heroicons/react/24/outline"

export default function CompanyForm({ onSubmit, existingCompany = null }) {
  // Initialize form with existing company data or defaults
  const [formData, setFormData] = useState({
    name: "",
    registrationNumber: "",
    registrationDate: "",
    address: "",
    contactPerson: "",
    departments: [],
    employeeCount: "",
    phone: "",
    email: "",
  })

  // Load existing company data if provided
  useEffect(() => {
    if (existingCompany) {
      setFormData({
        ...existingCompany,
        departments: existingCompany.departments || [],
      })
    }
  }, [existingCompany])

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  // Add a new department field
  const addDepartment = () => {
    setFormData({
      ...formData,
      departments: [...formData.departments, ""],
    })
  }

  // Remove a department field
  const removeDepartment = (index) => {
    const updatedDepartments = [...formData.departments]
    updatedDepartments.splice(index, 1)
    setFormData({
      ...formData,
      departments: updatedDepartments,
    })
  }

  // Handle changes to department fields
  const handleDepartmentChange = (index, value) => {
    const updatedDepartments = [...formData.departments]
    updatedDepartments[index] = value
    setFormData({
      ...formData,
      departments: updatedDepartments,
    })
  }

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <div className="card">
      <h2 className="text-2xl font-bold mb-4">{existingCompany ? "Edit Company" : "Add Company"}</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information Section */}
        <div className="bg-gray-50 p-4 rounded-md">
          <h3 className="text-lg font-medium mb-4">Company Information</h3>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label htmlFor="name" className="form-label">
                Company Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                className="form-input"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label htmlFor="registrationNumber" className="form-label">
                Registration Number
              </label>
              <input
                type="text"
                id="registrationNumber"
                name="registrationNumber"
                className="form-input"
                value={formData.registrationNumber}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label htmlFor="registrationDate" className="form-label">
                Registration Date
              </label>
              <input
                type="date"
                id="registrationDate"
                name="registrationDate"
                className="form-input"
                value={formData.registrationDate}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label htmlFor="employeeCount" className="form-label">
                Number of Employees
              </label>
              <input
                type="number"
                id="employeeCount"
                name="employeeCount"
                className="form-input"
                value={formData.employeeCount}
                onChange={handleChange}
                required
                min="0"
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="address" className="form-label">
                Address
              </label>
              <textarea
                id="address"
                name="address"
                rows="2"
                className="form-input"
                value={formData.address}
                onChange={handleChange}
                required
              ></textarea>
            </div>
          </div>
        </div>

        {/* Contact Information Section */}
        <div className="bg-gray-50 p-4 rounded-md">
          <h3 className="text-lg font-medium mb-4">Contact Information</h3>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label htmlFor="contactPerson" className="form-label">
                Contact Person
              </label>
              <input
                type="text"
                id="contactPerson"
                name="contactPerson"
                className="form-input"
                value={formData.contactPerson}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label htmlFor="phone" className="form-label">
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                className="form-input"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label htmlFor="email" className="form-label">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                className="form-input"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>
        </div>

        {/* Departments Section */}
        <div className="bg-gray-50 p-4 rounded-md">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Departments</h3>
            <button
              type="button"
              onClick={addDepartment}
              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
            >
              <PlusIcon className="h-4 w-4 mr-1" />
              Add Department
            </button>
          </div>

          {formData.departments.length === 0 ? (
            <p className="text-gray-500 text-sm italic">No departments added.</p>
          ) : (
            <div className="space-y-3">
              {formData.departments.map((department, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="text"
                    className="form-input flex-grow"
                    value={department}
                    onChange={(e) => handleDepartmentChange(index, e.target.value)}
                    placeholder="Department name"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => removeDepartment(index)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-3">
          <button type="button" onClick={() => window.history.back()} className="btn-secondary">
            Cancel
          </button>
          <button type="submit" className="btn-primary">
            {existingCompany ? "Update Company" : "Add Company"}
          </button>
        </div>
      </form>
    </div>
  )
}
