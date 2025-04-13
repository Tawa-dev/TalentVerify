export default function HistoryTimeline({ history }) {
    return (
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-4">Role History</h3>
        <div className="relative">
          {history.map((entry, index) => (
            <div key={index} className="flex items-start mb-6">
              <div className="w-4 h-4 bg-blue-500 rounded-full mt-1.5" />
              <div className="ml-4 flex-1">
                <div className="bg-white p-4 rounded-lg shadow-sm border">
                  <p className="font-medium">{entry.role}</p>
                  <p className="text-sm text-gray-600">{entry.department}</p>
                  <p className="text-sm text-gray-500 mt-2">
                    {new Date(entry.start_date).toLocaleDateString()} -{' '}
                    {entry.end_date 
                      ? new Date(entry.end_date).toLocaleDateString()
                      : 'Present'}
                  </p>
                  {entry.duties && (
                    <p className="text-sm text-gray-600 mt-2">
                      Duties: {entry.duties}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }