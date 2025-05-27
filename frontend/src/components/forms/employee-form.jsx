"use client"

import { useState, useEffect } from "react"
import { PlusIcon, XMarkIcon } from "@heroicons/react/24/outline"

export default function EmployeeForm({
  onSubmit,
  existingEmployee = null,
  companies = [],
  isVerificationStaff = false,
}) {
  // Initialize form with existing employee data or defaults
  const [formData, setFormData] = useState({
    name: "",
    employeeId: "",
    company: "",
    department: "",
    role: "",
    startDate: "",
    endDate: "",
    duties: "",
    previousRoles: [],
  })

  // Load existing employee data if provided
  useEffect(() => {
    if (existingEmployee) {
      setFormData({
        ...existingEmployee,
        previousRoles: existingEmployee.previousRoles || [],
      })
    }
  }, [existingEmployee])

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  // Add a new previous role field
  const addPreviousRole = () => {
    setFormData({
      ...formData,
      previousRoles: [
        ...formData.previousRoles,
        {
          id: Date.now(), // Temporary ID for UI purposes
          company: "",
          department: "",
          role: "",
          startDate: "",
          endDate: "",
          duties: "",
        },
      ],
    })
  }

  // Remove a previous role field
  const removePreviousRole = (id) => {
    setFormData({
      ...formData,
      previousRoles: formData.previousRoles.filter((role) => role.id !== id),
    })
  }

  // Handle changes to previous role fields
  const handlePreviousRoleChange = (id, field, value) => {
    setFormData({
      ...formData,
      previousRoles: formData.previousRoles.map((role) => {
        if (role.id === id) {
          return { ...role, [field]: value }
        }
        return role
      }),
    })
  }

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <div className="card">
      <h2 className="text-2xl font-bold mb-4">{existingEmployee ? "Edit Employee" : "Add Employee"}</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information Section */}
        <div className="bg-gray-50 p-4 rounded-md">
          <h3 className="text-lg font-medium mb-4">Basic Information</h3>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label htmlFor="name" className="form-label">
                Full Name
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
              <label htmlFor="employeeId" className="form-label">
                Employee ID
              </label>
              <input
                type="text"
                id="employeeId"
                name="employeeId"
                className="form-input"
                value={formData.employeeId}
                onChange={handleChange}
                required
              />
            </div>

            {/* Company field - only editable by verification staff */}
            {isVerificationStaff ? (
              <div>
                <label htmlFor="company" className="form-label">
                  Company
                </label>
                <select
                  id="company"
                  name="company"
                  className="form-input"
                  value={formData.company}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Company</option>
                  {companies.map((company) => (
                    <option key={company.id} value={company.name}>
                      {company.name}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div>
                <label htmlFor="company" className="form-label">
                  Company
                </label>
                <input
                  type="text"
                  id="company"
                  name="company"
                  className="form-input bg-gray-100"
                  value={formData.company || "Your Company"}
                  readOnly
                />
              </div>
            )}
          </div>
        </div>

        {/* Current Role Section */}
        <div className="bg-gray-50 p-4 rounded-md">
          <h3 className="text-lg font-medium mb-4">Current Role</h3>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label htmlFor="department" className="form-label">
                Department
              </label>
              <input
                type="text"
                id="department"
                name="department"
                className="form-input"
                value={formData.department}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label htmlFor="role" className="form-label">
                Role
              </label>
              <input
                type="text"
                id="role"
                name="role"
                className="form-input"
                value={formData.role}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label htmlFor="startDate" className="form-label">
                Start Date
              </label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                className="form-input"
                value={formData.startDate}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label htmlFor="endDate" className="form-label">
                End Date (if applicable)
              </label>
              <input
                type="date"
                id="endDate"
                name="endDate"
                className="form-input"
                value={formData.endDate || ""}
                onChange={handleChange}
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="duties" className="form-label">
                Duties and Responsibilities
              </label>
              <textarea
                id="duties"
                name="duties"
                rows="3"
                className="form-input"
                value={formData.duties}
                onChange={handleChange}
                required
              ></textarea>
            </div>
          </div>
        </div>

        {/* Previous Roles Section */}
        <div className="bg-gray-50 p-4 rounded-md">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Previous Roles</h3>
            <button
              type="button"
              onClick={addPreviousRole}
              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
            >
              <PlusIcon className="h-4 w-4 mr-1" />
              Add Previous Role
            </button>
          </div>

          {formData.previousRoles.length === 0 ? (
            <p className="text-gray-500 text-sm italic">No previous roles added.</p>
          ) : (
            <div className="space-y-6">
              {formData.previousRoles.map((role, index) => (
                <div key={role.id} className="border border-gray-200 rounded-md p-4 relative">
                  <button
                    type="button"
                    onClick={() => removePreviousRole(role.id)}
                    className="absolute top-2 right-2 text-gray-400 hover:text-gray-500"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>

                  <h4 className="font-medium text-gray-700 mb-3">Previous Role #{index + 1}</h4>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {isVerificationStaff && (
                      <div>
                        <label className="form-label">Company</label>
                        <select
                          className="form-input"
                          value={role.company}
                          onChange={(e) => handlePreviousRoleChange(role.id, "company", e.target.value)}
                          required
                        >
                          <option value="">Select Company</option>
                          {companies.map((company) => (
                            <option key={company.id} value={company.name}>
                              {company.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    <div>
                      <label className="form-label">Department</label>
                      <input
                        type="text"
                        className="form-input"
                        value={role.department}
                        onChange={(e) => handlePreviousRoleChange(role.id, "department", e.target.value)}
                        required
                      />
                    </div>

                    <div>
                      <label className="form-label">Role</label>
                      <input
                        type="text"
                        className="form-input"
                        value={role.role}
                        onChange={(e) => handlePreviousRoleChange(role.id, "role", e.target.value)}
                        required
                      />
                    </div>

                    <div>
                      <label className="form-label">Start Date</label>
                      <input
                        type="date"
                        className="form-input"
                        value={role.startDate}
                        onChange={(e) => handlePreviousRoleChange(role.id, "startDate", e.target.value)}
                        required
                      />
                    </div>

                    <div>
                      <label className="form-label">End Date</label>
                      <input
                        type="date"
                        className="form-input"
                        value={role.endDate}
                        onChange={(e) => handlePreviousRoleChange(role.id, "endDate", e.target.value)}
                        required
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="form-label">Duties</label>
                      <textarea
                        rows="2"
                        className="form-input"
                        value={role.duties}
                        onChange={(e) => handlePreviousRoleChange(role.id, "duties", e.target.value)}
                        required
                      ></textarea>
                    </div>
                  </div>
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
            {existingEmployee ? "Update Employee" : "Add Employee"}
          </button>
        </div>
      </form>
    </div>
  )
}
