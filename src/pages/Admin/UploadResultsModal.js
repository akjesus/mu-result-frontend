
import React, { useState, useEffect } from "react";
import { Modal, Box, Typography, Button, TextField, MenuItem, Snackbar, Alert } from "@mui/material";
import { getCourses, getSessions } from "../../api/schools";
import {bulkUploadResults} from "../../api/results"
const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  borderRadius: 2,
  boxShadow: 24,
  p: 4,
};

export default function UploadResultsModal({ open, handleClose }) {
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [course, setCourse] = useState("");
  const [session, setSession] = useState("");
  const [semester, setSemester] = useState("");
  const [file, setFile] = useState(null);
  const [courses, setCourses] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const showSnackbar = (message, severity) => {
      setSnackbar({ open: true, message, severity });
    };
  
    const handleCloseSnackbar = () => {
      setSnackbar({ ...snackbar, open: false });
    };

const handleModalClose = () => {
    setCourse("");
    setSemester("");
    setSession("");
    setFile(null);
    setSemesters([]);
    handleClose();
  };
  // Mock data for demonstration
  useEffect(() => {
    if (open) {
      getCourses()
        .then(res => {
          setCourses(res.data.courses || []);
        })
        .catch(() => setCourses([]));
      getSessions()
        .then(res => {
          setSessions(res.data.sessions || []);
        })
        .catch(() => setSessions([]));
      setSemesters([]); // Reset semesters when modal opens
    }
  }, [open]);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  useEffect(() => {
    if (session) {
      const selectedSession = sessions.find(s => s.id === Number(session));
      setSemesters(selectedSession ? selectedSession.semesters : []);
    } else {
      setSemesters([]);
    }
  }, [session, sessions]);


 const handleUpload = async () => {
    if (!file || !course || !semester || !session) return;
    const formData = new FormData();
    formData.append("file", file);
    formData.append("session_id", session);
    formData.append("course_id", course);
    formData.append("semester_id", semester);
    
    try {
      const res = await bulkUploadResults(formData);
      if(res.data.success) {
        showSnackbar(res.data.message || "Results uploaded successfully", "success");
        setTimeout ( ()=> {
          handleModalClose();
        }, 2000);
        
      }
      
        else {
        showSnackbar(res.data.message, "error");
        setTimeout ( ()=> {
          handleModalClose();
        }, 2000);
    }
    } catch (err) {
      showSnackbar(err.response?.data?.message || "Upload failed", "error");
      console.error("Bulk upload failed:", err.response?.data?.message);
      setTimeout ( ()=> {
          handleModalClose();
        }, 2000);
    }
  };


  return (
    <Modal open={open} onClose={handleClose}>
      <Box sx={style}>
        <Typography variant="h6" mb={2}>Upload Results (CSV)</Typography>
        <TextField
          select
          label="Course"
          value={course}
          onChange={e => setCourse(e.target.value)}
          fullWidth
          sx={{ mb: 2 }}
        >
          {(courses || []).map((c) => (
            <MenuItem key={c.id} value={c.id}>{c.code + " - " + c.title}</MenuItem>
          ))}
        </TextField>
        <TextField
          select
          label="Session"
          value={session}
          onChange={e => setSession(e.target.value)}
          fullWidth
          sx={{ mb: 2 }}
        >
          {(sessions || []).map((s) => (
            <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>
          ))}
        </TextField>
        <TextField
          select
          label="Semester"
          value={semester}
          onChange={e => setSemester(e.target.value)}
          fullWidth
          sx={{ mb: 2 }}
          disabled={!semesters.length}
        >
          {(semesters || []).map((sem) => (
            <MenuItem key={sem.id} value={sem.id}>{sem.name}</MenuItem>
          ))}
        </TextField>
        <Button variant="outlined" component="label" fullWidth sx={{ mb: 2 }}>
          Choose CSV File
          <input type="file" hidden accept=".csv" onChange={handleFileChange} />
        </Button>
        {file && <Typography variant="body2" mb={2}>Selected: {file.name}</Typography>}
        <Button variant="contained" color="primary" fullWidth onClick={handleUpload} disabled={!file || !course || !semester || !session}>
          Upload
        </Button>
        <Snackbar
          open={snackbar.open}
          autoHideDuration={1000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: "100%" }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </Modal>
  );
}
