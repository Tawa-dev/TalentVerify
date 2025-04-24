import { useState } from 'react';
import { api } from '../../services/api';
import toast from 'react-hot-toast';

export default function EmployeeBulkEditForm({ onSuccess }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const downloadTemplate = async () => {
    try {
      const response = await api.get('/employees/edit-template/', {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'employee_edit_template.xlsx');
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (error) {
      toast.error('Failed to download template');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      setLoading(true);
      await api.post('/employees/bulk_update/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      toast.success('Employees updated successfully');
      onSuccess?.();
      setFile(null);
    } catch (error) {
      toast.error('Failed to update employees: ' + 
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
          Upload a CSV, Excel, or text file containing employee updates.
          <button 
            onClick={downloadTemplate}
            className="text-blue-500 hover:text-blue-700 ml-2 underline"
            type="button"
          >
            Download template
          </button>
        </p>
      </div>

      <button
        onClick={handleSubmit}
        disabled={!file || loading}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
      >
        {loading ? 'Updating...' : 'Update Employees'}
      </button>
    </div>
  );
}