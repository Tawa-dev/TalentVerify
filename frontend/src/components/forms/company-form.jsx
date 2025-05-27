"use client"

import { useState, useEffect } from "react"
import { PlusIcon, XMarkIcon, EyeIcon, EyeSlashIcon, ArrowPathIcon, CheckIcon, ClipboardIcon } from "@heroicons/react/24/outline"
import { createCompanyWithUser, generatePassword } from "../../api/companyApi"

export default function CompanyForm({ onSubmit, existingCompany = null, onSuccess, onError }) {
  // Initialize form with existing company data or defaults
  const [formData, setFormData] = useState({
    company: {
      name: "",
      registration_number: "",
      registration_date: "",
      address: "",
      contact_person: "",
      number_of_employees: "",
      contact_phone: "",
      email_address: "",
    },
    departments: [],
    user: {
      email: "",
      password: "",
    }
  })

  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [passwordCopied, setPasswordCopied] = useState(false)

  // Load existing company data if provided
  useEffect(() => {
    if (existingCompany) {
      setFormData({
        company: {
          ...existingCompany,
        },
        departments: existingCompany.departments || [],
        user: {
          email: existingCompany.email_address || "",
          password: "",
        }
      })
    }
  }, [existingCompany])

  // Handle form input changes for company fields
  const handleCompanyChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      company: {
        ...formData.company,
        [name]: value,
      }
    })
  }

  // Handle user field changes
  const handleUserChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      user: {
        ...formData.user,
        [name]: value,
      }
    })
  }

  // Add a new department field
  const addDepartment = () => {
    setFormData({
      ...formData,
      departments: [...formData.departments, { name: "" }],
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
    updatedDepartments[index] = { name: value }
    setFormData({
      ...formData,
      departments: updatedDepartments,
    })
  }

  // Generate a new password
  const handleGeneratePassword = () => {
    const newPassword = generatePassword(12)
    setFormData({
      ...formData,
      user: {
        ...formData.user,
        password: newPassword,
      }
    })
    setPasswordCopied(false)
  }

  // Copy password to clipboard
  const copyPasswordToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(formData.user.password)
      setPasswordCopied(true)
      setTimeout(() => setPasswordCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy password:', err)
    }
  }

  // Auto-fill user email from company email when company email changes
  useEffect(() => {
    if (formData.company.email_address && !formData.user.email) {
      setFormData(prev => ({
        ...prev,
        user: {
          ...prev.user,
          email: prev.company.email_address
        }
      }))
    }
  }, [formData.company.email_address])

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // If this is an existing company, use the provided onSubmit
      if (existingCompany && onSubmit) { 
        await onSubmit(formData)
      } else {
        // Create new company with user
        const result = await createCompanyWithUser(formData)
        console.log('Company created successfully:', result)
        
        if (onSuccess) {
          onSuccess(result)
        }
      }
    } catch (error) {
      console.error('Error submitting form:', error)
      if (onError) {
        onError(error.message)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          {existingCompany ? "Edit Company" : "Create New Company"}
        </h2>
        <p className="text-gray-600">
          {existingCompany 
            ? "Update the company information below" 
            : "Fill in the details to register a new company and create a user account"
          }
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Company Information */}
        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <span className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-sm font-bold mr-3">
              1
            </span>
            Company Information
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="sm:col-span-2">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Company Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm 
                         focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 
                         transition-colors duration-200 bg-white text-gray-900
                         placeholder-gray-400"
                placeholder="Enter company name"
                value={formData.company.name}
                onChange={handleCompanyChange}
                required
              />
            </div>

            <div>
              <label htmlFor="registration_number" className="block text-sm font-medium text-gray-700 mb-2">
                Registration Number *
              </label>
              <input
                type="text"
                id="registration_number"
                name="registration_number"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm 
                         focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 
                         transition-colors duration-200 bg-white text-gray-900
                         placeholder-gray-400"
                placeholder="e.g., REG123456"
                value={formData.company.registration_number}
                onChange={handleCompanyChange}
                required
              />
            </div>

            <div>
              <label htmlFor="registration_date" className="block text-sm font-medium text-gray-700 mb-2">
                Registration Date *
              </label>
              <input
                type="date"
                id="registration_date"
                name="registration_date"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm 
                         focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 
                         transition-colors duration-200 bg-white text-gray-900"
                value={formData.company.registration_date}
                onChange={handleCompanyChange}
                required
              />
            </div>

            <div>
              <label htmlFor="number_of_employees" className="block text-sm font-medium text-gray-700 mb-2">
                Number of Employees *
              </label>
              <input
                type="number"
                id="number_of_employees"
                name="number_of_employees"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm 
                         focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 
                         transition-colors duration-200 bg-white text-gray-900
                         placeholder-gray-400"
                placeholder="e.g., 50"
                value={formData.company.number_of_employees}
                onChange={handleCompanyChange}
                required
                min="1"
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                Company Address *
              </label>
              <textarea
                id="address"
                name="address"
                rows="3"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm 
                         focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 
                         transition-colors duration-200 bg-white text-gray-900
                         placeholder-gray-400 resize-none"
                placeholder="Enter complete address including city, state, and postal code"
                value={formData.company.address}
                onChange={handleCompanyChange}
                required
              />
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <span className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-sm font-bold mr-3">
              2
            </span>
            Contact Information
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label htmlFor="contact_person" className="block text-sm font-medium text-gray-700 mb-2">
                Contact Person *
              </label>
              <input
                type="text"
                id="contact_person"
                name="contact_person"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm 
                         focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 
                         transition-colors duration-200 bg-white text-gray-900
                         placeholder-gray-400"
                placeholder="Full name"
                value={formData.company.contact_person}
                onChange={handleCompanyChange}
                required
              />
            </div>

            <div>
              <label htmlFor="contact_phone" className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number *
              </label>
              <input
                type="tel"
                id="contact_phone"
                name="contact_phone"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm 
                         focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 
                         transition-colors duration-200 bg-white text-gray-900
                         placeholder-gray-400"
                placeholder="+1 (555) 123-4567"
                value={formData.company.contact_phone}
                onChange={handleCompanyChange}
                required
              />
            </div>

            <div className="sm:col-span-2 lg:col-span-1">
              <label htmlFor="email_address" className="block text-sm font-medium text-gray-700 mb-2">
                Company Email *
              </label>
              <input
                type="email"
                id="email_address"
                name="email_address"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm 
                         focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 
                         transition-colors duration-200 bg-white text-gray-900
                         placeholder-gray-400"
                placeholder="company@example.com"
                value={formData.company.email_address}
                onChange={handleCompanyChange}
                required
              />
            </div>
          </div>
        </div>

        {/* User Account Information */}
        {!existingCompany && (
          <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
            <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold mr-3">
                3
              </span>
              User Account
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label htmlFor="user_email" className="block text-sm font-medium text-gray-700 mb-2">
                  User Email *
                </label>
                <input
                  type="email"
                  id="user_email"
                  name="email"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm 
                           focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                           transition-colors duration-200 bg-white text-gray-900
                           placeholder-gray-400"
                  placeholder="user@company.com"
                  value={formData.user.email}
                  onChange={handleUserChange}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  This will be used to log into the system
                </p>
              </div>

              <div>
                <label htmlFor="user_password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="user_password"
                    name="password"
                    className="w-full px-4 py-3 pr-20 border border-gray-300 rounded-lg shadow-sm 
                             focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                             transition-colors duration-200 bg-white text-gray-900
                             placeholder-gray-400"
                    placeholder="Enter password"
                    value={formData.user.password}
                    onChange={handleUserChange}
                    required
                    minLength="8"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 space-x-1">
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-gray-400 hover:text-gray-600 p-1"
                      title={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <EyeSlashIcon className="h-4 w-4" />
                      ) : (
                        <EyeIcon className="h-4 w-4" />
                      )}
                    </button>
                    {formData.user.password && (
                      <button
                        type="button"
                        onClick={copyPasswordToClipboard}
                        className="text-gray-400 hover:text-gray-600 p-1"
                        title="Copy password"
                      >
                        {passwordCopied ? (
                          <CheckIcon className="h-4 w-4 text-green-500" />
                        ) : (
                          <ClipboardIcon className="h-4 w-4" />
                        )}
                      </button>
                    )}
                  </div>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <p className="text-xs text-gray-500">
                    Minimum 8 characters required
                  </p>
                  <button
                    type="button"
                    onClick={handleGeneratePassword}
                    className="inline-flex items-center px-3 py-1 text-xs font-medium text-blue-600 hover:text-blue-700 border border-blue-300 rounded-md hover:bg-blue-50 transition-colors duration-200"
                  >
                    <ArrowPathIcon className="h-3 w-3 mr-1" />
                    Generate
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Departments Section */}
        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
            <h3 className="text-xl font-semibold text-gray-900 flex items-center">
              <span className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-sm font-bold mr-3">
                {existingCompany ? "3" : "4"}
              </span>
              Departments
            </h3>
            <button
              type="button"
              onClick={addDepartment}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors duration-200"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Add Department
            </button>
          </div>

          {formData.departments.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <PlusIcon className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-gray-500 text-sm">
                No departments added yet. Click "Add Department" to get started.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {formData.departments.map((department, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200">
                  <span className="text-sm font-medium text-gray-500 min-w-0 flex-shrink-0">
                    {index + 1}.
                  </span>
                  <input
                    type="text"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm 
                             focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 
                             transition-colors duration-200 bg-white text-gray-900
                             placeholder-gray-400"
                    value={typeof department === 'object' ? department.name || '' : department}
                    onChange={(e) => handleDepartmentChange(index, e.target.value)}
                    placeholder="Department name"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => removeDepartment(index)}
                    className="flex-shrink-0 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors duration-200"
                    title="Remove department"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Form Actions */}
        <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t border-gray-200">
          <button 
            type="button" 
            onClick={() => window.history.back()} 
            className="inline-flex justify-center items-center px-6 py-3 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors duration-200"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="inline-flex justify-center items-center px-6 py-3 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
                {existingCompany ? "Updating..." : "Creating..."}
              </>
            ) : (
              existingCompany ? "Update Company" : "Create Company"
            )}
          </button>
        </div>
      </form>
    </div>
  )
}