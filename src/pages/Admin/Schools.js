import React, { useEffect, useState } from "react";
import { getSchools, addSchool, updateSchool, deleteSchool } from "../../api/schools";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
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

import { Edit, Delete, Add } from "@mui/icons-material";
import { useForm } from "react-hook-form";

export default function SchoolsPage() {
  const { register, handleSubmit, reset, setValue } = useForm();
  const [schools, setSchools] = useState([]);
  const [editingSchool, setEditingSchool] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);

  // Search / Filter
  const [search, setSearch] = useState("");

  // Pagination
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(5);

  // Notifications
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  useEffect(() => {
    fetchSchools();
  }, []);

  const fetchSchools = async () => {
    try {
        const res = await getSchools();
        setSchools(res.data.schools)
        showSnackbar("Schools Fetched!")
    }
    catch(error) {
        showSnackbar(`${error.response?.data?.message || "Failed to fetch schools"}`, "error");
        console.log(error)
    }};

  const onSubmit = async(data) => {
    try {
      if (editingSchool) {
      await updateSchool(editingSchool.id, data);
      reset();
          showSnackbar("School updated successfully!", "success");
          setEditingSchool(null);
          setOpenDialog(false);
          const res = await getSchools();
          setSchools(res.data.schools)
    } else{
      await addSchool(data)
          reset();
          showSnackbar("School added successfully!");
          setOpenDialog(false);
          const res = await getSchools();
          setSchools(res.data.schools)

    }}
    catch(error) {
      showSnackbar(error.response.data.message || "There was an error", "error")
    }};

  const handleEdit = (school) => {
    setEditingSchool(school);
    setValue("name", school.name);
    setOpenDialog(true);
  };

  const handleDelete =  async (id) => {
     if (window.confirm("Are you sure you want to delete this school?")) {
      try {
        await deleteSchool(id)
          showSnackbar("School deleted successfully!", "success");
          const res = await getSchools();
          setSchools(res.data.schools)
    }
    catch(error) {
      showSnackbar(error.response.data.message || "There was an error", "error")
      console.log(error);
    } 
    }
    return
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Filtered & paginated schools
  const filtered = schools.filter(school => school.name.toLowerCase().includes(search.toLowerCase()));
  const paginated = filtered.slice((page - 1) * rowsPerPage, page * rowsPerPage);
  const pageCount = Math.ceil(filtered.length / rowsPerPage);

  return (
    <>
    <Box p={{ xs: 1, sm: 3 }} sx={{ maxWidth: 900, mx: 'auto' }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: "bold", color: "#2C2C78", fontSize: { xs: 18, sm: 24 } }}>
          Schools / Faculties
          </Typography>
      {/* Search + Add Button */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <TextField
          placeholder="Search by School"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ width: "50%" }}
        />
        <Button
          variant="contained"
          color="primary"
          startIcon={<Add />}
          onClick={() => setOpenDialog(true)}
        >
          Add School
        </Button>
      </Box>

      {/* Schools Table */}
      <Paper>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginated.map(school => (
              <TableRow key={school.id}>
                <TableCell>{school.name}</TableCell>
                <TableCell align="right" sx={{ minWidth: 90, maxWidth: 120, p: { xs: 0.5, sm: 1 }, overflow: 'hidden' }}>
                  <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'flex-end', alignItems: 'center', flexWrap: 'wrap' }}>
                    <IconButton
                      color="primary"
                      size="small"
                      sx={{ bgcolor: '#e3e3fa', borderRadius: 2, p: 1, boxShadow: 1, ':hover': { bgcolor: '#d1d1f7' } }}
                      onClick={() => handleEdit(school)}
                      aria-label="Edit School"
                    >
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton
                      color="error"
                      size="small"
                      sx={{ bgcolor: '#fdecea', borderRadius: 2, p: 1, boxShadow: 1, ':hover': { bgcolor: '#f9d6d5' } }}
                      onClick={() => handleDelete(school.id)}
                      aria-label="Delete School"
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
            {paginated.length === 0 && (
              <TableRow>
                <TableCell colSpan={2} align="center">No schools found</TableCell>
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
      <Dialog open={openDialog} onClose={() => { setOpenDialog(false); setEditingSchool(null); }}>
        <DialogTitle>{editingSchool ? "Edit School" : "Add School"}</DialogTitle>
        <DialogContent>
          <form id="school-form" onSubmit={handleSubmit(onSubmit)}>
            <TextField
              fullWidth
              label="School Name"
              {...register("name", { required: true })}
              sx={{ mt: 2 }}
            />
          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setOpenDialog(false); setEditingSchool(null); }}>Cancel</Button>
          <Button type="submit" form="school-form" variant="contained" color="primary">
            {editingSchool ? "Update" : "Add"}
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
