import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json'
  }
})

// Get departments for a company
export const getDepartments = async (companyId) => {
  try {
    const response = await api.get('/employees/departments/', {
      params: { company: companyId }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching departments:', error);
    throw error;
  }
};

// Create a department
// export const createDepartment = async (departmentData) => {
//   try {
//     const response = await api.post('/employees/departments/', departmentData);
//     return response.data;
//   } catch (error) {
//     console.error('Error creating department:', error);
//     throw error;
//   }
// };

// Get companies
export const getCompanies = async () => {
  try {
    const response = await api.get('/companies/');
    return response.data;
  } catch (error) {
    console.error('Error fetching companies:', error);
    throw error;
  }
};

// Create a company
export const createCompany = async (companyData) => {
  try {
    const response = await api.post('/companies/', companyData);
    return response.data;
  } catch (error) {
    console.error('Error creating company:', error);
    throw error;
  }
};

// Update a company
export const updateCompany = async (companyId, companyData) => {
  try {
    const response = await api.patch(`/companies/${companyId}/`, companyData);
    return response.data;
  } catch (error) {
    console.error('Error updating company:', error);
    throw error;
  }
};

// Bulk upload companies
export const bulkUploadCompanies = async (file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post('/companies/bulk_upload/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  } catch (error) {
    console.error('Error bulk uploading companies:', error);
    throw error;
  }
};

// Store refresh token logic reference
let refreshTokenHandler = null

export const setRefreshTokenHandler = (handler) => {
  refreshTokenHandler = handler
}

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access')
    console.log('API Request:', config.url, 'Token:', token ? 'Present' : 'Missing') // Add this log
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      
      try {
        if (refreshTokenHandler) {
          const newAccessToken = await refreshTokenHandler()
          if (newAccessToken) {
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
            return api(originalRequest)
          }
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError)
      }
    }
    
    return Promise.reject(error)
  }
)

export { api }