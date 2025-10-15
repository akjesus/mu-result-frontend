import React, { useState, useEffect } from "react";
import { getDepartments } from "../../api/departments";
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
  Snackbar,
  Alert,
} from "@mui/material";
import { Edit, Delete, Visibility } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import UploadResultsModal from "./UploadResultsModal";

export default function TranscriptManagement() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [departments, setDepartments] = useState([]);
  const [openUploadModal, setOpenUploadModal] = useState(false);
  const navigate = useNavigate();
  const [snackbar, setSnackbar] = React.useState({ open: false, message: "", severity: "success" });

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
        showSnackbar("Departments Fetched!");
      })
      .catch(err => console.error(err));
  }, []);

  // Fetch courses with uploaded results from backend


  const filteredDepartments = departments.filter(
    (departments) =>
      departments.name.toLowerCase().includes(search.toLowerCase())
      || departments.school.toLowerCase().includes(search.toLowerCase())
  );
  
  return (
    <>
    <Box p={{ xs: 1, sm: 3 }} sx={{ maxWidth: 900, mx: 'auto' }}>
      {/* Header */}
      <Typography variant="h5" gutterBottom sx={{ fontWeight: "bold", color: "#2C2C78", fontSize: { xs: 18, sm: 24 } }}>
        Transcript Management
      </Typography>
      {/* Quick Navigation Buttons */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mb: 3 }}>
        <Button
          variant="contained"
          sx={{ bgcolor: "#2C2C78", minWidth: { xs: 120, sm: 150 } }}
          onClick={() => navigate("/admin/transcripts")}
        >
          Transcripts
        </Button>
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
                            onClick={() => navigate(`/admin/transcripts/${departments.id}`)}
                            aria-label="View Department Transcripts"
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
