import React from "react";
import { useState } from "react";
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
  Box,
  Snackbar,
  Alert
} from "@mui/material";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import logo from "../../assets/maduka-logo.png"; // Ensure logo.png exists in assets
import exoFont from "../../assets/exo.ttf"; 

// Function to handle save after editing

export default function ResultModal({ open, handleClose, student}) {
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
    function showSnackbar(message, severity) {
      setSnackbar({ open: true, message, severity });
    }
  
    const handleCloseSnackbar = () => {
      setSnackbar({ ...snackbar, open: false });
    };
  if (!student) {
    return (
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Transcript</DialogTitle>
        <DialogContent>
          <Typography color="error">No student data available.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Close</Button>
        </DialogActions>
      </Dialog>
    );
  }

  // Support both shapes for student info
  const name = student.first_name || student.student_name || '';
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
    doc.addFileToVFS("MyFont.ttf", exoFont);
    doc.addFont("MyFont.ttf", "MyFont", "normal");
    doc.setFont("MyFont");
    doc.addImage(logo, "PNG", 14, 10, 25, 25);
    doc.setFontSize(18);
    doc.text("Maduka University, Ekwegbe", 45, 25);
    doc.setFontSize(16);
    doc.text("Student Transcript", 14, 45);
    doc.setFontSize(12);
    doc.text(`Name: ${name}`, 14, 60);
    doc.text(`Matric No: ${matric}`, 14, 67);
    doc.text(`Department: ${department}`, 14, 74);
    doc.text(`Faculty: ${faculty}`, 14, 81);
    doc.text(`Level: ${level}`, 14, 88);
    doc.text(`Session: ${session}`, 14, 95);
    doc.text(`Semester: ${semester}`, 14, 102);
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
        startY: 110,
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
    doc.save(`${matric}_transcript.pdf`);
    showSnackbar("Transcript Generated!", "success");
  };

  return (
    <>
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ fontWeight: "bold", color: "#2C2C78" }}>
        {'Student Transcript'}
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
              {( (results || [])).map((r, index) => (
                <TableRow key={index}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{r.code}</TableCell>
                  <TableCell>{r.title}</TableCell>
                  <TableCell>{r.unit}</TableCell>
                  <TableCell>{r.score}</TableCell>
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
                <TableCell>Credit Unit</TableCell>
                <TableCell>Score</TableCell>
                <TableCell>Grade</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {((courses || [])).map((course, index) => (
                <TableRow key={index}>
                  <TableCell>{courses[index]?.code}</TableCell>
                  <TableCell>{courses[index]?.name}</TableCell>
                  <TableCell>
                    {(course.credit_load || '')}
                  </TableCell>
                  <TableCell>
                    {(course.total_score || '')}
                  </TableCell>
                  <TableCell>
                    {course.grade}
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
          <Button
            onClick={handleDownloadPDF}
            variant="contained"
            sx={{ bgcolor: "#2C2C78" }}
          >
            Download Transcript
          </Button>
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
