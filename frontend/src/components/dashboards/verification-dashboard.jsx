"use client"

import { useState, useEffect } from "react"
import Navbar from "../shared/navbar"
import CompanyList from "../lists/company-list"
import EmployeeList from "../lists/employee-list"
import VerificationTaskList from "../lists/verification-task-list"
import EmployeeDetail from "../employee/employee-detail"
import EmployeeForm from "../forms/employee-form"
import CompanyForm from "../forms/company-form"
import BulkUploadForm from "../forms/bulk-upload-form"
import { PlusIcon, ArrowPathIcon } from "@heroicons/react/24/outline"
import api from '../../utils/axiosConfig'
import { getToken } from '../../utils/auth'
import { getCompanies, deleteCompany, updateCompanyWithDepartments } from '../../api/companyApi'
import toast from 'react-hot-toast'
import { Toaster } from 'react-hot-toast'

// Keep sample data for employees and tasks (as requested)
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

const SAMPLE_TASKS = [
  {
    id: 1,
    type: "Company Verification",
    status: "Pending",
    company: "Acme Corporation",
    createdAt: "2023-05-10",
    assignedTo: "Verification Staff",
  },
  {
    id: 2,
    type: "Employee Verification",
    status: "In Progress",
    company: "TechStart Inc.",
    employee: "Emily Chen",
    createdAt: "2023-05-12",
    assignedTo: "Verification Staff",
  },
  {
    id: 3,
    type: "Document Verification",
    status: "Completed",
    company: "Acme Corporation",
    createdAt: "2023-05-05",
    completedAt: "2023-05-08",
    assignedTo: "Verification Staff",
  },
]

