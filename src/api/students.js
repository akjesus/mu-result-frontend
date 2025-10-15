// src/api/departments.js
import axios from 'axios';

const BASE_URL = process.env.REACT_APP_BASE_URL || "http://localhost:5000/api";
const API_URL = `${BASE_URL}/students`;

export const getStudents = () => {
    const token = localStorage.getItem('token');
    return axios.get(API_URL, {
    headers: {
          'Content-Type': 'application/json',
         'Authorization': `Bearer ${token}` 
          }
})}

export const getStudentsForDepartment = (department, level) => {
    const token = localStorage.getItem('token');
    return axios.get(`${API_URL}/departments`, {
        params: {
            departmentId: department,
            levelId: level
        },
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    });
};

export const createStudent = (data) => {
    const token = localStorage.getItem('token');
    return axios.post(API_URL, data, {
    
    headers: {
          'Content-Type': 'application/json',
         'Authorization': `Bearer ${token}` 
          }
})};

export const updateDepartment = (id, data) => {
    const token = localStorage.getItem('token');
    return axios.put(`${API_URL}/${id}`, data, {
    headers: {
          'Content-Type': 'application/json',
         'Authorization': `Bearer ${token}` 
          }
})};


export const getResults = ( data) => {
    const token = localStorage.getItem('token');
    return axios.get(`${BASE_URL}/results/student`,
        {
            params: {
                semester: data.semester,
                session: data.session,
                level: data.level
            },
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        }
)};

export const getProfile = () => {
    const token = localStorage.getItem('token');
    return axios.get(`${BASE_URL}/auth/me`,
        {   headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        }
)};

export const changePassword = (data) => {
    const token = localStorage.getItem('token');
    return axios.post(`${BASE_URL}/students/change-password`,
        {
            old_password: data.currentPassword,
            new_password: data.newPassword,
            new_password_confirm: data.confirmPassword
        },
        {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        }
)};


export const getCurrentGPA = () => {
    const token = localStorage.getItem('token');
    return axios.get(`${BASE_URL}/students/gpa`,
        {   headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        }
)};


export const resetStudentPassword = (id) => {
    const token = localStorage.getItem('token');
    return axios.post(
        `${API_URL}/${id}/reset-password`,
        {},
        {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        }
    );
};

export const updateProfilePicture = (formData) =>  {
const token = localStorage.getItem('token');
    return axios.post(`${API_URL}/update-picture`,
        formData,
        {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        }
    );
}
