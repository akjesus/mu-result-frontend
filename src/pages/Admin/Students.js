import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  IconButton,
  Input,
  TablePagination,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Tooltip,
  Snackbar,
  Alert,
} from "@mui/material";
import { Edit, Delete, UploadFile, Download, LockReset } from "@mui/icons-material";

// Mock API imports (replace with actual API calls)
import { getSchools, getLevels } from "../../api/schools";
import { getDepartments } from "../../api/departments";
import { getStudentsForDepartment, createStudent, resetStudentPassword } from "../../api/students";
  // Reset password handler
  

export default function AdminStudents() {
  const handleDownloadSampleCSV = () => {
    // You can change the endpoint to your actual sample CSV route
    fetch('http://localhost:5000/api/students/bulk-download', {
      headers: {
          'Content-Type': 'application/json',
         'Authorization': `Bearer ${localStorage.getItem("token")}` 
          }
    })
      .then((res) => res.blob())
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'students-sample.csv';
        document.body.appendChild(a);
        a.click();
        a.remove();
      })
      .catch(() => alert('Failed to download sample CSV!'));
  };
  // Bulk upload handler
  const handleBulkUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    try {
      const response = await fetch('http://localhost:5000/api/students/bulk-upload', {
        method: 'POST',
        body: formData,
       headers: {
         'Authorization': `Bearer ${localStorage.getItem("token")}` 
          }
      });
      const result = await response.json();
      if (response.ok) {
        showSnackbar(result.message || 'Bulk upload successful!', "success");
        // Optionally, refresh students list
        fetch('/api/students')
          .then((res) => res.json())
          .then((data) => setStudents(data.users || []));
      } else {
        showSnackbar(result.error || 'Bulk upload failed!', "error");
      }
    } catch (err) {
      showSnackbar('Bulk upload failed!', "error");
      console.log(err);
    }
  };

  // Fetch students from API and setStudents
  const [students, setStudents] = useState([]);
  const [schools, setSchools] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [levels, setLevels] = useState([]);
  const [open, setOpen] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [newStudent, setNewStudent] = useState({
    fullName: "",
    matric: "",
    school: "",
    department: "",
    level: "",
    email: "",
  });

  // Filters
  const [search, setSearch] = useState("");
  const [filterDept, setFilterDept] = useState("");
  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedFaculty, setSelectedFaculty] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [studentsFetched, setStudentsFetched] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState("");
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  

  function showSnackbar(message, severity) {
    setSnackbar({ open: true, message, severity });
  }

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };
const handleResetPassword = async (student) => {
    if (window.confirm(`Are you sure you want to reset the password for ${student.name || student.matric}?`)) {
      try {
        await resetStudentPassword(student.id);
        showSnackbar(`Password reset for ${student.name || student.matric}`, "success");
      } catch (err) {
        console.log(err);
        showSnackbar(err.response?.data?.message || 'Failed to reset password',"error");
      }
    }
  };
  // Fetch schools & departments
  useEffect(() => {
    getSchools().then((res) => setSchools(res.data.schools || res.data.faculties || [])).catch(console.error);
    getDepartments().then((res) => setDepartments(res.data.departments)).catch(console.error);
    getLevels().
    then((res)=> {
      setLevels(res.data.levels)}
    ).
    catch(error=> showSnackbar(error.message, "error"))
  }, []);

  // Fetch students only when button is clicked
  const handleFetchStudents = () => {
    if (selectedFaculty && selectedDepartment && selectedLevel) {
      getStudentsForDepartment(selectedDepartment, selectedLevel)
        .then((res) => {
          setStudents(res.data.students || []);
          setStudentsFetched(true);
          showSnackbar(`Students fetched for ${res.data.students[0].department } Department`, "success");
        })
        .catch((error) => {
          console.log(error)
          showSnackbar(error.response?.data?.message || error, "error");
        });
    } else {
      showSnackbar("Please select both faculty and department.", "info");
    }
  };

  const handleOpen = (student = null, index = null) => {
    if (student) {
      setNewStudent(student);
      setEditIndex(index);
    } else {
      setNewStudent({ fullName: "", matric: "", school: "", department: "", level: "", email: "" });
      setEditIndex(null);
    }
    setOpen(true);
  };

  const handleClose = () => setOpen(false);
  const handleChange = (e) => setNewStudent({ ...newStudent, [e.target.name]: e.target.value });

  const handleSaveStudent = () => {
    if (editIndex !== null) {
      const updated = [...students];
      updated[editIndex] = newStudent;
      setStudents(updated);

    } else {
      setStudents([...students, newStudent]);
    }
    handleClose();
  };

  const handleDelete = (student, index) => {
    console.log(student, index)
     if (window.confirm(`Are you sure you want to delete ${student.name || student.matric}?`)) {
      const updated = students.filter((_, i) => i !== index);
      setStudents(updated);

    }
  };

  // Filtered students
  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) &&
      (filterDept ? s.department === filterDept : true) 
  );

  return (
    <>
        <Box p={{ xs: 1, sm: 3 }} sx={{ maxWidth: 900, mx: 'auto' }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: "bold", color: "#2C2C78", fontSize: { xs: 18, sm: 24 } }}>
          Manage Students
          </Typography>
        

      {/* Add / Bulk Upload / Download */}
      <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
        <Button variant="contained" sx={{ bgcolor: "#2C2C78", ":hover": { bgcolor: "#1f1f5c" } }} onClick={() => handleOpen()}>Add Student</Button>
        <Button variant="outlined" component="label" startIcon={<UploadFile />}>
          Bulk Upload (CSV)
          <Input type="file" accept=".csv" sx={{ display: "none" }} onChange={handleBulkUpload} />
        </Button>
  <Button variant="outlined" startIcon={<Download />} onClick={handleDownloadSampleCSV}>Download Sample CSV</Button>
      </Box>

      

      {/* Faculty and Department Filters */}
      <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
        <FormControl sx={{ minWidth: 220 }} size="small">
          <InputLabel>Faculty</InputLabel>
          <Select
            value={selectedFaculty}
            label="Faculty"
            onChange={e => {
              setSelectedFaculty(e.target.value);
              setSelectedDepartment("");
              setStudents([]);
              setStudentsFetched(false);
            }}
          >
            <MenuItem value="">Select Faculty</MenuItem>
            {schools.map(fac => (
              <MenuItem key={fac.id} value={fac.name}>{fac.name}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl sx={{ minWidth: 220 }} size="small" disabled={!selectedFaculty}>
          <InputLabel>Department</InputLabel>
          <Select
            value={selectedDepartment}
            label="Department"
            onChange={e => {
              setSelectedDepartment(e.target.value);
              setStudents([]);
              setStudentsFetched(false);
            }}
          >
            <MenuItem value="">Select Department</MenuItem>
            {departments.filter(dep => dep.school === selectedFaculty).map(dep => (
              <MenuItem key={dep.id} value={dep.id}>{dep.name}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl sx={{ minWidth: 220 }} size="small">
          <InputLabel>Level</InputLabel>
          <Select
            value={selectedLevel}
            label="Level"
            onChange={e => {
              setSelectedLevel(e.target.value);
              setStudents([]);
              setStudentsFetched(false);
            }}
          >
            <MenuItem value="">Select Level</MenuItem>
              <MenuItem key={1} value = {1} >100 Level</MenuItem>
              <MenuItem key={2} value = {2} >200 Level</MenuItem>
              <MenuItem key={3} value = {3} >300 Level</MenuItem>
              <MenuItem key={4} value = {4} >400 Level</MenuItem>
              <MenuItem key={5} value = {5} >500 Level</MenuItem>
              <MenuItem key={6} value = {6} >600 Level</MenuItem>
          </Select>
        </FormControl>
        <Button
          variant="contained"
          sx={{ bgcolor: "#2C2C78" }}
          onClick={handleFetchStudents}
          disabled={!selectedFaculty || !selectedDepartment || !selectedLevel}
        >
          Fetch Students
        </Button>
      </Box>
      {/* Filters */}
      <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
        <TextField label="Search by name" value={search} onChange={(e) => setSearch(e.target.value)} size="small" />
      </Box>

      {/* Students Table */}
      <Table sx={{ minWidth: 320, width: '100%', overflowX: 'auto' }}>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Matric Number</TableCell>
            <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>Email</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredStudents.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((student, index) => (
            <TableRow key={index}>
              <TableCell>{student.name}</TableCell>
              <TableCell>{student.matric}</TableCell>
              <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>{student.email}</TableCell>
              <TableCell sx={{ minWidth: 70, maxWidth: 90, p: { xs: 0.25, sm: 0.5 }, overflow: 'hidden', textAlign: 'center' }}>
                <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'center', alignItems: 'center', width: '100%' }}>
                  <Tooltip title="Edit Student" arrow>
                    <IconButton
                      color="primary"
                      size="small"
                      sx={{ bgcolor: '#e3e3fa', borderRadius: 2, p: 0.25, boxShadow: 1, ':hover': { bgcolor: '#d1d1f7' } }}
                      onClick={() => handleOpen(student, index)}
                      aria-label="Edit Student"
                    >
                      <Edit fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete Student" arrow>
                    <IconButton
                      color="error"
                      size="small"
                      sx={{ bgcolor: '#fdecea', borderRadius: 2, p: 0.25, boxShadow: 1, ':hover': { bgcolor: '#f9d6d5' } }}
                      onClick={() => handleDelete(student, index)}
                      aria-label="Delete Student"
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Reset Password" arrow>
                    <IconButton
                      color="secondary"
                      size="small"
                      sx={{ bgcolor: '#e3f2fd', borderRadius: 2, p: 0.25, boxShadow: 1, ':hover': { bgcolor: '#bbdefb' } }}
                      onClick={() => handleResetPassword(student)}
                      aria-label="Reset Password"
                    >
                      <LockReset fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <TablePagination
        component="div"
        count={filteredStudents.length}
        page={page}
        onPageChange={(e, newPage) => setPage(newPage)}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
      />

      {/* Add/Edit Student Modal */}
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{editIndex !== null ? "Edit Student" : "Add Student"}</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} mt={1}>
            <Box display="flex" gap={2}>
              <TextField margin="dense" label="First Name" name="first_name" fullWidth value={newStudent.first_name} onChange={handleChange} sx={{ flex: 1 }} />
              <TextField margin="dense" label="Last Name" name="last_name" fullWidth value={newStudent.last_name} onChange={handleChange} sx={{ flex: 1 }} />
            </Box>
            <TextField margin="dense" label="Email Address" name="email" type = "email" fullWidth value={newStudent.email} onChange={handleChange} />
            <Box display="flex" gap={2}>
              <FormControl fullWidth margin="dense" sx={{ flex: 1 }}>
                <InputLabel>Faculty</InputLabel>
                <Select name="school" value={newStudent.school} onChange={handleChange} label="Faculty">
                  {schools.map((s) => (<MenuItem key={s.id} value={s.name}>{s.name}</MenuItem>))}
                </Select>
              </FormControl>
              <FormControl fullWidth margin="dense" sx={{ flex: 1 }}>
                <InputLabel>Department</InputLabel>
                <Select name="department" value={newStudent.department} onChange={handleChange} label="Department">
                  {departments.filter((d) => newStudent.school || d.school === newStudent.school)
                    .map((d) => (<MenuItem key={d.id} value={d.id}>{d.name}</MenuItem>))}
                </Select>
              </FormControl>
            </Box>
            <Box display="flex" gap={2}>
              <FormControl fullWidth margin="dense" sx={{ flex: 1 }}>
                <InputLabel>Level</InputLabel>
                <Select name="level" value={newStudent.level} onChange={handleChange} label="Level">
                  {levels.map((l) => (<MenuItem key={l.id} value={l.id}>{l.name}</MenuItem>))}
                </Select>
              </FormControl>
              <TextField margin="dense" label="Matric NO" name="matric" type="text" fullWidth value={newStudent.matric} onChange={handleChange} sx={{ flex: 1 }} />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button variant="contained" sx={{ bgcolor: "#2C2C78" }} onClick={handleSaveStudent}>Save</Button>
        </DialogActions>
      </Dialog>
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
