// src/api/schools.js
import axios from "axios";

const BASE_URL = process.env.REACT_APP_BASE_URL || "http://localhost:5000/api";
// Always get token inside each function

export const getSchools = () => {
    const token = localStorage.getItem('token');
    return axios.get(`${BASE_URL}/schools/faculties`, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    });
};

export const getCourses = () => {
    const token = localStorage.getItem('token');
    return axios.get(`${BASE_URL}/courses`, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    });
};

export const getSessions = () => {
    const token = localStorage.getItem('token');
    return axios.get(`${BASE_URL}/schools/sessions`, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    });
};

export const getLevels = () => {
    const token = localStorage.getItem('token');
    return axios.get(`${BASE_URL}/schools/levels`, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    });
};

export const createCourse = (data) => {
     const token = localStorage.getItem('token');
     return axios.post(`${BASE_URL}/courses`, 
    { 
        name: data.title,
        code: data.code, 
        department_id: data.department, 
        level_id: data.level,
        semester_id: data.semester,
        credit_load: data.credit,
        active: data.active,
     }
        , 
        { headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  }
})};

export const deleteCourse = (id) => {
    const token = localStorage.getItem('token');
    return axios.delete(`${BASE_URL}/courses/${id}`, {
        headers: {
        'Content-Type': 'application/json',
         'Authorization': `Bearer ${token}`
        }
})
}

export const updateCourse = (data) => {
     const token = localStorage.getItem('token');
    return axios.put(`${BASE_URL}/courses`, 
    { 
        name: data.title,
        code: data.code, 
        department_id: data.department, 
        level_id: data.level,
        semester_id: data.semester,
        credit_load: data.credit,
        active: data.active,
     }
        , 
        { headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  }
})};
export const getCoursesWithResults = () => {
    const token = localStorage.getItem('token');
    return axios.get(`${BASE_URL}/results/courses`,
    {
    headers: {
          'Content-Type': 'application/json',
         'Authorization': `Bearer ${token}` 
          }
})};


export const addSchool = (data) => {
    const token = localStorage.getItem('token')
    return axios.post(`${BASE_URL}/schools/faculties`, {
        name: data.name
    }, {
        headers: {
        'Content-Type': 'application/json',
         'Authorization': `Bearer ${token}`
        }
    })
};
export const updateSchool = (id, data) => axios.put(`${BASE_URL}/schools/faculties/${id}`, data);


export const deleteSchool = (id) => {
    const token = localStorage.getItem('token')
    return axios.delete(`${BASE_URL}/schools/faculties/${id}`, {
        headers: {
        'Content-Type': 'application/json',
         'Authorization': `Bearer ${token}`
        }
    })
};