import { useForm } from 'react-hook-form'
import { useAuth } from '../../context/AuthContext'
import { useState } from 'react'
import toast from 'react-hot-toast'

export default function CompanyForm({ onSubmit, initialData }) {
  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    defaultValues: initialData || {}
  })
  const { user } = useAuth()
  const [departments, setDepartments] = useState([])
  const [newDepartment, setNewDepartment] = useState('')

  const addDepartment = () => {
    if (newDepartment.trim()) {
      setDepartments([...departments, { name: newDepartment.trim() }])
      setNewDepartment('')
    }
  }

  const removeDepartment = (index) => {
    setDepartments(departments.filter((_, i) => i !== index))
  }

  const handleFormSubmit = async (data) => {
    // Format data for backend
    const payload = {
      ...data,
      departments: departments
    }
    
    try {
      await onSubmit(payload)
      // Reset form after successful submission
      reset()
      setDepartments([])
      toast.success('Company data saved successfully!')
    } catch (error) {
      toast.error('Failed to save company data')
    }
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Company Name</label>
          <input
            type="text"
            {...register('name', { required: 'Company name is required' })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
          />
          {errors.name && <span className="text-red-500 text-sm">{errors.name.message}</span>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Date of Registration</label>
          <input
            type="date"
            {...register('registration_date', { required: 'Registration date is required' })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
          />
          {errors.registration_date && <span className="text-red-500 text-sm">{errors.registration_date.message}</span>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Registration Number</label>
          <input
            type="text"
            {...register('registration_number', { required: 'Registration number is required' })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
          />
          {errors.registration_number && <span className="text-red-500 text-sm">{errors.registration_number.message}</span>}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Address</label>
          <input
            type="text"
            {...register('address')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Contact Person</label>
          <input
            type="text"
            {...register('contact_person', { required: 'Contact person is required' })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
          />
          {errors.contact_person && <span className="text-red-500 text-sm">{errors.contact_person.message}</span>}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Contact Phone</label>
          <input
            type="text"
            {...register('contact_phone')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            {...register('email', { 
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: "Invalid email address"
              }
            })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
          />
          {errors.email && <span className="text-red-500 text-sm">{errors.email.message}</span>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Number of Employees</label>
          <input
            type="number"
            {...register('number_of_employees', { min: 1, valueAsNumber: true })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
          />
          {errors.number_of_employees && <span className="text-red-500 text-sm">Must be at least 1</span>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Departments</label>
        
        <div className="flex mb-2">
          <input
            type="text"
            value={newDepartment}
            onChange={(e) => setNewDepartment(e.target.value)}
            className="flex-1 rounded-l-md border-gray-300 shadow-sm p-2 border"
            placeholder="Add department"
          />
          <button
            type="button"
            onClick={addDepartment}
            className="bg-green-500 text-white px-4 py-2 rounded-r hover:bg-green-600"
          >
            Add
          </button>
        </div>
        
        {departments.length > 0 && (
          <div className="mt-2 space-y-2">
            <p className="text-sm text-gray-600">Added departments:</p>
            <ul className="bg-gray-50 p-2 rounded border">
              {departments.map((dept, index) => (
                <li key={index} className="flex justify-between items-center py-1">
                  <span>{dept.name}</span>
                  <button
                    type="button"
                    onClick={() => removeDepartment(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      
      <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
        {initialData ? 'Update Company' : 'Create Company'}
      </button>
    </form>
  )
}