export default function VerificationDashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState("dashboard")
  const [companies, setCompanies] = useState([])
  const [companiesLoading, setCompaniesLoading] = useState(false)
  const [companiesError, setCompaniesError] = useState(null)
  const [employees, setEmployees] = useState(SAMPLE_EMPLOYEES)
  const [tasks, setTasks] = useState(SAMPLE_TASKS)
  const [selectedEmployee, setSelectedEmployee] = useState(null)
  const [selectedCompany, setSelectedCompany] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  // Fetch companies from backend
  const fetchCompanies = async () => {
    setCompaniesLoading(true)
    setCompaniesError(null)
    try {
      const data = await getCompanies()
      setCompanies(data)
    } catch (error) {
      console.error('Error fetching companies:', error)
      setCompaniesError(error.message || 'Failed to fetch companies')
    } finally {
      setCompaniesLoading(false)
    }
  }

  // Load companies on component mount and when refresh is triggered
  useEffect(() => {
    fetchCompanies()
  }, [refreshTrigger])

  // Get employee history based on employee ID
  const getEmployeeHistory = (employeeId) => {
    const index = employees.findIndex((emp) => emp.id === employeeId)
    if (index >= 0 && index < SAMPLE_EMPLOYEE_HISTORY.length) {
      return SAMPLE_EMPLOYEE_HISTORY[index]
    }
    return []
  }

  // Refresh data
  const refreshData = () => {
    setRefreshTrigger((prev) => prev + 1)
  }

  // Add a new employee
  const handleAddEmployee = (employee) => {
    const newEmployee = {
      ...employee,
      id: employees.length + 1,
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

  // Add a new company
  const handleAddCompany = async (company) => {
    try {
      const token = getToken();
      console.log('Token:', token);
      const response = await api.post('/companies/', {
        name: company.company.name,
        registration_date: company.company.registration_date,
        registration_number: company.company.registration_number,
        address: company.company.address,
        contact_person: company.company.contact_person,
        contact_phone: company.company.contact_phone,
        email_address: company.company.email_address,
        website: company.company.website || '',
        number_of_employees: company.company.number_of_employees || 0,
        departments: company.departments 
      });
      const newCompany = response.data;
      setCompanies([...companies, newCompany]);

      toast.success('Company created successfully!');
      setActiveTab("companies");
      refreshData(); // Refresh the companies list
    } catch (error) {
      console.error('Error creating company:', error);
      toast.error('Failed to create company. Please try again.');
    }
  }

  // Update an existing company
  const handleUpdateCompany = async (updatedCompany) => {
    console.log(updatedCompany);
    
    try {
      // Use the new endpoint that handles both company and departments
      await updateCompanyWithDepartments(selectedCompany.id, updatedCompany);
      
      toast.success('Company updated successfully!');
      setSelectedCompany(null);
      setIsEditing(false);
      setActiveTab("companies");
      refreshData();
    } catch (error) {
      console.error('Error updating company:', error);
      toast.error(error.message || 'Failed to update company. Please try again.');
    }
  }

  // Delete a company
  const handleDeleteCompany = async (company) => {
    if (window.confirm(`Are you sure you want to delete ${company.name}?`)) {
      try {
        await deleteCompany(company.id)
        toast.success('Company deleted!');
        refreshData(); // Refresh the companies list
      } catch (error) {
        console.error('Error deleting company:', error)
        alert('Failed to delete company. Please try again.')
      }
    }
  }

  // View company details
  const handleViewCompany = (company) => {
    setSelectedCompany(company)
    setIsEditing(false)
    setActiveTab("company-detail")
  }

  // Edit company
  const handleEditCompany = (company) => {
    setSelectedCompany(company)
    setIsEditing(true)
    setActiveTab("edit-company")
  }

  // Handle bulk upload for employees
  const handleBulkUpload = (uploadData) => {
    // In a real application, this would process the uploaded file
    // For demo purposes, we'll just add some dummy data
    if (uploadData.entityType === "employee") {
      const dummyEmployees = [
        {
          id: employees.length + 1,
          name: "Bulk User 1",
          employeeId: `EMP${employees.length + 10}`,
          department: "Sales",
          role: "Sales Representative",
          startDate: "2021-03-10",
          endDate: null,
          duties: "Client acquisition, sales presentations",
          company: "Acme Corporation",
        },
        {
          id: employees.length + 2,
          name: "Bulk User 2",
          employeeId: `EMP${employees.length + 11}`,
          department: "HR",
          role: "HR Specialist",
          startDate: "2020-07-22",
          endDate: null,
          duties: "Recruitment, employee relations",
          company: "TechStart Inc.",
        },
      ]

      setEmployees([...employees, ...dummyEmployees])
      setActiveTab("employees")
    } else if (uploadData.entityType === "company") {
      // Refresh companies after bulk upload
      fetchCompanies()
      setActiveTab("companies")
    }
  }

  // Render content based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <div className="card">
            <h2 className="text-2xl font-bold mb-4">Verification Dashboard</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-emerald-100 p-4 rounded-lg">
                <h3 className="font-bold text-emerald-800">Total Companies</h3>
                <p className="text-3xl font-bold">
                  {companiesLoading ? (
                    <span className="animate-pulse">...</span>
                  ) : (
                    companies.length
                  )}
                </p>
              </div>
              <div className="bg-blue-100 p-4 rounded-lg">
                <h3 className="font-bold text-blue-800">Total Employees</h3>
                <p className="text-3xl font-bold">{employees.length}</p>
              </div>
              <div className="bg-amber-100 p-4 rounded-lg">
                <h3 className="font-bold text-amber-800">Pending Tasks</h3>
                <p className="text-3xl font-bold">{tasks.filter((t) => t.status !== "Completed").length}</p>
              </div>
            </div>
            <div className="mt-6">
              <h3 className="text-xl font-bold mb-2">Recent Tasks</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Task
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Company
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {tasks.slice(0, 3).map((task) => (
                      <tr key={task.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{task.type}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{task.company}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              task.status === "Completed"
                                ? "bg-green-100 text-green-800"
                                : task.status === "In Progress"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {task.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{task.createdAt}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="mt-6">
              <h3 className="text-xl font-bold mb-2">Quick Actions</h3>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => setActiveTab("companies")} className="btn-primary">
                  View Companies
                </button>
                <button onClick={() => setActiveTab("employees")} className="btn-primary">
                  View Employees
                </button>
                <button onClick={() => setActiveTab("tasks")} className="btn-primary">
                  View Tasks
                </button>
                <button onClick={() => setActiveTab("upload-employee")} className="btn-primary">
                  Bulk Upload
                </button>
              </div>
            </div>
          </div>
        )
      case "companies":
        return (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Company Management</h2>
              <div className="flex space-x-2">
                <button
                  onClick={refreshData}
                  disabled={companiesLoading}
                  className={`inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 ${
                    companiesLoading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <ArrowPathIcon className={`h-4 w-4 mr-1 ${companiesLoading ? 'animate-spin' : ''}`} />
                  {companiesLoading ? 'Loading...' : 'Refresh'}
                </button>
                <button
                  onClick={() => setActiveTab("add-company")}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                >
                  <PlusIcon className="h-4 w-4 mr-1" />
                  Add Company
                </button>
              </div>
            </div>
            
            {companiesError && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
                <strong className="font-bold">Error: </strong>
                <span className="block sm:inline">{companiesError}</span>
                <button
                  onClick={refreshData}
                  className="ml-2 underline hover:no-underline"
                >
                  Try again
                </button>
              </div>
            )}
            
            <CompanyList
              companies={companies.results || companies || []}
              loading={companiesLoading}
              onView={handleViewCompany}
              onEdit={handleEditCompany}
              onDelete={handleDeleteCompany}
            />
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
      case "tasks":
        return <VerificationTaskList tasks={tasks} />
      case "add-employee":
        return <EmployeeForm onSubmit={handleAddEmployee} companies={companies} isVerificationStaff={true} />
      case "edit-employee":
        return selectedEmployee ? (
          <EmployeeForm
            onSubmit={handleUpdateEmployee}
            existingEmployee={selectedEmployee}
            companies={companies}
            isVerificationStaff={true}
          />
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
      case "add-company":
        return (
          <CompanyForm 
            onSubmit={handleAddCompany}
            onSuccess={(result) => {
              toast.success('Company created successfully!');
              refreshData();
              setActiveTab("companies");
            }}
            onError={(error) => {
              toast.error(error || 'Failed to create company. Please try again.');
            }}
          />
        )
        case "edit-company":
          return selectedCompany ? (
            <CompanyForm 
              onSubmit={handleUpdateCompany} 
              existingCompany={selectedCompany}
              onSuccess={(result) => {
                toast.success('Company updated successfully!');
                refreshData();
                setActiveTab("companies");
              }}
              onError={(error) => {
                toast.error(error || 'Failed to update company. Please try again.');
              }}
            />
          ) : (
            <div>No company selected for editing.</div>
          )  
      case "upload-employee":
        return <BulkUploadForm onUpload={handleBulkUpload} entityType="employee" isVerificationStaff={true} />
      case "upload-company":
        return <BulkUploadForm onUpload={handleBulkUpload} entityType="company" isVerificationStaff={true} />
      default:
        return <div>Select a tab</div>
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />
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
                onClick={() => setActiveTab("companies")}
                className={`${
                  activeTab === "companies"
                    ? "border-emerald-500 text-emerald-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Companies
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
                onClick={() => setActiveTab("tasks")}
                className={`${
                  activeTab === "tasks"
                    ? "border-emerald-500 text-emerald-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Verification Tasks
              </button>
              <button
                onClick={() => setActiveTab("upload-employee")}
                className={`${
                  activeTab === "upload-employee"
                    ? "border-emerald-500 text-emerald-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Bulk Upload
              </button>
              {(activeTab === "employee-detail" ||
                activeTab === "edit-employee" ||
                activeTab === "add-employee" ||
                activeTab === "add-company" ||
                activeTab === "edit-company" ||
                activeTab === "upload-company") && (
                <button className="border-emerald-500 text-emerald-600 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm">
                  {activeTab.includes("employee")
                    ? isEditing
                      ? "Edit Employee"
                      : activeTab === "add-employee"
                        ? "Add Employee"
                        : "Employee Details"
                    : isEditing
                      ? "Edit Company"
                      : activeTab === "add-company"
                        ? "Add Company"
                        : "Company Details"}
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