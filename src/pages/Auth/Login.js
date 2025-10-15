// src/pages/Auth/Login.js
import React, { useState } from "react";
import axios from "axios";
import {
  Box,
  Button,
  Card,
  IconButton,
  InputAdornment,
  CardContent,
  TextField,
  Typography,
  Snackbar,
  Alert,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
const BASE_URL = process.env.REACT_APP_BASE_URL || "http://localhost:5000/api";

function Login() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState({ email: "", password: "" });
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
    const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
    
  
    function showSnackbar(message, severity) {
      setSnackbar({ open: true, message, severity });
    }
  
    const handleCloseSnackbar = () => {
      setSnackbar({ ...snackbar, open: false });
    };

  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError({ email: "", password: "" });

    try {
      const res = await axios.post(`${BASE_URL}/auth/login`, {
       email, password
      });
      if (res.data.success) { 
        // Save token & role in localStorage/session
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("role", res.data.role);
        localStorage.setItem("user", JSON.stringify(res.data.user));

        // Redirect based on role
        if (res.data.role === "admin" || res.data.role === "staff" || res.data.role === "superadmin") {
          showSnackbar(res.data.message, "success");
          setTimeout(() => {navigate("/admin/dashboard")}, 1500);
        } else if (res.data.role === "student") {
          showSnackbar(res.data.message, "success");
          setTimeout(() => {navigate("/student/dashboard")}, 1500);
        } else {
          showSnackbar(res.data.message, "error")
          setTimeout(() => {navigate("/")}, 1500);
          // fallback
        }
      }
    } catch (err) {
      if (err.response) {
        const message = err.response.data.message;

        if (message.includes("Email")) {
          setError((prev) => ({ ...prev, email: message }));
        } else if (message.includes("password")) {
          setError((prev) => ({ ...prev, password: message }));
        } else {
         showSnackbar(message, "error");
        }
      } else {
       showSnackbar("Server Unreachable!", "error");
      }
    }
  };


  return (
    <>
    <Box
      sx={{
        backgroundImage:
          "url('https://avatars.mds.yandex.net/i?id=1dec3fe0b0deb91cfeb28facc070c7fdee536a76-5231564-images-thumbs&n=13')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Card
        sx={{
          width: 400,
          bgcolor: "rgba(255, 255, 255, 0.9)", // semi-transparent white
          boxShadow: 5,
          borderRadius: 3,
        }}
      >
        <CardContent>
          <Typography
            variant="h5"
            component="div"
            gutterBottom
            align="center"
            sx={{ fontWeight: "bold" }}
          >
            University Result Portal
          </Typography>
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              margin="normal"
              label="Email or Matric No"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <TextField
              fullWidth
              margin="normal"
              type={showPassword ? "text" : "password"}
              label="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 2, bgcolor: "#2C2C78", ":hover": { bgcolor: "#1f1f5c" } }}
            >
              Login
            </Button>
            <Typography
              variant="body2"
              align="center"
              sx={{ mt: 2, cursor: "pointer", color: "#2C2C78" }}
              onClick={() => navigate("/forgot-password")}
            >
              Forgot Password?
            </Typography>
          </form>
        </CardContent>
      </Card>
    </Box>
    {/* Snackbar */}
                <Snackbar
                  open={snackbar.open}
                  autoHideDuration={3000}
                  onClose={handleCloseSnackbar}
                  anchorOrigin={{ vertical: "top", horizontal: "center" }}
                >
                  <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: "100%" }}>
                    {snackbar.message}
                  </Alert>
                </Snackbar>
    </>
  );
}

export default Login;
