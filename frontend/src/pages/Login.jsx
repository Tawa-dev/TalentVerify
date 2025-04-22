import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import toast, { Toaster } from 'react-hot-toast';

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const { register, handleSubmit, formState: { errors } } = useForm()
  const [loading, setLoading] = useState(false)


  const onSubmit = async ({ username, password }) => {
    try {
      setLoading(true)
      const success = await login(username, password)
      
      if (success) {
        toast.success('Login successful!')
        navigate('/')
      } else {
        toast.error('Invalid credentials')
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-sm max-w-md w-full">
        <h2 className="text-2xl font-bold mb-6 text-center">Talent Verify Login</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Toaster/>
            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <input
              {...register('username', { 
                required: 'Username is required',
                // pattern: {
                //   value: /\S+@\S+\.\S+/,
                //   message: 'Invalid email format'
                // }
              })}
              type="text"
              className="w-full p-2 border rounded-md"
              disabled={loading}
            />
            {errors.username && <span className="text-red-500 text-sm">{errors.username.message}</span>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              {...register('password', { 
                required: 'Password is required',
                // minLength: {
                //   value: 6,
                //   message: 'Password must be at least 6 characters'
                // }
              })}
              type="password"
              className="w-full p-2 border rounded-md"
              disabled={loading}
            />
            {errors.password && <span className="text-red-500 text-sm">{errors.password.message}</span>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 text-white p-2 rounded-md hover:cursor-pointer hover:bg-blue-600 disabled:bg-gray-400"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="mt-4 text-center">
          {/* to implement */}
          <Link to="" className="text-blue-500 text-sm hover:underline">
            Forgot Password?
          </Link>
        </div>
      </div>
    </div>
  )
}