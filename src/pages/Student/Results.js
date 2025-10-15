import React, { useState, useEffect } from "react";
import { getSessions, getLevels } from "../../api/schools";
import {getResults} from "../../api/students";
import exoFont from "../../assets/exo.ttf"; 
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Snackbar,
  Alert,
} from "@mui/material";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import logo from "../../assets/maduka-logo.png"; 
import stamp from "../../assets/stamp.png"; 

export default function StudentResults() {
const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
      function showSnackbar(message, severity) {
        setSnackbar({ open: true, message, severity });
      }
    
      const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, open: false });
      };
  const [formData, setFormData] = useState({
    session: "",
    level: "",
    semester: "",
  });
  // State for sessions, levels
  const [sessions, setSessions] = useState([]);
  const [levels, setLevels] = useState([]);
  const [student, setStudent] = useState({})
  // Fetch sessions
  useEffect(() => {
    getSessions()
      .then(res => {
        setSessions(res.data.sessions || []);
      })
      .catch(console.error);
  }, []);

  // Fetch levels
  useEffect(() => {
    getLevels()
      .then(res => {
        setLevels(res.data.levels || []);
      })
      .catch((error=> {
       showSnackbar(error.response.data.message, "error");
      }));
  }, []);

  // Fetch results
  const [results, setResults] = useState(null);

  const getGP = (grade, credit) => {
    switch (grade) {
      case "A": return 5 * credit;
      case "B": return 4 * credit;
      case "C": return 3 * credit;
      case "D": return 2 * credit;
      case "E": return 1 * credit;
      case "F": return 0;
      default: return 0;
    }
  };

  


  const handleSearch = () => {
    getResults(formData)
    .then(res=> {
      if(res.data.results) {
        showSnackbar("Results retrieved successfully!", "success");
        setResults(res.data.results);
        console.log(res.data.student);
        setStudent(res.data.student);
        return;
      }
      showSnackbar(res.data.message, "info");
      setResults([]);
    })
    .catch(error=> {
      showSnackbar(error.response.data.message, "error");
      setResults([]);
    })
   
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    doc.addFileToVFS("MyFont.ttf", exoFont);
    doc.addFont("MyFont.ttf", "MyFont", "normal");
    doc.setFont("MyFont");
    doc.addImage(logo, "PNG", 90, 10, 25, 25);
    doc.setFontSize(18);
      doc.setFillColor(100, 0, 0, 0);
      doc.text("Maduka University, Ekwegbe, Enugu State", 45, 40);
      doc.setFontSize(14);
      doc.text("Email: vc@madukauniversity.edu.ng", 65, 47);
      doc.setFontSize(12);
      doc.text("Website: www.madukauniversity.edu.ng", 65, 54);
      doc.setFontSize(16);
      doc.text("Personal Details", 14, 64);
      doc.setFontSize(12);
      doc.text(`Name: ${student.fullName}`, 14, 71);
      doc.text(`Matric No: ${student.matric}`, 14, 78);
      doc.text(`Department: ${student.department}`, 14, 85);
      doc.text(`Faculty: ${student.school}`, 14, 92);
      doc.text(`${student.level} LEVEL RESULTS FOR ${results[0].session} ACADEMIC SESSION`, 45, 98);
    // Group results by semester
    const grouped = {};
    results.forEach((r) => {
      if (!grouped[r.semester]) grouped[r.semester] = [];
      grouped[r.semester].push(r);
    });

    let startY = 103;
    let totalCredits = 0;
    let totalGradePoints = 0;
    let semesterGPPs = [];
    Object.entries(grouped).forEach(([semester, semResults], idx) => {
      let tableColumn = ["S/N", "CODE", "COURSE TITLE", "TUR", "GRADE", "GP"];
      let tableRows = semResults.map((r, i) => [i + 1, r.code, r.title, r.credit, r.grade, getGP(r.grade, r.credit)]);
      // Semester totals
      const semCredits = semResults.reduce((sum, r) => sum + Number(r.credit), 0);
      const semGP = semResults.reduce((sum, r) => sum + getGP(r.grade, r.credit), 0);
      tableRows.push(["", "", "Total", semCredits, "", semGP]);
      // GPP for semester
      const gpp = semCredits > 0 ? (semGP / semCredits).toFixed(2) : "0.00";
      semesterGPPs.push({ semester, gpp });
      // Add semester title
      doc.setFontSize(14);
      doc.text(semester, 14, startY);
      // Add table for this semester
      autoTable(doc, {
        startY: startY + 4,
        head: [tableColumn],
        body: tableRows,
      });
      startY = doc.lastAutoTable.finalY + 10;
      // Accumulate for CGPA
      totalCredits += semCredits;
      totalGradePoints += semGP;
    });

    // CGPA Calculation
    const cgpa = totalCredits > 0 ? (totalGradePoints / totalCredits).toFixed(2) : "0.00";
    // Place CGPA and GPPs below tables
    doc.setFontSize(13);
    doc.setTextColor(44, 44, 120);
    let y = startY;
    semesterGPPs.forEach((s, i) => {
      doc.text(`${s.semester} GPA: ${s.gpp}`, 14, y);
      y += 7;
    });
    doc.text(`CGPA: ${cgpa}`, 14, y);
    // Add CGPA classification comment
    let cgpaComment = '';
    const cgpaNum = parseFloat(cgpa);
    if (cgpaNum < 2.5) {
      cgpaComment = 'PASS';
    } else if (cgpaNum < 3.5) {
      cgpaComment = 'SECOND CLASS LOWER';
    } else if (cgpaNum < 4.5) {
      cgpaComment = 'SECOND CLASS UPPER';
    } else {
      cgpaComment = 'FIRST CLASS';
    }
    doc.setFontSize(13);
    doc.text(`Result: ${cgpaComment}`, 14, y + 7);
    doc.setTextColor(0, 0, 0);
    doc.addImage(stamp, "PNG", 110, y, 52, 35);

    doc.save(`${student.matric}_result.pdf`);
    showSnackbar("Result Generated!", "success");
  };

  return (
    <>
    <Container sx={{ mt: 6, px: { xs: 1, sm: 2 }, maxWidth: { xs: '100%', sm: 600 } }}>
      {/* Search Form */}
      <Paper
        elevation={4}
        sx={{
          p: { xs: 2, sm: 4 },
          width: "100%",
          maxWidth: 600,
          margin: "0 auto",
          borderRadius: 3,
          textAlign: "center",
        }}
      >
        <Typography variant="h6" gutterBottom sx={{ fontSize: { xs: 16, sm: 20 } }}>
          Check Your Results
        </Typography>

        {/* Session */}
        <TextField
          select
          label="Session"
          name="session"
          value={formData.session}
          onChange={e => setFormData(prev => ({ ...prev, session: e.target.value }))}
          fullWidth
          sx={{ mb: 3 }}
        >
          <MenuItem value="">Select Session</MenuItem>
          {sessions.map(ses => (
            <MenuItem key={ses.id} value={ses.id}>{ses.name}</MenuItem>
          ))}
        </TextField>

        {/* Level Dropdown */}
        <TextField
          select
          label="Level"
          name="level"
          value={formData.level}
          onChange={e => setFormData(prev => ({ ...prev, level: e.target.value }))}
          fullWidth
          sx={{ mb: 3 }}
        >
          <MenuItem value="">Select Level</MenuItem>
          {levels.map(lvl => (
            <MenuItem key={lvl.id} value={lvl.id}>{lvl.name || lvl}</MenuItem>
          ))}
        </TextField>

        {/* Semester Dropdown */}
        <TextField
          select
          label="Semester"
          name="semester"
          value={formData.semester}
          onChange={e => setFormData(prev => ({ ...prev, semester: e.target.value }))}
          fullWidth
          sx={{ mb: 3 }}
        >
          <MenuItem value="">Select Semester</MenuItem>
          <MenuItem value="1">First</MenuItem>
          <MenuItem value="2">Second</MenuItem>
        </TextField>

        {/* Removed duplicate Level and Semester dropdowns */}

        <Button
          variant="contained"
          fullWidth
          sx={{ bgcolor: "#2C2C78", ":hover": { bgcolor: "#1f1f5c" } }}
          onClick={handleSearch}
        >
          Search Result
        </Button>
      </Paper>

      {/* Results Table */}
      {results && (
        <Box sx={{ mt: 5 }}>
          <Paper sx={{ p: { xs: 2, sm: 3 }, borderRadius: 3, overflowX: "auto" }}>
            <Typography variant="h6" gutterBottom sx={{ fontSize: { xs: 16, sm: 20 } }}>
              Results for {formData.session} - Level {formData.level} - {formData.semester} Semester
            </Typography>
            <Table sx={{ minWidth: 320 }}>
              <TableHead>
                <TableRow>
                  <TableCell><b>Course Code</b></TableCell>
                  <TableCell><b>Course Title</b></TableCell>
                  <TableCell><b>Credit</b></TableCell>
                  <TableCell><b>Grade</b></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {results.map((course, index) => (
                  <TableRow key={index}>
                    <TableCell sx={{ fontSize: { xs: 13, sm: 15 } }}>{course.code}</TableCell>
                    <TableCell sx={{ fontSize: { xs: 13, sm: 15 } }}>{course.title}</TableCell>
                    <TableCell sx={{ fontSize: { xs: 13, sm: 15 } }}>{course.credit}</TableCell>
                    <TableCell sx={{ fontSize: { xs: 13, sm: 15 } }}>{course.grade}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {/* Download PDF Button */}
            <Button
              variant="contained"
              sx={{ mt: 3, bgcolor: "#2C2C78", width: { xs: "100%", sm: "auto" }, ":hover": { bgcolor: "#1f1f5c" } }}
              onClick={handleDownloadPDF}
            >
              Download PDF
            </Button>
          </Paper>
        </Box>
      )}
    </Container>
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
