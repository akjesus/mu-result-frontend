import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { resetPassword } from '../../api/passwords'; // Ensure this API function exists
import { TextField, Button, Box, Typography, Paper, Snackbar, Alert, IconButton,
  InputAdornment,} from '@mui/material';    
import { Visibility, VisibilityOff } from "@mui/icons-material";

const ResetPassword = () => {
  const [resetCode, setResetCode] = useState('');
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  
  const showSnackbar = (message, severity) => {
      setSnackbar({ open: true, message, severity });
    }
  
    const handleCloseSnackbar = () => {
      setSnackbar({ ...snackbar, open: false });
    };
  

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      showSnackbar('Passwords do not match.', 'error');
      return;
    }

    try {
      const response = await resetPassword( resetCode, newPassword );
        showSnackbar(response.data.message, 'success');
        setTimeout(() => {
          navigate('/login');
        }, 3000);
    } catch (err) {
        console.log(err)
        showSnackbar(err.response.data.message, 'error');
        setTimeout(() => {
          navigate('/forgot-password');
        }, 3000);
    }
  };

  return (
    <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
        <Paper elevation={3} sx={{ p: 4, width: 400 }}>
            <Typography variant="h5" gutterBottom align="center">
              Reset Password
            </Typography>
        <form onSubmit={handleSubmit}>
            <TextField
            label="Reset Code"
            fullWidth
            margin="normal"
            value={resetCode}
            required
            onChange={(e) => setResetCode(e.target.value)}
          />
            <TextField
            label="New Password"
            fullWidth
            type={showPassword ? "text" : "password"}
            margin="normal"
            value={newPassword}
            required
            onChange={(e) => setNewPassword(e.target.value)}
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
            <TextField
            label="Confirm New Password"
            fullWidth
            type={showPassword ? "text" : "password"}
            margin="normal"
            value={confirmPassword}
            required
            onChange={(e) => setConfirmPassword(e.target.value)}
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
          <Button type="submit" fullWidth variant="contained" sx={{ mt: 2, bgcolor: "#2C2C78", ":hover": { bgcolor: "#1f1f5c" } }}>
            Reset Password
          </Button>
          <Typography >Remembered your password? <Button onClick={() => navigate('/login')}>Login</Button></Typography>
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
        </form>
      </Paper>
    </Box>
  );
};

export default ResetPassword;