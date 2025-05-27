"use client"

import { useState } from "react"
import Navbar from "../shared/navbar"
import EmployeeForm from "../forms/employee-form"
import BulkUploadForm from "../forms/bulk-upload-form"
import EmployeeList from "../lists/employee-list"
import EmployeeDetail from "../employee/employee-detail"
import { PlusIcon, ArrowPathIcon } from "@heroicons/react/24/outline"

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
]

export default function CompanyDashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState("dashboard")
  const [employees, setEmployees] = useState(SAMPLE_EMPLOYEES)
  const [selectedEmployee, setSelectedEmployee] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  // Get employee history based on employee ID
  const getEmployeeHistory = (employeeId) => {
    const index = employees.findIndex((emp) => emp.id === employeeId)
    if (index >= 0 && index < SAMPLE_EMPLOYEE_HISTORY.length) {
      return SAMPLE_EMPLOYEE_HISTORY[index]
    }
    return []
  }

  // Refresh data (simulated)
  const refreshData = () => {
    setRefreshTrigger((prev) => prev + 1)
  }

  // Add a new employee
  const handleAddEmployee = (employee) => {
    const newEmployee = {
      ...employee,
      id: employees.length + 1,
      company: user.company || "Your Company",
    }
    setEmployees([...employees, newEmployee])
    setActiveTab("employees")
  }

  // Update an existing employee
  const handleUpdateEmployee = (updatedEmployee) => {
    setEmployees(employees.map((emp) => (emp.id === updatedEmployee.id ? updatedEmployee : emp)))
    setSelectedEmployee(null)
    setIsEditing(false)
    setActiveTab("employees")
  }

  // Delete an employee
  const handleDeleteEmployee = (employee) => {
    if (window.confirm(`Are you sure you want to delete ${employee.name}?`)) {
      setEmployees(employees.filter((emp) => emp.id !== employee.id))
    }
  }

  // View employee details
  const handleViewEmployee = (employee) => {
    setSelectedEmployee(employee)
    setIsEditing(false)
    setActiveTab("employee-detail")
  }

  // Edit employee
  const handleEditEmployee = (employee) => {
    setSelectedEmployee(employee)
    setIsEditing(true)
    setActiveTab("edit-employee")
  }

  // Handle bulk upload
  const handleBulkUpload = (uploadData) => {
    // In a real application, this would process the uploaded file
    // For demo purposes, we'll just add some dummy data
    const dummyEmployees = [
      {
        id: employees.length + 1,
        name: "Bulk User 1",
        employeeId: "EMP004",
        department: "Sales",
        role: "Sales Representative",
        startDate: "2021-03-10",
        endDate: null,
        duties: "Client acquisition, sales presentations",
        company: user.company || "Your Company",
      },
      {
        id: employees.length + 2,
        name: "Bulk User 2",
        employeeId: "EMP005",
        department: "HR",
        role: "HR Specialist",
        startDate: "2020-07-22",
        endDate: null,
        duties: "Recruitment, employee relations",
        company: user.company || "Your Company",
      },
    ]

    setEmployees([...employees, ...dummyEmployees])
    setActiveTab("employees")
  }

  // Render content based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <div className="card">
            <h2 className="text-2xl font-bold mb-4">Company Dashboard</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-emerald-100 p-4 rounded-lg">
                <h3 className="font-bold text-emerald-800">Total Employees</h3>
                <p className="text-3xl font-bold">{employees.length}</p>
              </div>
              <div className="bg-blue-100 p-4 rounded-lg">
                <h3 className="font-bold text-blue-800">Active Employees</h3>
                <p className="text-3xl font-bold">{employees.filter((e) => !e.endDate).length}</p>
              </div>
              <div className="bg-amber-100 p-4 rounded-lg">
                <h3 className="font-bold text-amber-800">Former Employees</h3>
                <p className="text-3xl font-bold">{employees.filter((e) => e.endDate).length}</p>
              </div>
            </div>
            <div className="mt-6">
              <h3 className="text-xl font-bold mb-2">Quick Actions</h3>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => setActiveTab("employees")} className="btn-primary">
                  View Employees
                </button>
                <button onClick={() => setActiveTab("add-employee")} className="btn-primary">
                  Add Employee
                </button>
                <button onClick={() => setActiveTab("upload")} className="btn-primary">
                  Bulk Upload
                </button>
              </div>
            </div>

            <div className="mt-8">
              <h3 className="text-xl font-bold mb-4">Recent Employee Updates</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Department
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {employees.slice(0, 5).map((employee) => (
                      <tr
                        key={employee.id}
                        className="hover:bg-gray-50 cursor-pointer"
                        onClick={() => handleViewEmployee(employee)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {employee.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{employee.department}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{employee.role}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              employee.endDate ? "bg-gray-100 text-gray-800" : "bg-green-100 text-green-800"
                            }`}
                          >
                            {employee.endDate ? "Former" : "Active"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )
      case "employees":
        return (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Employee Management</h2>
              <div className="flex space-x-2">
                <button
                  onClick={refreshData}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                >
                  <ArrowPathIcon className="h-4 w-4 mr-1" />
                  Refresh
                </button>
                <button
                  onClick={() => setActiveTab("add-employee")}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                >
                  <PlusIcon className="h-4 w-4 mr-1" />
                  Add Employee
                </button>
              </div>
            </div>
            <EmployeeList
              employees={employees}
              onView={handleViewEmployee}
              onEdit={handleEditEmployee}
              onDelete={handleDeleteEmployee}
              canEdit={true}
            />
          </div>
        )
      case "add-employee":
        return <EmployeeForm onSubmit={handleAddEmployee} />
      case "edit-employee":
        return selectedEmployee ? (
          <EmployeeForm onSubmit={handleUpdateEmployee} existingEmployee={selectedEmployee} />
        ) : (
          <div>No employee selected for editing.</div>
        )
      case "employee-detail":
        return selectedEmployee ? (
          <EmployeeDetail
            employee={selectedEmployee}
            employeeHistory={getEmployeeHistory(selectedEmployee.id)}
            onBack={() => setActiveTab("employees")}
            canEdit={true}
            onEdit={handleEditEmployee}
          />
        ) : (
          <div>No employee selected.</div>
        )
      case "upload":
        return <BulkUploadForm onUpload={handleBulkUpload} entityType="employee" />
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
            <nav className="-mb-px flex space-x-8 overflow-x-auto" aria-label="Tabs">
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
                onClick={() => setActiveTab("employees")}
                className={`${
                  activeTab === "employees"
                    ? "border-emerald-500 text-emerald-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Employees
              </button>
              <button
                onClick={() => setActiveTab("add-employee")}
                className={`${
                  activeTab === "add-employee"
                    ? "border-emerald-500 text-emerald-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Add Employee
              </button>
              <button
                onClick={() => setActiveTab("upload")}
                className={`${
                  activeTab === "upload"
                    ? "border-emerald-500 text-emerald-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Bulk Upload
              </button>
              {(activeTab === "employee-detail" || activeTab === "edit-employee") && (
                <button className="border-emerald-500 text-emerald-600 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm">
                  {isEditing ? "Edit Employee" : "Employee Details"}
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
