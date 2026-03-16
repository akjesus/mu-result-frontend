import axios from 'axios';
const BASE_URL = process.env.REACT_APP_BASE_URL || "http://localhost:31000/api";
const API_URL = `${BASE_URL}/auth/password`;


export const forgotPassword = async (username) => {
  const res = await axios.post(`${API_URL}/forgot`, { username });
  return res;
};
export const resetPassword = async (resetCode, newPassword) => {
  const res = await axios.post(`${API_URL}/reset`, { resetCode, newPassword });
  return res;
};

export const changePassword = async (currentPassword, newPassword) => {
  const token = localStorage.getItem('token');
  return axios.post(`${API_URL}/change`, { currentPassword, newPassword }, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });
};