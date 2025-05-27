import api from "../utils/axiosConfig";

// Create company with user and departments
export const createCompanyWithUser = async (companyData) => {
  try {
    const response = await api.post('/companies/create_user_and_company/', companyData);
    return response.data;
  } catch (error) {
    console.error("Create company with user error:", error);
    throw new Error(error.response?.data?.error || "Failed to create company");
  }
};

// Update company with departments
export const updateCompanyWithDepartments = async (companyId, companyData) => {
  try {
    const response = await api.put(`/companies/${companyId}/update_with_departments/`, companyData);
    return response.data;
  } catch (error) {
    console.error("Update company with departments error:", error);
    throw new Error(error.response?.data?.error || "Failed to update company");
  }
};

// Get all companies with optional pagination and filtering
export const getCompanies = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    
    // Add pagination parameters
    if (params.page) queryParams.append('page', params.page);
    if (params.page_size) queryParams.append('page_size', params.page_size);
    
    // Add search parameters
    if (params.search) queryParams.append('search', params.search);
    
    // Add ordering
    if (params.ordering) queryParams.append('ordering', params.ordering);
    
    // Add filtering
    if (params.name) queryParams.append('name', params.name);
    
    const url = `/companies/${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await api.get(url);
    
    // Handle both paginated and non-paginated responses
    if (response.data.results) {
      // Paginated response from Django REST framework
      return {
        results: response.data.results,
        count: response.data.count,
        next: response.data.next,
        previous: response.data.previous,
        totalPages: Math.ceil(response.data.count / (params.page_size || 20))
      };
    } else {
      // Non-paginated response (array)
      return response.data;
    }
  } catch (error) {
    console.error("Get companies error:", error);
    if (error.response?.status === 401) {
      throw new Error("Authentication required. Please log in again.");
    }
    throw new Error(error.response?.data?.error || error.response?.data?.detail || "Failed to fetch companies");
  }
};

// Get single company
export const getCompany = async (id) => {
  try {
    const response = await api.get(`/companies/${id}/`);
    return response.data;
  } catch (error) {
    console.error("Get company error:", error);
    if (error.response?.status === 404) {
      throw new Error("Company not found");
    }
    if (error.response?.status === 401) {
      throw new Error("Authentication required. Please log in again.");
    }
    throw new Error(error.response?.data?.error || error.response?.data?.detail || "Failed to fetch company");
  }
};

// Create company (simple version without user)
export const createCompany = async (companyData) => {
  try {
    const response = await api.post('/companies/', companyData);
    return response.data;
  } catch (error) {
    console.error("Create company error:", error);
    if (error.response?.status === 400) {
      const errors = error.response.data;
      if (typeof errors === 'object') {
        // Handle field-specific errors
        const errorMessages = Object.entries(errors)
          .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
          .join('; ');
        throw new Error(errorMessages);
      }
    }
    throw new Error(error.response?.data?.error || error.response?.data?.detail || "Failed to create company");
  }
};

// Update company
export const updateCompany = async (id, companyData) => {
  try {
    const response = await api.put(`/companies/${id}/`, companyData);
    return response.data;
  } catch (error) {
    console.error("Update company error:", error);
    if (error.response?.status === 404) {
      throw new Error("Company not found");
    }
    if (error.response?.status === 400) {
      const errors = error.response.data;
      if (typeof errors === 'object') {
        // Handle field-specific errors
        const errorMessages = Object.entries(errors)
          .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
          .join('; ');
        throw new Error(errorMessages);
      }
    }
    throw new Error(error.response?.data?.error || error.response?.data?.detail || "Failed to update company");
  }
};

// Partial update company
export const patchCompany = async (id, companyData) => {
  try {
    const response = await api.patch(`/companies/${id}/`, companyData);
    return response.data;
  } catch (error) {
    console.error("Patch company error:", error);
    if (error.response?.status === 404) {
      throw new Error("Company not found");
    }
    throw new Error(error.response?.data?.error || error.response?.data?.detail || "Failed to update company");
  }
};

// Delete company
export const deleteCompany = async (id) => {
  try {
    await api.delete(`/companies/${id}/`);
    // 204 is a successful deletion, return success indicator
    return { success: true };
  } catch (error) {
    console.error("Delete company error:", error);
    
    // Check if it's actually a 204 success that axios is treating as an error
    if (error.response?.status === 204) {
      return { success: true };
    }
    
    if (error.response?.status === 404) {
      throw new Error("Company not found");
    }
    if (error.response?.status === 403) {
      throw new Error("You don't have permission to delete this company");
    }
    throw new Error(error.response?.data?.error || error.response?.data?.detail || "Failed to delete company");
  }
};

// Bulk upload companies
export const bulkUploadCompanies = async (file, onProgress = null) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
        
    const response = await api.post('/companies/bulk_upload/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percentCompleted);
        }
      },
    });
    return response.data;
  } catch (error) {
    console.error("Bulk upload error:", error);
    if (error.response?.status === 400) {
      throw new Error(error.response?.data?.error || "Invalid file format or data");
    }
    throw new Error(error.response?.data?.error || "Failed to upload file");
  }
};

// Bulk edit companies
export const bulkEditCompanies = async (file, onProgress = null) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
        
    const response = await api.post('/companies/bulk_edit/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percentCompleted);
        }
      },
    });
    return response.data;
  } catch (error) {
    console.error("Bulk edit error:", error);
    if (error.response?.status === 400) {
      throw new Error(error.response?.data?.error || "Invalid file format or data");
    }
    throw new Error(error.response?.data?.error || "Failed to process file");
  }
};

// Search companies
export const searchCompanies = async (query, options = {}) => {
  try {
    const params = {
      search: query,
      ...options
    };
    return await getCompanies(params);
  } catch (error) {
    console.error("Search companies error:", error);
    throw error;
  }
};

// Get company statistics/dashboard data
export const getCompanyStats = async () => {
  try {
    const companies = await getCompanies();
    const totalCompanies = Array.isArray(companies) ? companies.length : companies.count || 0;
    
    // Calculate basic statistics
    let totalEmployees = 0;
    let companiesWithEmployees = 0;
    
    const companyList = Array.isArray(companies) ? companies : companies.results || [];
    
    companyList.forEach(company => {
      const empCount = parseInt(company.number_of_employees) || 0;
      totalEmployees += empCount;
      if (empCount > 0) {
        companiesWithEmployees++;
      }
    });
    
    return {
      totalCompanies,
      totalEmployees,
      companiesWithEmployees,
      averageEmployeesPerCompany: totalCompanies > 0 ? Math.round(totalEmployees / totalCompanies) : 0
    };
  } catch (error) {
    console.error("Get company stats error:", error);
    throw error;
  }
};

// Generate a secure password
export const generatePassword = (length = 12) => {
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
  let password = "";
     
  // Ensure at least one character from each category
  const lowercase = "abcdefghijklmnopqrstuvwxyz";
  const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const numbers = "0123456789";
  const symbols = "!@#$%^&*";
     
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += symbols[Math.floor(Math.random() * symbols.length)];
     
  // Fill the rest randomly
  for (let i = 4; i < length; i++) {
    password += charset[Math.floor(Math.random() * charset.length)];
  }
     
  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('');
};

// Validate company data before submission
export const validateCompanyData = (companyData) => {
  const errors = {};
  
  if (!companyData.name || companyData.name.trim().length === 0) {
    errors.name = "Company name is required";
  }
  
  if (!companyData.registration_number || companyData.registration_number.trim().length === 0) {
    errors.registration_number = "Registration number is required";
  }
  
  if (!companyData.registration_date) {
    errors.registration_date = "Registration date is required";
  }
  
  if (!companyData.address || companyData.address.trim().length === 0) {
    errors.address = "Address is required";
  }
  
  if (!companyData.contact_person || companyData.contact_person.trim().length === 0) {
    errors.contact_person = "Contact person is required";
  }
  
  if (!companyData.email_address || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(companyData.email_address)) {
    errors.email_address = "Valid email address is required";
  }
  
  if (companyData.number_of_employees && (isNaN(companyData.number_of_employees) || companyData.number_of_employees < 0)) {
    errors.number_of_employees = "Number of employees must be a valid positive number";
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};