import React, { useEffect, useState } from "react";
import { getDepartments, addDepartment, updateDepartment, deleteDepartment } from "../../api/departments";
import { getSchools } from "../../api/schools";

import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Snackbar,
  Alert,
  Pagination
} from "@mui/material";
import { Edit,Add, Delete } from "@mui/icons-material";
import { useForm } from "react-hook-form";

export default function DepartmentsPage() {
  const { register, handleSubmit, reset, setValue } = useForm();
  const [departments, setDepartments] = useState([]);
  const [schools, setSchools] = useState([]);
  const [editingDept, setEditingDept] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);

  // Search / Filter
  const [search, setSearch] = useState("");

  // Pagination
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(5);

  // Notifications
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
 function showSnackbar(message, severity) {
    setSnackbar({ open: true, message, severity });
  }

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };
  useEffect(() => {
    fetchDepartments();
    fetchSchools();
  }, []);

  function fetchDepartments() {
    getDepartments()
      .then(res => {
        showSnackbar("Departments Fetched!", "success");
        setDepartments(res.data.departments)
      })
      .catch(err => console.error(err));
  }

  function fetchSchools() {
    getSchools()
      .then(res => setSchools(res.data.schools))
      .catch(err => console.error(err));
  }

  async function onSubmit(data) {
    if (editingDept) {
      try {
        const res = await updateDepartment(editingDept.id, data);
      if(res.ok) {
        reset();
          setEditingDept(null);
          setOpenDialog(false);
          showSnackbar("Department updated successfully!", "success");
          fetchDepartments();
      }
      else {
        showSnackbar("Department not updated!", "info");
      }
      }

      catch (error) {
        showSnackbar(`Failed to update department: ${error.response.data.message || ""}`, "error");
        console.log(error);
      }

    } else {
      try {
         await addDepartment(data);
         reset();
          setOpenDialog(false);
          showSnackbar("Department added successfully!", "success");
          const res = await getDepartments();
          setDepartments(res.data.departments);
      } 
      catch(error) {
        showSnackbar(`Failed to add department: ${error.response.data.message || ""} `, "error");
        console.log(error);
      }
     
    }
  }

  function handleEdit(dept) {
    setEditingDept(dept);
    setValue("name", dept.name);
    setValue("school", dept.school);
    setOpenDialog(true);
  }

  async function handleDelete(id) {
    if (window.confirm("Are you sure you want to delete this department?")) {
      try {
        await deleteDepartment(id);
        showSnackbar("Department deleted successfully!", "success");
        const res = await getDepartments();
        setDepartments(res.data.departments);

      } catch (err) {
        showSnackbar("Failed to delete department", err.message || "error");
      }
    }
  }


  // Filtered & paginated departments
 const filtered = departments.filter(dept => {
  const name = dept.name ? dept.name.toLowerCase() : "";
  const school = dept.school ? dept.school.toLowerCase() : "";
  return name.includes(search.toLowerCase()) || school.includes(search.toLowerCase());
});


  const paginated = filtered.slice((page - 1) * rowsPerPage, page * rowsPerPage);
  const pageCount = Math.ceil(filtered.length / rowsPerPage);

  

  return (
    <>
    <Box p={{ xs: 1, sm: 3 }} sx={{ maxWidth: 900, mx: 'auto' }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: "bold", color: "#2C2C78", fontSize: { xs: 18, sm: 24 } }}>
          Manage Departments
          </Typography>
      {/* Search + Add Button Container */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <TextField
          placeholder="Search by Department or School"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ width: "40%" }}
        />

        <Button
          variant="contained"
          color="primary"
          startIcon={<Add />}
          onClick={() => setOpenDialog(true)}
        >
          Add Department
        </Button>
      </Box>

      {/* Departments Table */}
      <Paper>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Name</strong></TableCell>
              <TableCell><strong>School</strong></TableCell>
              <TableCell align="right"><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginated.map(dept => (
              <TableRow key={dept.id}>
                <TableCell>{dept.name}</TableCell>
                <TableCell>{dept.school}</TableCell>
                <TableCell align="right" sx={{ minWidth: 90, maxWidth: 120, p: { xs: 0.5, sm: 1 }, overflow: 'hidden' }}>
                  <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'flex-end', alignItems: 'center', flexWrap: 'wrap' }}>
                    <IconButton
                      color="primary"
                      size="small"
                      sx={{ bgcolor: '#e3e3fa', borderRadius: 2, p: 1, boxShadow: 1, ':hover': { bgcolor: '#d1d1f7' } }}
                      onClick={() => handleEdit(dept)}
                      aria-label="Edit Department"
                    >
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton
                      color="error"
                      size="small"
                      sx={{ bgcolor: '#fdecea', borderRadius: 2, p: 1, boxShadow: 1, ':hover': { bgcolor: '#f9d6d5' } }}
                      onClick={() => handleDelete(dept.id)}
                      aria-label="Delete Department"
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
            {paginated.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} align="center">No departments found</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>

      {/* Pagination */}
      {pageCount > 1 && (
        <Box sx={{ mt: 2, display: "flex", justifyContent: "center" }}>
          <Pagination
            count={pageCount}
            page={page}
            onChange={(e, value) => setPage(value)}
            color="primary"
          />
        </Box>
      )}

      {/* Form Dialog */}
      <Dialog open={openDialog} onClose={() => { setOpenDialog(false); setEditingDept(null); }}>
        <DialogTitle>{editingDept ? "Edit Department" : "Add Department"}</DialogTitle>
        <DialogContent>
          <form id="department-form" onSubmit={handleSubmit(onSubmit)}>
            <TextField
              fullWidth
              label="Department Name"
              {...register("name", { required: true })}
              sx={{ mt: 2 }}
            />
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel>School / Faculty</InputLabel>
              <Select {...register("school", { required: true })} defaultValue={editingDept?.school || ""}>
                {schools.map(school => (
                  <MenuItem key={school.id} value={school.id}>{school.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setOpenDialog(false); setEditingDept(null); }}>Cancel</Button>
          <Button type="submit" form="department-form" variant="contained" color="primary">
            {editingDept ? "Update" : "Add"}
          </Button>
        </DialogActions>
      </Dialog>

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
    </Box>
    </>
  );
}
