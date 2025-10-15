import axios from "axios";


const API_URL = "http://localhost:5000/api/auth";


export const loginUser = async (identifier, password) => {
  const res = await axios.post(`${API_URL}/login`, {
    identifier, // can be email or matric
    password,
  });
  return res.data;
};

export const forgotPassword = async (identifier) => {
  const res = await API_URL.post("/auth/forgot-password", { identifier });
  return res.data;
};

export default API_URL;
