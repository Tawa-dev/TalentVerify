import { useForm } from 'react-hook-form'
import { useAuth } from '../../context/AuthContext'
import { useState, useEffect } from 'react'
import { api } from '../../services/api'
import toast from 'react-hot-toast'

export default function EmployeeForm({ onSubmit, initialData, isEditing }) {
  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm()
  const { user } = useAuth()
  const [departments, setDepartments] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Fetch departments for the user's company
    const fetchDepartments = async () => {
      if (!user?.company) return;
      
      try {
        setIsLoading(true)
        const response = await api.get('/employees/departments/', {
          params: { company: user.company }
        })
        setDepartments(response.data.results)
      } catch (error) {
        console.error("Failed to fetch departments:", error)
        toast.error("Failed to load departments")
      } finally {
        setIsLoading(false)
      }
    }

    fetchDepartments()
  }, [user?.company])
  
  useEffect(() => {
    // If editing, populate the form with initial data
    if (initialData && isEditing) {
      setValue('name', initialData.name)
      setValue('emp_id', initialData.employee_id)
      
      // Find current role and set its values
      if (initialData.current_role) {
        setValue('dept', initialData.current_role.department_id)
        setValue('role', initialData.current_role.role)
        setValue('start_date', 
          initialData.current_role.date_started ? 
            initialData.current_role.date_started.split('T')[0] : '')
        setValue('end_date', 
          initialData.current_role.date_left ? 
            initialData.current_role.date_left.split('T')[0] : '')
        setValue('duties', initialData.current_role.duties)
      }
    }
  }, [initialData, isEditing, setValue])

  const handleFormSubmit = async (data) => {
    // Format data for backend
    const payload = isEditing 
      ? {
          id: initialData.id,
          name: data.name,
          employee_id: data.emp_id,
          company: user.company,
          // For updates, we're updating the current role
          current_role: {
            department: data.dept,
            role: data.role,
            date_started: data.start_date,
            date_left: data.end_date || null,
            duties: data.duties
          }
        }
      : {
          name: data.name,
          employee_id: data.emp_id,
          company: user.company,
          roles: [{
            department: data.dept,
            role: data.role,
            date_started: data.start_date,
            date_left: data.end_date || null,
            duties: data.duties
          }]
        };
    
    await onSubmit(payload)
    if (!isEditing) reset()
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Name</label>
          <input
            type="text"
            {...register('name', { required: true })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
          />
          {errors.name && <span className="text-red-500 text-sm">Required</span>}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Employee ID</label>
          <input
            type="text"
            {...register('emp_id')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Department</label>
          {isLoading ? (
            <p>Loading departments...</p>
          ) : (
            <div className="space-y-2">
              <select
                {...register('dept', { required: true })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
              >
                <option value="">Select Department</option>
                {departments.map(dept => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>   
            </div>
          )}
          {errors.dept && <span className="text-red-500 text-sm">Required</span>}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Role</label>
          <input
            type="text"
            {...register('role', { required: true })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
          />
          {errors.role && <span className="text-red-500 text-sm">Required</span>}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Start Date</label>
          <input
            type="date"
            {...register('start_date', { required: true })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
          />
          {errors.start_date && <span className="text-red-500 text-sm">Required</span>}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">End Date</label>
          <input
            type="date"
            {...register('end_date')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Duties</label>
        <textarea
          {...register('duties')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
          rows="3"
        />
      </div>

      <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
        {isEditing ? 'Update Employee' : 'Save Employee'}
      </button>
    </form>
  )
}