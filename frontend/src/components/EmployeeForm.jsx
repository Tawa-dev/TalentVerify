import { useForm } from 'react-hook-form'

export default function EmployeeForm({ onSubmit }) {
  const { register, handleSubmit, formState: { errors }, reset } = useForm()

  const handleFormSubmit = data => {
    onSubmit(data)
    reset()
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      {/* Existing fields */}
      
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
        Save Employee
      </button>
    </form>
  )
}