import { useState } from "react";
import { TextField, Button, Box, Typography, Paper } from "@mui/material";
import { forgotPassword } from "../../services/api";

const ForgotPassword = () => {
  const [identifier, setIdentifier] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await forgotPassword(identifier);
      setMessage(res.message || "Password reset link sent to your email.");
      setError("");
    } catch (err) {
      setError("Could not send reset link. Try again.");
    }
  };

  return (
    <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
      <Paper elevation={3} sx={{ p: 4, width: 400 }}>
        <Typography variant="h5" gutterBottom align="center">
          Forgot Password
        </Typography>
        {error && <Typography color="error">{error}</Typography>}
        {message && <Typography color="primary">{message}</Typography>}
        <form onSubmit={handleSubmit}>
          <TextField
            label="Email or Matric Number"
            fullWidth
            margin="normal"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
          />
          <Button type="submit" fullWidth variant="contained" sx={{ mt: 2 }}>
            Send Reset Link
          </Button>
        </form>
      </Paper>
    </Box>
  );
};

export default ForgotPassword;
