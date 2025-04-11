import { useState } from 'react'

export default function Search() {
  const [filters, setFilters] = useState({
    name: '',
    employer: '',
    position: '',
    department: '',
    yearStarted: '',
    yearLeft: ''
  })

  const handleSearch = (e) => {
    e.preventDefault()
    // Implement search logic
    console.log('Search filters:', filters)
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Employee Search</h2>
      <form onSubmit={handleSearch} className="bg-white p-6 rounded-lg shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <input
            type="text"
            placeholder="Name"
            className="border rounded p-2"
            value={filters.name}
            onChange={e => setFilters({...filters, name: e.target.value})}
          />
          <input
            type="text"
            placeholder="Employer"
            className="border rounded p-2"
            value={filters.employer}
            onChange={e => setFilters({...filters, employer: e.target.value})}
          />
          <input
            type="text"
            placeholder="Position"
            className="border rounded p-2"
            value={filters.position}
            onChange={e => setFilters({...filters, position: e.target.value})}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <input
            type="text"
            placeholder="Department"
            className="border rounded p-2"
            value={filters.department}
            onChange={e => setFilters({...filters, department: e.target.value})}
          />
          <input
            type="number"
            placeholder="Year Started"
            className="border rounded p-2"
            value={filters.yearStarted}
            onChange={e => setFilters({...filters, yearStarted: e.target.value})}
          />
          <input
            type="number"
            placeholder="Year Left"
            className="border rounded p-2"
            value={filters.yearLeft}
            onChange={e => setFilters({...filters, yearLeft: e.target.value})}
          />
        </div>
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Search
        </button>
      </form>
      
      {/* Search results table will go here */}
    </div>
  )
}