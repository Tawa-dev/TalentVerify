"use client"

import { useState } from "react"
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline"

export default function EmployeeHistory({ employeeHistory }) {
  const [expandedItems, setExpandedItems] = useState({})

  // Toggle expanded state for a history item
  const toggleExpand = (id) => {
    setExpandedItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  // Group history by company
  const historyByCompany = employeeHistory.reduce((acc, item) => {
    if (!acc[item.company]) {
      acc[item.company] = []
    }
    acc[item.company].push(item)
    return acc
  }, {})

  // Sort companies by most recent role
  const sortedCompanies = Object.keys(historyByCompany).sort((a, b) => {
    const aLatestDate = Math.max(...historyByCompany[a].map((item) => new Date(item.startDate).getTime()))
    const bLatestDate = Math.max(...historyByCompany[b].map((item) => new Date(item.startDate).getTime()))
    return bLatestDate - aLatestDate
  })

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium leading-6 text-gray-900">Employment History</h3>

      {sortedCompanies.length === 0 ? (
        <p className="text-gray-500 italic">No employment history available.</p>
      ) : (
        <div className="space-y-8">
          {sortedCompanies.map((company) => {
            // Sort roles within company by date (newest first)
            const sortedRoles = [...historyByCompany[company]].sort(
              (a, b) => new Date(b.startDate) - new Date(a.startDate),
            )

            const currentRole = sortedRoles.find((role) => !role.endDate)
            const formerRoles = sortedRoles.filter((role) => role.endDate)

            return (
              <div key={company} className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:px-6 bg-gray-50">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">{company}</h3>
                  {currentRole && (
                    <p className="mt-1 max-w-2xl text-sm text-gray-500">
                      Current: {currentRole.role} ({currentRole.department})
                    </p>
                  )}
                </div>

                <div className="border-t border-gray-200">
                  <dl>
                    {sortedRoles.map((role, index) => {
                      const isExpanded = expandedItems[role.id]
                      const dateRange = `${new Date(role.startDate).toLocaleDateString()} - ${
                        role.endDate ? new Date(role.endDate).toLocaleDateString() : "Present"
                      }`

                      return (
                        <div
                          key={role.id}
                          className={`${
                            index % 2 === 0 ? "bg-white" : "bg-gray-50"
                          } px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 cursor-pointer hover:bg-gray-100`}
                          onClick={() => toggleExpand(role.id)}
                        >
                          <dt className="text-sm font-medium text-gray-500">
                            <div className="flex items-center justify-between">
                              <span>{role.role}</span>
                              <span>
                                {isExpanded ? (
                                  <ChevronUpIcon className="h-5 w-5 text-gray-400" />
                                ) : (
                                  <ChevronDownIcon className="h-5 w-5 text-gray-400" />
                                )}
                              </span>
                            </div>
                          </dt>
                          <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                            <div className="flex justify-between">
                              <span>{role.department}</span>
                              <span className="text-gray-500">{dateRange}</span>
                            </div>

                            {isExpanded && (
                              <div className="mt-4 text-sm text-gray-500 border-t pt-3">
                                <h4 className="font-medium text-gray-700 mb-1">Duties:</h4>
                                <p>{role.duties}</p>

                                {role.achievements && (
                                  <div className="mt-2">
                                    <h4 className="font-medium text-gray-700 mb-1">Achievements:</h4>
                                    <p>{role.achievements}</p>
                                  </div>
                                )}
                              </div>
                            )}
                          </dd>
                        </div>
                      )
                    })}
                  </dl>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
