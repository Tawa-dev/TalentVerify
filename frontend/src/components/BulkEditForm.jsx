import { useState } from 'react';
import { api } from '../services/api';
import toast from 'react-hot-toast';

export default function BulkEditForm({ onSuccess }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      setLoading(true);
      await api.post('/companies/bulk_update/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      toast.success('Companies updated successfully');
      onSuccess?.();
    } catch (error) {
      toast.error('Failed to update companies: ' + 
        (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
        <input
          type="file"
          onChange={(e) => setFile(e.target.files[0])}
          accept=".csv,.xlsx,.xls,.txt"
          className="w-full"
        />
        <p className="text-sm text-gray-500 mt-2">
          Upload a CSV, Excel, or text file containing company updates.
          <a href="/templates/company_update_template.xlsx" className="text-blue-500 hover:text-blue-700 ml-2">
            Download template
          </a>
        </p>
      </div>

      <button
        onClick={handleSubmit}
        disabled={!file || loading}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
      >
        {loading ? 'Updating...' : 'Update Companies'}
      </button>
    </div>
  );
}