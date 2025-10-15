import React, { useState, useEffect } from "react";
import {getProfile} from "../../api/students";
import {
  Container,
  Typography,
  Avatar,
  Button,
  Box,
  Snackbar, Alert,
} from "@mui/material";

export default function StudentProfile() {
  const [profilePic, setProfilePic] = useState(null);
  const [profileData, setProfileData] = useState({})
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
      function showSnackbar(message, severity) {
        setSnackbar({ open: true, message, severity });
      }
      const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, open: false });
      }



   useEffect(() => {
      getProfile()
        .then(res => {
          setProfileData(res.data.user || []);
          setProfilePic(res.data.user.photo);
        })
        .catch((error=> {
         showSnackbar(error.response.data.message, "error");
        }));
    }, []);

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setProfilePic(URL.createObjectURL(file));
    }
  };

  const handleSave = () => {
    // Later connect this with backend to update student profile
    showSnackbar("Profile saved successfully!", "success");
  };

  return (
    <>
    <Container sx={{ mt: 4, px: { xs: 1, sm: 2 }, maxWidth: { xs: '100%', sm: 500 } }}>
      {/* Profile Picture */}
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mb: 2 }}>
        <Avatar
          src={profileData.photo}
          alt="Profile"
          sx={{ width: 100, height: 100, mb: 1 }}
        />
        <Button variant="outlined" component="label" sx={{ width: { xs: "100%", sm: "auto" } }}>
          Upload Picture
          <input type="file" hidden onChange={handleImageChange} />
        </Button>
      </Box>

      {/* Profile Info (Responsive) */}
      <Box sx={{ textAlign: "left", maxWidth: 400, mx: "auto", px: { xs: 1, sm: 0 } }}>
        <Typography variant="body1" sx={{ fontSize: { xs: 14, sm: 16 } }}>
          <strong>Full Name:</strong> {profileData.fullName}
        </Typography>
        <Typography variant="body1" sx={{ fontSize: { xs: 14, sm: 16 } }}>
          <strong>Matric No:</strong> {profileData.matric}
        </Typography>
        <Typography variant="body1" sx={{ fontSize: { xs: 14, sm: 16 } }}>
          <strong>School:</strong> {profileData.school}
        </Typography>
        <Typography variant="body1" sx={{ fontSize: { xs: 14, sm: 16 } }}>
          <strong>Department:</strong> {profileData.department}
        </Typography>
        <Typography variant="body1" sx={{ fontSize: { xs: 14, sm: 16 } }}>
          <strong>Email:</strong> {profileData.email}
        </Typography>
        <Typography variant="body1" sx={{ fontSize: { xs: 14, sm: 16 } }}>
          <strong>Phone:</strong> {profileData.phone}
        </Typography>
        <Typography variant="body1" sx={{ fontSize: { xs: 14, sm: 16 } }}>
          <strong>Level:</strong> {profileData.level}
        </Typography>
      </Box>

      {/* Save Button */}
      <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
        <Button
          variant="contained"
          sx={{ bgcolor: "#2C2C78", width: { xs: "100%", sm: "auto" } }}
          onClick={handleSave}
        >
          Save Profile
        </Button>
      </Box>
    </Container>
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