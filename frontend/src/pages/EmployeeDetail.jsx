import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { api } from '../services/api'
import HistoryTimeline from '../components/HistoryTimeline'

export default function EmployeeDetail() {
  const { id } = useParams()
  const [employee, setEmployee] = useState(null)
  const [history, setHistory] = useState([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [empRes, historyRes] = await Promise.all([
          api.get(`/employees/${id}`),
          api.get(`/employees/${id}/history`)
        ])
        setEmployee(empRes.data)
        setHistory(historyRes.data)
      } catch (error) {
        console.error('Failed to fetch data:', error)
      }
    }
    fetchData()
  }, [id])

  if (!employee) return <div>Loading...</div>

  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">{employee.name}</h2>
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="text-sm text-gray-500">Employee ID</label>
            <p className="font-medium">{employee.employee_id || 'N/A'}</p>
          </div>
          <div>
            <label className="text-sm text-gray-500">Current Role</label>
            <p className="font-medium">{employee.role}</p>
          </div>
        </div>
        
        <HistoryTimeline history={history} />
      </div>
    </div>
  )
}