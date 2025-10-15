import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TextField,
  Box,
  Snackbar,
  Alert,
} from "@mui/material";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import logo from "../../assets/maduka-logo.png"; // Ensure logo.png exists in assets
import {updateResults} from "../../api/results";


export default function ResultModal({ open, handleClose, student, editMode = false, onSave }) {
  
  const [snackbar, setSnackbar] = React.useState({ open: false, message: "", severity: "success" });
  const [editStudent, setEditStudent] = React.useState(
    student ? {
      ...student,
      results: Array.isArray(student.results) ? student.results : [],
      courses_info: Array.isArray(student.courses_info) ? student.courses_info : [],
    } : { results: [], courses_info: [] }
  );
  React.useEffect(() => {
    if (!student) {
      setEditStudent({ results: [], courses_info: [] });
      return;
    }
    setEditStudent({
      ...student,
      results: Array.isArray(student.results) ? student.results : [],
      courses_info: Array.isArray(student.courses_info) ? student.courses_info : [],
    });
  }, [student]);
  if (!student) return null;

const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  function handleSaveEdit(editStudent, onSave) {
  // Log the edited data for analysis
  const editedResults = editStudent.courses_info;
  if (onSave) {
    onSave(editStudent);
  }
  //send the data to endpoint 
  updateResults(editedResults)
    .then(res => {
      if (res.data.success) { 
        showSnackbar("Results updated successfully");
      } else {
        showSnackbar(res.data.message || "Failed to update results", "error");
      }
    })
    .catch(err => {
      showSnackbar(err.response.data.message   || "Error updating results", );
    });

}

  // Support both shapes for student info
  const name = student.name || student.student_name || '';
  const matric = student.matNo || student.matric || '';
  const faculty = student.faculty || student.faculty_name || '';
  const department = student.department || student.department_name || '';
  const level = student.level || student.level_name || '';
  const session = student.session || student.session_name || '';
  const semester = student.semester || student.semester_name || '';

  // Support both results and courses_info
  const results = Array.isArray(student.results) ? student.results : null;
  const courses = Array.isArray(student.courses_info) ? student.courses_info : null;

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    doc.addImage(logo, "PNG", 14, 10, 25, 25);
    doc.setFontSize(18);
    doc.text("Maduka University, Ekwegbe", 45, 25);
    doc.setFontSize(16);
    doc.text("Student Result", 14, 45);
    doc.setFontSize(12);
    doc.text(`Name: ${name}`, 14, 60);
    doc.text(`Matric No: ${matric}`, 14, 67);
    doc.text(`Department: ${department}`, 14, 74);
    // Table columns and rows
    let tableColumn, tableRows;
    if (results) {
      tableColumn = ["S/N", "CODE", "COURSE TITLE", "UNIT", "SCORE", "GRADE", "GP"];
      tableRows = results.map((r, idx) => [idx + 1, r.code, r.title, r.unit, r.score, r.grade, r.gp]);
    } else if (courses) {
      tableColumn = ["Course Code", "Course Name", "Credit", "Score", "Grade"];
      tableRows = courses.map(course => [course.code, course.name, course.credit_load, course.total_score, course.grade]);
    }
    if (tableColumn && tableRows) {
      autoTable(doc, {
        startY: 85,
        head: [tableColumn],
        body: tableRows,
      });
    }
    // GPA calculation
    let totalUnits = 0, totalCredits = 0, totalGradePoints = 0;
    if (results) {
      results.forEach(r => {
        totalUnits += Number(r.unit);
        totalGradePoints += Number(r.gp) * Number(r.unit);
      });
    } else if (courses) {
      courses.forEach(course => {
        totalCredits += Number(course.credit_load);
        let gp = 0;
        switch (course.grade) {
          case 'A': gp = 5; break;
          case 'B': gp = 4; break;
          case 'C': gp = 3; break;
          case 'D': gp = 2; break;
          case 'E': gp = 1; break;
          case 'F': gp = 0; break;
          default: gp = 0;
        }
        totalGradePoints += gp * Number(course.credit_load);
      });
    }
    const gpa = (results && totalUnits > 0) ? (totalGradePoints / totalUnits).toFixed(2)
      : (courses && totalCredits > 0) ? (totalGradePoints / totalCredits).toFixed(2)
      : '0.00';
    const finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY : 120;
    doc.text(`Total Units: ${totalUnits || totalCredits}`, 14, finalY + 10);
    doc.text(`Total Grade Points: ${totalGradePoints}`, 14, finalY + 17);
    doc.text(`GPA: ${gpa}`, 14, finalY + 24);
    doc.setFontSize(12);
    doc.text("Registrar's Signature:", 14, finalY + 40);
    doc.line(60, finalY + 40, 120, finalY + 40);
    doc.save(`${matric}_result.pdf`);
  };

  return (
    <>
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ fontWeight: "bold", color: "#2C2C78" }}>
        {editMode ? 'Edit Student Result' : 'Student Result'}
      </DialogTitle>
      <DialogContent dividers>
        {/* Editable Student Info */}
        <Box sx={{ mb: 2 }}>
          <Typography><b>Name:</b> {name}</Typography>
          <Typography><b>Matric Number:</b> {matric}</Typography>
          <Typography><b>Faculty:</b> {faculty}</Typography>
          <Typography><b>Department:</b> {department}</Typography>
          <Typography><b>Level:</b> {level}</Typography>
          <Typography><b>Session:</b> {session}</Typography>
          <Typography><b>Semester:</b> {semester}</Typography>
        </Box>

        {/* Results Preview */}
        {results && (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>S/N</TableCell>
                <TableCell>CODE</TableCell>
                <TableCell>COURSE TITLE</TableCell>
                <TableCell>UNIT</TableCell>
                <TableCell>SCORE</TableCell>
                <TableCell>GRADE</TableCell>
                <TableCell>GP</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(editMode ? (editStudent?.results || []) : (results || [])).map((r, index) => (
                <TableRow key={index}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{r.code}</TableCell>
                  <TableCell>{r.title}</TableCell>
                  <TableCell>{r.unit}</TableCell>
                  <TableCell>
                    {editMode ? (
                      <TextField value={r.score} size="small" type="number" onChange={e => {
                        const val = e.target.value;
                        setEditStudent(s => ({
                          ...s,
                          results: (s.results || []).map((rr, i) => i === index ? { ...rr, score: val } : rr)
                        }));
                      }} />
                    ) : r.score}
                  </TableCell>
                  <TableCell>{r.grade}</TableCell>
                  <TableCell>{r.gp}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        {courses && (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Course Code</TableCell>
                <TableCell>Course Name</TableCell>
                <TableCell>CAT Score</TableCell>
                <TableCell>Exam Score</TableCell>
                <TableCell>Grade</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(editMode ? (editStudent?.courses_info || []) : (courses || [])).map((course, index) => (
                <TableRow key={index}>
                  <TableCell>{courses[index]?.code}</TableCell>
                  <TableCell>{courses[index]?.name}</TableCell>
                  <TableCell>
                    {editMode ? (
                      <TextField value={course.cat_score || ''} size="small" type="number" onChange={e => {
                        const val = e.target.value;
                        setEditStudent(s => ({
                          ...s,
                          courses_info: (s.courses_info || []).map((cc, i) => i === index ? { ...cc, cat_score: val } : cc)
                        }));
                      }} />
                    ) : (course.cat_score || '')}
                  </TableCell>
                  <TableCell>
                    {editMode ? (
                      <TextField value={course.exam_score || ''} size="small" type="number" onChange={e => {
                        const val = e.target.value;
                        setEditStudent(s => ({
                          ...s,
                          courses_info: (s.courses_info || []).map((cc, i) => i === index ? { ...cc, exam_score: val } : cc)
                        }));
                      }} />
                    ) : (course.exam_score || '')}
                  </TableCell>
                  <TableCell>
                    {editMode ? (
                      <TextField value={course.grade} size="small" onChange={e => {
                        const val = e.target.value;
                        setEditStudent(s => ({
                          ...s,
                          courses_info: (s.courses_info || []).map((cc, i) => i === index ? { ...cc, grade: val } : cc)
                        }));
                      }} />
                    ) : course.grade}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {/* Summary */}
        <Box sx={{ mt: 2 }}>
          {/* <Typography><b>Total Units:</b> {totalUnits || totalCredits}</Typography>
          <Typography><b>GPA:</b> {gpa}</Typography>
          {/* CGPA and Comment if available */}
          {student.cgpa && <Typography><b>CGPA:</b> {student.cgpa}</Typography>}
          {student.comment && <Typography><b>Comment:</b> {student.comment}</Typography>}
        </Box>
      </DialogContent>
      <DialogActions>
        {editMode ? (
          <Button
            onClick={() => handleSaveEdit(editStudent, onSave)}
            variant="contained"
            sx={{ bgcolor: "#2C2C78" }}
          >
            Save
          </Button>
        ) : (
          <Button
            onClick={handleDownloadPDF}
            variant="contained"
            sx={{ bgcolor: "#2C2C78" }}
          >
            Download PDF
          </Button>
        )}
        <Button onClick={handleClose} sx={{ color: "#2C2C78" }}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
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
