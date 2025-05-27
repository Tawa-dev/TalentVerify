"use client"

import { useState } from "react"
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline"

export default function SearchForm({ onSearch, companies = [] }) {
  const [searchParams, setSearchParams] = useState({
    name: "",
    company: "",
    department: "",
    role: "",
    startYear: "",
    endYear: "",
  })

  const [advancedSearch, setAdvancedSearch] = useState(false)

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target
    setSearchParams({
      ...searchParams,
      [name]: value,
    })
  }

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault()
    onSearch(searchParams)
  }

  // Generate year options for select fields
  const generateYearOptions = () => {
    const currentYear = new Date().getFullYear()
    const years = []

    for (let year = currentYear; year >= currentYear - 20; year--) {
      years.push(year)
    }

    return years.map((year) => (
      <option key={year} value={year.toString()}>
        {year}
      </option>
    ))
  }

  return (
    <div className="card">
      <h2 className="text-2xl font-bold mb-4">Search Employee Records</h2>
      <p className="text-gray-500 mb-6">Search for employee records by name, company, position, or other criteria.</p>

      <form onSubmit={handleSubmit}>
        {/* Quick Search */}
        <div className="mb-6">
          <div className="relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </div>
            <input
              type="text"
              name="name"
              className="form-input pl-10 py-3"
              placeholder="Search by employee name..."
              value={searchParams.name}
              onChange={handleChange}
            />
            <button
              type="submit"
              className="absolute inset-y-0 right-0 px-4 flex items-center bg-emerald-600 text-white rounded-r-md hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
            >
              Search
            </button>
          </div>
        </div>

        {/* Toggle Advanced Search */}
        <div className="mb-6">
          <button
            type="button"
            className="text-emerald-600 hover:text-emerald-500 text-sm font-medium focus:outline-none"
            onClick={() => setAdvancedSearch(!advancedSearch)}
          >
            {advancedSearch ? "Hide Advanced Search" : "Show Advanced Search"}
          </button>
        </div>

        {/* Advanced Search Options */}
        {advancedSearch && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 mb-6 p-4 bg-gray-50 rounded-md">
            <div>
              <label htmlFor="company" className="form-label">
                Company
              </label>
              <select
                id="company"
                name="company"
                className="form-input"
                value={searchParams.company}
                onChange={handleChange}
              >
                <option value="">All Companies</option>
                {companies.map((company) => (
                  <option key={company.id} value={company.name}>
                    {company.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="department" className="form-label">
                Department
              </label>
              <input
                type="text"
                id="department"
                name="department"
                className="form-input"
                value={searchParams.department}
                onChange={handleChange}
                placeholder="Enter department"
              />
            </div>

            <div>
              <label htmlFor="role" className="form-label">
                Position/Role
              </label>
              <input
                type="text"
                id="role"
                name="role"
                className="form-input"
                value={searchParams.role}
                onChange={handleChange}
                placeholder="Enter position or role"
              />
            </div>

            <div>
              <label htmlFor="startYear" className="form-label">
                Year Started
              </label>
              <select
                id="startYear"
                name="startYear"
                className="form-input"
                value={searchParams.startYear}
                onChange={handleChange}
              >
                <option value="">Select year</option>
                {generateYearOptions()}
              </select>
            </div>

            <div>
              <label htmlFor="endYear" className="form-label">
                Year Left
              </label>
              <select
                id="endYear"
                name="endYear"
                className="form-input"
                value={searchParams.endYear}
                onChange={handleChange}
              >
                <option value="">Select year</option>
                {generateYearOptions()}
              </select>
            </div>

            <div className="md:col-span-2 flex justify-end">
              <button type="submit" className="btn-primary">
                Apply Filters
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  )
}
