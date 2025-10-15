import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  Snackbar,
  Alert,
  Typography
} from "@mui/material";
import { Edit, Delete } from "@mui/icons-material";

const initialGrades = [
  { id: 1, lower: 70, upper: 100, point: 5, grade: "A" },
  { id: 2, lower: 60, upper: 69, point: 4, grade: "B" },
  { id: 3, lower: 50, upper: 59, point: 3, grade: "C" },
  { id: 4, lower: 45, upper: 49, point: 2, grade: "D" },
  { id: 5, lower: 40, upper: 44, point: 1, grade: "E" },
  { id: 6, lower: 0, upper: 39, point: 0, grade: "F" },
];

export default function Grades() {
  const [grades, setGrades] = useState(initialGrades);
  const [form, setForm] = useState({ lower: "", upper: "", point: "", grade: "" });
  const [editId, setEditId] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = () => {
    if (!form.lower || !form.upper || !form.point || !form.grade) {
      setSnackbar({ open: true, message: "All fields are required", severity: "error" });
      return;
    }
    if (editId) {
      setGrades(grades.map((g) => (g.id === editId ? { id: editId, ...form } : g)));
      setSnackbar({ open: true, message: "Grade updated successfully", severity: "success" });
    } else {
      setGrades([...grades, { id: Date.now(), ...form }]);
      setSnackbar({ open: true, message: "Grade added successfully", severity: "success" });
    }
    setForm({ lower: "", upper: "", point: "", grade: "" });
    setEditId(null);
  };

  const handleEdit = (grade) => {
    setForm(grade);
    setEditId(grade.id);
  };

  const handleDelete = (id) => {
    setGrades(grades.filter((g) => g.id !== id));
    setSnackbar({ open: true, message: "Grade deleted", severity: "info" });
  };

  return (
    <Box p={{ xs: 1, sm: 3 }} sx={{ maxWidth: 900, mx: 'auto' }}>
      <Typography variant="h5" gutterBottom sx={{ fontWeight: "bold", color: "#2C2C78", fontSize: { xs: 18, sm: 24 } }}>
      Grades Management
      </Typography>
      <Box display="flex" gap={2} mb={2}>
        <TextField label="Lower Limit" name="lower" value={form.lower} onChange={handleChange} />
        <TextField label="Upper Limit" name="upper" value={form.upper} onChange={handleChange} />
        <TextField label="Grade Point" name="point" value={form.point} onChange={handleChange} />
        <TextField label="Grade" name="grade" value={form.grade} onChange={handleChange} />
        <Button variant="contained" onClick={handleSubmit}>
          {editId ? "Update" : "Add"}
        </Button>
      </Box>

      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Lower</TableCell>
            <TableCell>Upper</TableCell>
            <TableCell>Point</TableCell>
            <TableCell>Grade</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {grades.map((g) => (
            <TableRow key={g.id}>
              <TableCell>{g.lower}</TableCell>
              <TableCell>{g.upper}</TableCell>
              <TableCell>{g.point}</TableCell>
              <TableCell>{g.grade}</TableCell>
              <TableCell>
                <IconButton color="primary" onClick={() => handleEdit(g)}><Edit /></IconButton>
                <IconButton color="error" onClick={() => handleDelete(g.id)}><Delete /></IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
}
