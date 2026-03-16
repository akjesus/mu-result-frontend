import { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { TextField, Button, Box, Typography, Paper,   Snackbar, Alert, } from "@mui/material";
import {forgotPassword} from "../../api/passwords";

const ForgotPassword = () => {
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
        const res = await forgotPassword(username);
        showSnackbar(res.message || "Password reset link sent to your email.", "success");
        setTimeout(() => {
          navigate('/reset-password');
        }, 3000);
        return res.data;
      
    } catch (err) {
      showSnackbar(err.response.data.message || "Could not send reset link. Try again.", "error");
      console.log(err.response.data.message || err.message);
      setLoading(false);
    }
  };
   const showSnackbar = (message, severity) => {
      setSnackbar({ open: true, message, severity });
    }
  
    const handleCloseSnackbar = () => {
      setSnackbar({ ...snackbar, open: false });
    };

  return (
    <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
      <Paper elevation={3} sx={{ p: 4, width: 400 }}>
        <Typography variant="h5" gutterBottom align="center">
          Forgot Password
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            label="Email or Matric Number"
            fullWidth
            margin="normal"
            value={username}
            required
            onChange={(e) => setUsername(e.target.value)}
          />
          <Button type="submit" fullWidth variant="contained" sx={{ mt: 2, bgcolor: "#2C2C78", ":hover": { bgcolor: "#1f1f5c" } }} disabled={loading}>
            {loading ? 'Sending...' : 'Send Reset Link'}
          </Button>
        </form>
        <Typography >Remembered your password? <Button onClick={() => navigate('/login')}>Login</Button></Typography>
      </Paper>
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
    </Box>
  );
};

export default ForgotPassword;
