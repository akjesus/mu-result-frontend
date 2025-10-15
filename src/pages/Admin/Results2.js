import React, { useState, useEffect } from "react";
import { getDepartments } from "../../api/departments";
import {  getCourses } from "../../api/schools";
import { getStudentsForDepartment } from "../../api/students";
import { getSessionsWithSemesters } from "../../api/sessions";
import {createResult} from "../../api/results";
import {
  Box,
  Typography,
  Button,
  TextField,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  TableContainer,
  Paper,
  TablePagination,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  MenuItem,
  Snackbar,
  Alert,
} from "@mui/material";
import { Edit, Delete, Visibility } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import UploadResultsModal from "./UploadResultsModal";

export default function ResultManagement() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [departments, setDepartments] = useState([]);
  const [openUploadModal, setOpenUploadModal] = useState(false);
  const [openCreateResultModal, setOpenCreateResultModal] = useState(false);
  const [modalDepartments, setModalDepartments] = useState([]);
  const [modalStudents, setModalStudents] = useState([]);
  const [modalCourses, setModalCourses] = useState([]);
  const [modalSessions, setModalSessions] = useState([]);
  const [modalSemesters, setModalSemesters] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedStudent, setSelectedStudent] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedSession, setSelectedSession] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("");
  const [catScore, setCatScore] = useState("");
  const [examScore, setExamScore] = useState("");
  const navigate = useNavigate();
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
   
  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };
  useEffect(() => {
    getDepartments()
      .then(res => {
        setDepartments(res.data.departments);
        setModalDepartments(res.data.departments);
      })
      .catch(err => console.error(err));
  }, []);


  const filteredDepartments = departments.filter(
    (departments) =>
      departments.name.toLowerCase().includes(search.toLowerCase())
      || departments.school.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreateResult = () => {
    const data = {
      registration_number: selectedStudent,
      course_id: selectedCourse,
      session_id: selectedSession,
      semester_id: selectedSemester,
      cat_score: catScore,
      exam_score: examScore,
    }
    createResult(data)
    .then(res => {
      if(res.data.success) {
        showSnackbar("Result Created Successfully!");
        handleCloseModal()
      }
      else {
        showSnackbar("There was an error!", "error");
        handleCloseModal()
      }

    })
    .catch(err => {
      showSnackbar(err.response.data.message, "error");
       handleCloseModal()
    })
  }

  const handleCloseModal = ()=> {
    setSelectedDepartment("");
      setSelectedStudent("");
      setSelectedCourse("");
      setSelectedSession("");
      setSelectedSemester("");
      setModalStudents([]);
      setModalCourses([]);
      setModalSemesters([]);
      setCatScore("");
      setExamScore("");
      setOpenCreateResultModal(false);
  }

  useEffect(() => {
    if (openCreateResultModal) {
      getDepartments()
        .then(res => setModalDepartments(res.data.departments || []))
        .catch(() => setModalDepartments([]));
      getSessionsWithSemesters()
        .then(res => {
          setModalSessions(res.data.sessions || []);
        })
        .catch(() => setModalSessions([]));
    }
  }, [openCreateResultModal]);

  useEffect(() => {
    if (selectedSession) {
      const found = modalSessions.find(s => s.id === selectedSession || s.id === Number(selectedSession));
      setModalSemesters(found ? found.semesters : []);
    } else {
      setModalSemesters([]);
    }
    setSelectedSemester("");
  }, [selectedSession, modalSessions]);

  useEffect(() => {
    if (selectedDepartment) {
      getStudentsForDepartment(selectedDepartment)
        .then(res => {
          setModalStudents(res.data.students || []);
        })
        .catch(() => setModalStudents([]));
      setSelectedStudent("");
      setSelectedCourse("");
      setModalCourses([]);
    }
  }, [selectedDepartment]);

  useEffect(() => {
    if (selectedStudent) {
      getCourses()
        .then(res => setModalCourses(res.data.courses || []))
        .catch(() => setModalCourses([]));
      setSelectedCourse("");
    }
  }, [selectedStudent]);

  return (
    <>
    <Box p={{ xs: 1, sm: 3 }} sx={{ maxWidth: 900, mx: 'auto' }}>
      {/* Header */}
      <Typography variant="h5" gutterBottom sx={{ fontWeight: "bold", color: "#2C2C78", fontSize: { xs: 18, sm: 24 } }}>
        Result Management
      </Typography>
      {/* Quick Navigation Buttons */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mb: 3 }}>
        <Button variant="contained" sx={{ bgcolor: "#2C2C78", minWidth: { xs: 120, sm: 150 } }} onClick={() => setOpenCreateResultModal(true)}>Add Result</Button>
        <Button variant="contained" sx={{ bgcolor: "#2C2C78", minWidth: { xs: 120, sm: 150 } }} onClick={() => setOpenUploadModal(true)}>Upload Results</Button>
      </Box>
      {/* Search */}
      <TextField
        label="Search by Department or Faculty"
        variant="outlined"
        size="small"
        fullWidth
        sx={{ mb: 2 }}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      {/* Departments & Faculties Table with Pagination */}
      <Paper sx={{ overflowX: 'auto' }}>
        <TableContainer>
          <Table sx={{ minWidth: 320, width: '100%' }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: "bold", fontSize: { xs: 13, sm: 16 } }}>Departments</TableCell>
                <TableCell sx={{ fontWeight: "bold", fontSize: { xs: 13, sm: 16 } }}>Faculties</TableCell>
                <TableCell sx={{ fontWeight: "bold", fontSize: { xs: 13, sm: 16 } }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredDepartments
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((departments) => (
                  <TableRow key={departments.id}>
                    <TableCell sx={{ fontSize: { xs: 12, sm: 15 } }}>{departments.name}</TableCell>
                    <TableCell sx={{ fontSize: { xs: 12, sm: 15 } }}>{departments.school}</TableCell>
                    <TableCell sx={{ minWidth: 90, maxWidth: 120, p: { xs: 0.5, sm: 1 }, overflow: 'hidden', textAlign: 'center' }}>
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap', width: '100%' }}>
                        <Tooltip title="View">
                          <IconButton
                            color="secondary"
                            size="small"
                            sx={{ bgcolor: '#e3e3fa', borderRadius: 2, p: 0.5, boxShadow: 1, ':hover': { bgcolor: '#d1d1f7' } }}
                            onClick={() => navigate(`/admin/results/${departments.id}`)}
                            aria-label="View Department Results"
                          >
                            <Visibility fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit">
                          <IconButton
                            color="primary"
                            size="small"
                            sx={{ bgcolor: '#e3e3fa', borderRadius: 2, p: 0.5, boxShadow: 1, ':hover': { bgcolor: '#d1d1f7' } }}
                            aria-label="Edit Department"
                          >
                            <Edit fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            color="error"
                            size="small"
                            sx={{ bgcolor: '#fdecea', borderRadius: 2, p: 0.5, boxShadow: 1, ':hover': { bgcolor: '#f9d6d5' } }}
                            aria-label="Delete Department"
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={filteredDepartments.length}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[5, 10, 25]}
        />
      </Paper>
      {/* Upload Results Modal */}
      <UploadResultsModal open={openUploadModal} handleClose={() => setOpenUploadModal(false)} />
      {/* Create Result Modal */}
      <Dialog open={openCreateResultModal} onClose={() => setOpenCreateResultModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Result</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} mt={1}>
            {/* Department Dropdown */}
            <TextField
              select
              label="Department"
              variant="outlined"
              size="small"
              fullWidth
              value={selectedDepartment}
              onChange={e => setSelectedDepartment(e.target.value)}
            >
              <MenuItem value="">Select Department</MenuItem>
              {modalDepartments.map(dep => (
                <MenuItem key={dep.id || dep._id} value={dep.id || dep._id}>{dep.name}</MenuItem>
              ))}
            </TextField>
            {/* Student Dropdown */}
            <TextField
              select
              label="Student"
              variant="outlined"
              size="small"
              fullWidth
              value={selectedStudent}
              onChange={e => setSelectedStudent(e.target.value)}
              disabled={!selectedDepartment}
            >
              <MenuItem value="">Select Student</MenuItem>
              {modalStudents.map(stu => (
                <MenuItem key={stu.id || stu._id} value={stu.matric}>  {stu.matric + " - " + stu.name }</MenuItem>
              ))}
            </TextField>
            {/* Course Dropdown */}
            <TextField
              select
              label="Course"
              variant="outlined"
              size="small"
              fullWidth
              value={selectedCourse}
              onChange={e => setSelectedCourse(e.target.value)}
              disabled={!selectedStudent}
            >
              <MenuItem value="">Select Course</MenuItem>
              {modalCourses.map(course => (
                <MenuItem key={course.id } value={course.id }>{course.name || course.title || course.code}</MenuItem>
              ))}
            </TextField>
            {/* Session & Semester Row */}
            <Box display="flex" gap={2}>
              <TextField
                select
                label="Session"
                variant="outlined"
                size="small"
                fullWidth
                value={selectedSession}
                onChange={e => {
                  setSelectedSession(e.target.value)
                }}
                sx={{ flex: 1 }}
              >
                <MenuItem value="">Select Session</MenuItem>
                {modalSessions.map(session => (
                  <MenuItem key={session.id} value={session.id}>{session.name}</MenuItem>
                ))}
              </TextField>
              <TextField
                select
                label="Semester"
                variant="outlined"
                size="small"
                fullWidth
                value={selectedSemester}
                onChange={e => setSelectedSemester(e.target.value)}
                disabled={!selectedSession}
                sx={{ flex: 1 }}
              >
                <MenuItem value="">Select Semester</MenuItem>
                {modalSemesters.map(sem => (
                  <MenuItem key={sem.id} value={sem.id}>{sem.name}</MenuItem>
                ))}
              </TextField>
            </Box>
            {/* CAT & Exam Score Row */}
            <Box display="flex" gap={2}>
              <TextField
                label="CAT Score"
                variant="outlined"
                size="small"
                fullWidth
                value={catScore}
                onChange={e => setCatScore(e.target.value)}
                type="number"
                sx={{ flex: 1 }}
              />
              <TextField
                label="Exam Score"
                variant="outlined"
                size="small"
                fullWidth
                value={examScore}
                onChange={e => setExamScore(e.target.value)}
                type="number"
                sx={{ flex: 1 }}
              />
            </Box>
            {/* Add more fields as needed */}
            <Box display="flex" justifyContent="flex-end" gap={2} mt={2}>
              <Button onClick={() => setOpenCreateResultModal(false)} color="secondary">Cancel</Button>
              <Button variant="contained" color="primary" onClick={handleCreateResult}>Create Result</Button>
            </Box>
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