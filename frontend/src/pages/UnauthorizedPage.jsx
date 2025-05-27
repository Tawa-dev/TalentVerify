import { Link } from "react-router-dom"
import { ShieldExclamationIcon } from "@heroicons/react/24/outline"

const UnauthorizedPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <ShieldExclamationIcon className="mx-auto h-16 w-16 text-red-500" />
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Unauthorized Access</h2>
          <p className="mt-2 text-sm text-gray-600">You don't have permission to access this page.</p>
        </div>
        <div className="mt-8">
          <Link
            to="/"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
          >
            Return to Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}

export default UnauthorizedPage
