import {useState, useEffect} from "react";
import { Typography, Box, Button, Dialog, DialogTitle, DialogContent, MenuItem, TextField, Snackbar, Alert } from "@mui/material";
import { getSessions } from "../../api/schools";
import { getSemestersForSession, setActiveSemester } from "../../api/sessions";

export default function AdminSettings() {
  const [openSemesterModal, setOpenSemesterModal] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [loadingSemesters, setLoadingSemesters] = useState(false);
   const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });


  function showSnackbar(message, severity) {
    setSnackbar({ open: true, message, severity });
  }

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleOpenSemesterModal = () => {
    setOpenSemesterModal(true);
    setSelectedSession("");
    setSelectedSemester("");
    setSemesters([]);
    getSessions()
      .then(res => setSessions(res.data.sessions || []))
      .catch(() => setSessions([]));
  };

  const handleSessionChange = (e) => {
    const sessionId = e.target.value;
    setSelectedSession(sessionId);
    setSelectedSemester("");
    setLoadingSemesters(true);
    getSemestersForSession(sessionId)
      .then(res => {
        setSemesters(res.data.semesters || []);
        setLoadingSemesters(false);
      })
      .catch(() => {
        setSemesters([]);
        setLoadingSemesters(false);
      });
  };

  const handleSetActiveSemester = () => {
    if (!selectedSemester) return showSnackbar("Select a semester first");
    setActiveSemester(selectedSemester)
      .then(res => {
        if (res.data.success) {
          showSnackbar("Semester set as active!", "success");
          setOpenSemesterModal(false);
        } else {
          showSnackbar(res.data.message || "Failed to set active semester", "error");
        }
      })
      .catch(err => {
        showSnackbar(err.response?.data?.message || "Error setting active semester", "error");
      });
  };
  const [selectedSession, setSelectedSession] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("");
  return (
      <>
      <Box p={{ xs: 1, sm: 3 }} sx={{ maxWidth: 900, mx: 'auto' }}>
      <Typography variant="h5" gutterBottom sx={{ fontWeight: "bold", color: "#2C2C78", fontSize: { xs: 18, sm: 24 } }}>
      Settings Management 
      </Typography>
      {/* Quick Navigation Buttons */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mb: 3 }}>
  <Button variant="contained" sx={{ bgcolor: "#2C2C78", minWidth: { xs: 120, sm: 150 } }} onClick={handleOpenSemesterModal}>Choose Active Semester</Button>
      </Box>
      <Dialog open={openSemesterModal} onClose={() => setOpenSemesterModal(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Choose Active Semester</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} mt={1}>
            <TextField
              select
              label="Session"
              value={selectedSession}
              onChange={handleSessionChange}
              fullWidth
            >
              <MenuItem value="">Select Session</MenuItem>
              {sessions.map(session => (
                <MenuItem key={session.id} value={session.id}>{session.name}</MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Semester"
              value={selectedSemester}
              onChange={e => setSelectedSemester(e.target.value)}
              fullWidth
              disabled={!selectedSession || loadingSemesters}
            >
              <MenuItem value="">Select Semester</MenuItem>
              {semesters.map(sem => (
                <MenuItem key={sem.id} value={sem.id}>{sem.name}</MenuItem>
              ))}
            </TextField>
            <Button variant="contained" color="primary" onClick={handleSetActiveSemester} disabled={!selectedSemester}>Set Active Semester</Button>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
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
