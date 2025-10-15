import axios from "axios";
const BASE_URL = process.env.REACT_APP_BASE_URL || "http://localhost:5000/api";
const API_URL = `${BASE_URL}/results`;

export const getResults= (semester, department, session, level) => {
  const token = localStorage.getItem('token');
  return axios.get(API_URL,
    {
      params: {
        semester,
        department,
        session, 
        level
      },
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    }
  );
};

export const getResultsByDepartment2 = (departmentId) => {
  const token = localStorage.getItem('token');
  return axios.get(`${API_URL}/departments/${departmentId}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });
};


export const bulkUploadResults = (formData) => {
  const token = localStorage.getItem('token');
  return axios.post(`${API_URL}/bulk-upload`, formData, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
};

export const getResultsByDepartment = (id, session, semester) => {
  const token = localStorage.getItem('token');
  return axios.get(`${API_URL}/departments/${id}`,
        {
            params: {
                session, 
                semester
            },
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        }
);
}

export const updateResults = (data) =>
  {
     const token = localStorage.getItem('token');
     return axios.put(`${API_URL}/batch-update`,{
    results: data,
  }, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  })};

export const createResult = (data) => {
  const token = localStorage.getItem('token');
  return axios.post(API_URL, {
    results: data,
  }, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });
};