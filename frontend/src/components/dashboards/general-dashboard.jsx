"use client"

import { useState } from "react"
import Navbar from "../shared/navbar"
import SearchForm from "../forms/search-form"
import EmployeeList from "../lists/employee-list"
import EmployeeDetail from "../employee/employee-detail"

// Sample data for demonstration
const SAMPLE_EMPLOYEES = [
  {
    id: 1,
    name: "John Doe",
    employeeId: "EMP001",
    department: "Engineering",
    role: "Software Developer",
    startDate: "2020-01-15",
    endDate: null,
    duties: "Frontend development, UI/UX design",
    company: "Acme Corporation",
  },
  {
    id: 2,
    name: "Jane Smith",
    employeeId: "EMP002",
    department: "Marketing",
    role: "Marketing Specialist",
    startDate: "2019-05-20",
    endDate: null,
    duties: "Social media campaigns, content creation",
    company: "Acme Corporation",
  },
  {
    id: 3,
    name: "Robert Johnson",
    employeeId: "EMP003",
    department: "Finance",
    role: "Financial Analyst",
    startDate: "2018-11-10",
    endDate: "2022-03-15",
    duties: "Financial reporting, budget analysis",
    company: "Acme Corporation",
  },
  {
    id: 4,
    name: "Emily Chen",
    employeeId: "TS001",
    department: "Development",
    role: "Senior Developer",
    startDate: "2017-08-12",
    endDate: null,
    duties: "Backend development, system architecture",
    company: "TechStart Inc.",
  },
]

// Sample companies for dropdown
const SAMPLE_COMPANIES = [
  {
    id: 1,
    name: "Acme Corporation",
  },
  {
    id: 2,
    name: "TechStart Inc.",
  },
  {
    id: 3,
    name: "Global Media",
  },
  {
    id: 4,
    name: "Investment Partners",
  },
]

// Sample employee history data
const SAMPLE_EMPLOYEE_HISTORY = [
  // John Doe's history
  [
    {
      id: 101,
      company: "Acme Corporation",
      department: "Engineering",
      role: "Software Developer",
      startDate: "2020-01-15",
      endDate: null,
      duties: "Frontend development, UI/UX design",
      achievements: "Improved application performance by 30%",
    },
    {
      id: 102,
      company: "Acme Corporation",
      department: "Engineering",
      role: "Junior Developer",
      startDate: "2018-06-10",
      endDate: "2020-01-14",
      duties: "Bug fixing, feature implementation",
      achievements: "Resolved over 200 bugs in the first year",
    },
    {
      id: 103,
      company: "Tech Innovators",
      department: "Development",
      role: "Intern",
      startDate: "2017-05-01",
      endDate: "2018-05-30",
      duties: "Assisted senior developers, learned coding practices",
      achievements: "Developed a utility tool used by the entire team",
    },
  ],
  // Jane Smith's history
  [
    {
      id: 201,
      company: "Acme Corporation",
      department: "Marketing",
      role: "Marketing Specialist",
      startDate: "2019-05-20",
      endDate: null,
      duties: "Social media campaigns, content creation",
      achievements: "Increased social media engagement by 45%",
    },
    {
      id: 202,
      company: "Global Media",
      department: "Digital Marketing",
      role: "Marketing Assistant",
      startDate: "2017-08-15",
      endDate: "2019-05-10",
      duties: "Content writing, campaign analytics",
      achievements: "Contributed to award-winning marketing campaign",
    },
  ],
  // Robert Johnson's history
  [
    {
      id: 301,
      company: "Acme Corporation",
      department: "Finance",
      role: "Financial Analyst",
      startDate: "2018-11-10",
      endDate: "2022-03-15",
      duties: "Financial reporting, budget analysis",
      achievements: "Identified cost-saving opportunities worth $500K",
    },
    {
      id: 302,
      company: "Investment Partners",
      department: "Analysis",
      role: "Junior Analyst",
      startDate: "2016-07-01",
      endDate: "2018-10-31",
      duties: "Market research, financial modeling",
      achievements: "Developed new financial model adopted by the team",
    },
  ],
  // Emily Chen's history
  [
    {
      id: 401,
      company: "TechStart Inc.",
      department: "Development",
      role: "Senior Developer",
      startDate: "2017-08-12",
      endDate: null,
      duties: "Backend development, system architecture",
      achievements: "Led the development of the company's core API",
    },
    {
      id: 402,
      company: "CodeCraft",
      department: "Engineering",
      role: "Developer",
      startDate: "2015-03-01",
      endDate: "2017-08-01",
      duties: "Full-stack development, database design",
      achievements: "Implemented CI/CD pipeline reducing deployment time by 40%",
    },
  ],
]

