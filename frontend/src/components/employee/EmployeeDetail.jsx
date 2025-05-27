"use client"

import { useState } from "react"
import { ArrowLeftIcon, PencilIcon, DocumentDuplicateIcon } from "@heroicons/react/24/outline"
import EmployeeHistory from "./EmployeeHistory"

export default function EmployeeDetail({ employee, employeeHistory, onBack, canEdit, onEdit }) {
  const [activeTab, setActiveTab] = useState("details")

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "Present"
    return new Date(dateString).toLocaleDateString()
  }

  // Get current role (the one without an end date)
  const currentRole = employeeHistory.find((role) => !role.endDate) || employeeHistory[0]

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
        <div>
          <button
            onClick={onBack}
            className="inline-flex items-center text-sm font-medium text-emerald-600 hover:text-emerald-500 mb-2"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-1" />
            Back
          </button>
          <h3 className="text-lg leading-6 font-medium text-gray-900">{employee.name}</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            {currentRole?.role} at {currentRole?.company}
          </p>
        </div>

        {canEdit && (
          <div className="flex space-x-2">
            <button
              onClick={() => onEdit(employee)}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
            >
              <PencilIcon className="h-4 w-4 mr-1" />
              Edit
            </button>
            <button
              onClick={() => window.print()}
              className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
            >
              <DocumentDuplicateIcon className="h-4 w-4 mr-1" />
              Export
            </button>
          </div>
        )}
      </div>

      <div className="border-t border-gray-200">
        <div className="px-4 sm:px-6">
          <nav className="-mb-px flex space-x-8 mt-4" aria-label="Tabs">
            <button
              onClick={() => setActiveTab("details")}
              className={`${
                activeTab === "details"
                  ? "border-emerald-500 text-emerald-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Employee Details
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`${
                activeTab === "history"
                  ? "border-emerald-500 text-emerald-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Employment History
            </button>
          </nav>
        </div>

        {activeTab === "details" ? (
          <dl>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Full name</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{employee.name}</dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Employee ID</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{employee.employeeId}</dd>
            </div>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Current company</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{currentRole?.company}</dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Current department</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{currentRole?.department}</dd>
            </div>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Current role</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{currentRole?.role}</dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Start date</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{formatDate(currentRole?.startDate)}</dd>
            </div>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Duties</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{currentRole?.duties}</dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Total experience</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {calculateExperience(employeeHistory)} years
              </dd>
            </div>
          </dl>
        ) : (
          <div className="px-4 py-5 sm:px-6">
            <EmployeeHistory employeeHistory={employeeHistory} />
          </div>
        )}
      </div>
    </div>
  )
}

// Helper function to calculate total experience in years
function calculateExperience(history) {
  if (!history || history.length === 0) return 0

  let totalDays = 0
  const today = new Date()

  history.forEach((role) => {
    const startDate = new Date(role.startDate)
    const endDate = role.endDate ? new Date(role.endDate) : today

    // Calculate days between start and end dates
    const days = Math.floor((endDate - startDate) / (1000 * 60 * 60 * 24))
    totalDays += days
  })

  // Convert days to years (approximate)
  return (totalDays / 365).toFixed(1)
}