export default function GeneralDashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState("dashboard")
  const [searchResults, setSearchResults] = useState([])
  const [hasSearched, setHasSearched] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState(null)

  // Get employee history based on employee ID
  const getEmployeeHistory = (employeeId) => {
    const index = SAMPLE_EMPLOYEES.findIndex((emp) => emp.id === employeeId)
    if (index >= 0 && index < SAMPLE_EMPLOYEE_HISTORY.length) {
      return SAMPLE_EMPLOYEE_HISTORY[index]
    }
    return []
  }

  // Handle search
  const handleSearch = (searchParams) => {
    // In a real application, this would be an API call with the search parameters
    // For demo purposes, we'll just filter the sample data

    let results = [...SAMPLE_EMPLOYEES]

    if (searchParams.name) {
      results = results.filter((emp) => emp.name.toLowerCase().includes(searchParams.name.toLowerCase()))
    }

    if (searchParams.company) {
      results = results.filter((emp) => emp.company.toLowerCase().includes(searchParams.company.toLowerCase()))
    }

    if (searchParams.department) {
      results = results.filter((emp) => emp.department.toLowerCase().includes(searchParams.department.toLowerCase()))
    }

    if (searchParams.role) {
      results = results.filter((emp) => emp.role.toLowerCase().includes(searchParams.role.toLowerCase()))
    }

    if (searchParams.startYear) {
      results = results.filter((emp) => {
        const year = new Date(emp.startDate).getFullYear()
        return year.toString() === searchParams.startYear
      })
    }

    if (searchParams.endYear) {
      results = results.filter((emp) => {
        if (!emp.endDate) return false
        const year = new Date(emp.endDate).getFullYear()
        return year.toString() === searchParams.endYear
      })
    }

    setSearchResults(results)
    setHasSearched(true)
  }

  // View employee details
  const handleViewEmployee = (employee) => {
    setSelectedEmployee(employee)
    setActiveTab("employee-detail")
  }

  // Render content based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <div className="card">
            <h2 className="text-2xl font-bold mb-4">Welcome to Talent Verify</h2>
            <p className="mb-4">Use the search functionality to verify employee information across companies.</p>
            <div className="mt-6">
              <h3 className="text-xl font-bold mb-2">Quick Actions</h3>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => setActiveTab("search")} className="btn-primary">
                  Search Employees
                </button>
              </div>
            </div>

            <div className="mt-8 bg-blue-50 border-l-4 border-blue-400 p-4">
              <div className="flex">
                <div className="ml-3">
                  <p className="text-sm text-blue-700">
                    <strong>About Talent Verify:</strong> Our platform allows you to verify employment history and
                    professional credentials of individuals across multiple companies. This helps in making informed
                    hiring decisions and verifying candidate information.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )
      case "search":
        return (
          <div>
            <SearchForm onSearch={handleSearch} companies={SAMPLE_COMPANIES} />

            {hasSearched && (
              <div className="mt-6">
                <h3 className="text-xl font-bold mb-2">Search Results</h3>
                {searchResults.length > 0 ? (
                  <EmployeeList employees={searchResults} onView={handleViewEmployee} canEdit={false} />
                ) : (
                  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                    <div className="flex">
                      <div className="ml-3">
                        <p className="text-sm text-yellow-700">No employees found matching your search criteria.</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )
      case "employee-detail":
        return selectedEmployee ? (
          <EmployeeDetail
            employee={selectedEmployee}
            employeeHistory={getEmployeeHistory(selectedEmployee.id)}
            onBack={() => setActiveTab(hasSearched ? "search" : "dashboard")}
            canEdit={false}
          />
        ) : (
          <div>No employee selected.</div>
        )
      default:
        return <div>Select a tab</div>
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} onLogout={onLogout} />

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-4 border-b border-gray-200">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
              <button
                onClick={() => setActiveTab("dashboard")}
                className={`${
                  activeTab === "dashboard"
                    ? "border-emerald-500 text-emerald-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Dashboard
              </button>
              <button
                onClick={() => setActiveTab("search")}
                className={`${
                  activeTab === "search"
                    ? "border-emerald-500 text-emerald-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Search
              </button>
              {activeTab === "employee-detail" && (
                <button className="border-emerald-500 text-emerald-600 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm">
                  Employee Details
                </button>
              )}
            </nav>
          </div>

          {renderContent()}
        </div>
      </div>
    </div>
  )
}
