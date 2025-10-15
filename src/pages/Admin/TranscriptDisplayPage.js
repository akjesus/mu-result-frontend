import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TablePagination,
  TextField,
  Tabs,
  Tab,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Tooltip,
  IconButton,
} from "@mui/material";
import { Download, Visibility } from "@mui/icons-material";
import TranscriptModal from "./TranscriptModal";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import logo from "../../assets/maduka-logo.png"; // Ensure logo.png exists in assets
import { addTranscriptHeader, addTranscriptFooter } from "../../utils/pdfHeader";
import { getResultsByDepartment } from "../../api/results";
import { getSessionsWithSemesters, getAllLevels } from "../../api/sessions";


export default function TranscriptDisplayPage() {
  const [sessions, setSessions] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [levels, setLevels] = useState([]);
  const [selectedSession, setSelectedSession] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("");
  const [showResults, setShowResults] = useState(false);
  const params = useParams();
  const id = params.id || params.departmentId;
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [openResult, setOpenResult] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [levelTab, setLevelTab] = useState(0);

  // Convert score → grade + grade point
  const getGrade = (score) => {
    if (score >= 70) return { grade: "A", gp: 5 };
    if (score >= 60) return { grade: "B", gp: 4 };
    if (score >= 50) return { grade: "C", gp: 3 };
    if (score >= 45) return { grade: "D", gp: 2 };
    if (score >= 40) return { grade: "E", gp: 1 };
    return { grade: "F", gp: 0 };
  };

  // Bulk Download All Transcripts for current page
  const handleDownloadAll = () => {
    const doc = new jsPDF();
    paginatedStudents.forEach((student, idx) => {
      if (idx !== 0) doc.addPage();
      // Use the same logic as handleDownloadTranscript, but adapt for both student.results and student.courses_info
      addTranscriptHeader(doc);
      doc.setFontSize(11);
      // Try both possible student object shapes
      const name = student.name || student.student_name || '';
      const matric = student.matNo || student.matric || '';
      const faculty = student.faculty || '';
      const department = student.department || student.department_name || '';
      const level = student.level || student.level_name || '';
      const session = student.session || '';
      doc.text(`Name: ${name}`, 14, 105);
      doc.text(`Matric No: ${matric}`, 14, 112);
      if (faculty) doc.text(`Faculty: ${faculty}`, 14, 119);
      doc.text(`Department: ${department}`, 14, 126);
      doc.text(`Level: ${level}`, 14, 133);
      if (session) doc.text(`Session: ${session}`, 14, 140);

      // Table
      let tableColumn, tableRows;
      if (Array.isArray(student.results)) {
        tableColumn = ["S/N", "CODE", "COURSE TITLE", "UNIT", "SCORE", "GRADE", "GP"];
        tableRows = [];
        student.results.forEach((r, index) => {
          tableRows.push([index + 1, r.code, r.title, r.unit, r.score, r.grade, r.gp]);
        });
      } else if (Array.isArray(student.courses_info)) {
        tableColumn = ["Course Code", "Course Name", "Credit", "Score", "Grade"];
        tableRows = [];
        student.courses_info.forEach((course, index) => {
          tableRows.push([
            course.code,
            course.name,
            course.credit_load,
            course.total_score,
            course.grade
          ]);
        });
      }
      if (tableColumn && tableRows) {
        autoTable(doc, {
          startY: 150,
          head: [tableColumn],
          body: tableRows,
        });
      }

      // GPA/CGPA/Comment if available
      let finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 10 : 170;
      if (student.totalUnits) doc.text(`Total Units: ${student.totalUnits}`, 14, finalY);
      if (student.gpa) doc.text(`GPA: ${student.gpa}`, 14, finalY + 7);
      if (student.cgpa) doc.text(`CGPA: ${student.cgpa}`, 14, finalY + 14);
      if (student.comment) doc.text(`Comment: ${student.comment}`, 14, finalY + 21);
      addTranscriptFooter(doc);
    });
    doc.save("all_transcripts.pdf");
  };

  // Download transcript PDF for a student
  const handleDownloadTranscript = (student) => {
    const doc = new jsPDF();
    // Add logo and school name at the top
    doc.addImage(logo, "PNG", 14, 10, 25, 25);
    doc.setFontSize(18);
    doc.text("Maduka University, Ekwegbe-Nsukka, Enugu State", 45, 25); // Replace with your school name
    doc.setFontSize(16);
    doc.text("Student Transcript", 14, 45);
    doc.setFontSize(12);
    doc.text(`Name: ${student.student_name}`, 14, 60);
    doc.text(`Matric No: ${student.matric}`, 14, 67);
    doc.text(`Department: ${student.department_name}`, 14, 74);
    const tableColumn = ["Course Code", "Course Name", "Credit", "Score", "Grade"];
    const tableRows = [];
    if (Array.isArray(student.courses_info)) {
      student.courses_info.forEach(course => {
        tableRows.push([
          course.code,
          course.name,
          course.credit_load,
          course.total_score,
          course.grade
        ]);
      });
    }
    autoTable(doc, {
      startY: 85,
      head: [tableColumn],
      body: tableRows,
    });
    // GPA calculation
    let totalCredits = 0;
    let totalGradePoints = 0;
    if (Array.isArray(student.courses_info)) {
      student.courses_info.forEach(course => {
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
    const gpa = totalCredits > 0 ? (totalGradePoints / totalCredits).toFixed(2) : '0.00';
    const finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY : 120;
    doc.text(`Total Credits: ${totalCredits}`, 14, finalY + 10);
    doc.text(`Total Grade Points: ${totalGradePoints}`, 14, finalY + 17);
    doc.text(`GPA: ${gpa}`, 14, finalY + 24);
    // Registrar signature and date at the bottom of the page
    const pageHeight = doc.internal.pageSize.getHeight();
    doc.setFontSize(12);
    doc.text("Registrar's Signature:", 14, pageHeight - 30);
    doc.line(60, pageHeight - 30, 120, pageHeight - 30); // Signature line
    const today = new Date();
    const dateStr = today.toLocaleDateString();
    doc.text(`Date: ${dateStr}`, 14, pageHeight - 20);
    doc.save(`${student.matric}_transcript.pdf`);
  };

  // Fetch sessions and levels on mount
  useEffect(() => {
    getSessionsWithSemesters().then(res => setSessions(res.data.sessions)).catch(() => setSessions([]));
    getAllLevels().then(res => setLevels(res.data.levels)).catch(() => setLevels([]));
  }, []);

  // Update semesters when session changes
  useEffect(() => {
    if (selectedSession) {
      const found = sessions.find(s => s.id === selectedSession || s.id === Number(selectedSession));
      setSemesters(found ? found.semesters : []);
    } else {
      setSemesters([]);
    }
    setSelectedSemester("");
  }, [selectedSession, sessions]);

  // Manual fetch results handler
  const [fetching, setFetching] = useState(false);
  const handleFetchResults = () => {
    if (id && selectedSession && selectedSemester) {
      setFetching(true);
      getResultsByDepartment(id, selectedSession, selectedSemester)
        .then(res => {
          // Attach calculated GPA to each student
          const results = (res.data.results || []).map(student => {
            let totalCredits = 0;
            let totalGradePoints = 0;
            if (Array.isArray(student.courses_info)) {
              student.courses_info.forEach(course => {
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
            const gpa = totalCredits > 0 ? (totalGradePoints / totalCredits) : 0;
            return { ...student, gpa };
          });
          setStudents(results);
          setShowResults(true);
        })
        .catch(() => {
          setStudents([]);
          setShowResults(false);
        })
        .finally(() => setFetching(false));
    } else {
      setShowResults(false);
    }
  };

  // Get all unique levels from students or from API
  const allLevels = levels.length > 0
    ? levels.map(l => l.name)
    : Array.from(new Set(students.map(s => s.level || s.Level || s.level_name))).sort();
  // Filter students by selected level
  const studentsByLevel = allLevels.length > 0
    ? students.filter(s => (s.level || s.Level || s.level_name) === allLevels[levelTab])
    : students;

  // Filter students by search (matric or name)
  const filteredStudents = studentsByLevel.filter(student =>
    (student.matric || student.matNo || '').toLowerCase().includes(search.toLowerCase()) ||
    (student.student_name && student.student_name.toLowerCase().includes(search.toLowerCase()))
  );
  // Paginate filtered students
  const paginatedStudents = filteredStudents.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
  <Box p={3}>
    <Box mb={2}>
      {students.length > 0 && (
        <Typography variant="h5" sx={{ fontWeight: "bold", color: "#2C2C78" }}>
          Department Transcripts: {students[0].department_name}
        </Typography>
      )}
    </Box>
  {/* Dropdowns for session, semester, GPA range, and fetch button */}
  <Box display="flex" gap={2} mb={2} alignItems="center">
      <FormControl sx={{ minWidth: 160 }} size="small">
        <InputLabel>Session</InputLabel>
        <Select
          value={selectedSession}
          label="Session"
          onChange={e => setSelectedSession(e.target.value)}
        >
          <MenuItem value=""><em>Select Session</em></MenuItem>
          {sessions.map(session => (
            <MenuItem key={session.id} value={session.id}>{session.name}</MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl sx={{ minWidth: 160 }} size="small" disabled={!selectedSession}>
        <InputLabel>Semester</InputLabel>
        <Select
          value={selectedSemester}
          label="Semester"
          onChange={e => setSelectedSemester(e.target.value)}
        >
          <MenuItem value=""><em>Select Semester</em></MenuItem>
          {semesters.map(sem => (
            <MenuItem key={sem.id} value={sem.id}>{sem.name}</MenuItem>
          ))}
        </Select>
      </FormControl>
      <Button
        variant="contained"
        sx={{ color: "#2C2C78" }}
        onClick={handleFetchResults}
        disabled={fetching || !selectedSession || !selectedSemester}
      >
        {fetching ? 'Fetching...' : 'Fetch Transcripts'}
      </Button>
    </Box>
    {/* Level Tabs */}
    {allLevels.length > 0 && (
      <Tabs
        value={levelTab}
        onChange={(e, newValue) => {
          setLevelTab(newValue);
          setPage(0);
        }}
        sx={{ mb: 2 }}
        variant="scrollable"
        scrollButtons="auto"
      >
        {allLevels.map((level, idx) => (
          <Tab key={level} label={`${level} Level`} />
        ))}
      </Tabs>
    )}
    <Box mt={2}>
      <TextField
        label="Search by Matric or Name"
        variant="outlined"
        size="small"
        fullWidth
        value={search}
        onChange={e => setSearch(e.target.value)}
        sx={{ mb: 2 }}
        disabled={!showResults}
      />
    </Box>
    {/* Results Table */}
    {showResults && (
      <Box mt={4}>
        <Box display="flex" alignItems="center" mb={2}>
          <Typography variant="h6" sx={{ fontWeight: "bold" }}>
            Transcripts
          </Typography>
          <Box sx={{ flexGrow: 1 }} />
          <Box display="flex" justifyContent="flex-end" width="100%">
            <Button
              variant="contained"
              color="primary"
              startIcon={<Download />}
              onClick={handleDownloadAll}
              disabled={!showResults || paginatedStudents.length === 0}
              sx={{ minWidth: 180 }}
            >
              Download All Transcripts
            </Button>
          </Box>
        </Box>
        {/* Dynamically generate course columns */}
        {(() => {
          let allCourses = [];
          paginatedStudents.forEach(student => {
            if (Array.isArray(student.courses_info)) {
              student.courses_info.forEach(course => {
                if (!allCourses.find(c => c.code === course.code)) {
                  allCourses.push({ code: course.code, name: course.name });
                }
              });
            }
          });
          allCourses.sort((a, b) => a.code.localeCompare(b.code));
          return (
            <Table sx={{ minWidth: 650, overflowX: 'auto', display: 'block' }}>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>Matric NO</TableCell>
                  {allCourses.map(course => (
                    <TableCell key={course.code} sx={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>{course.code}</TableCell>
                  ))}
                  <TableCell sx={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>GPA</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedStudents.map(student => {
                  let totalCredits = 0;
                  let totalGradePoints = 0;
                  const courseMap = {};
                  if (Array.isArray(student.courses_info)) {
                    student.courses_info.forEach(course => {
                      courseMap[course.code] = course;
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
                  const gpa = totalCredits > 0 ? (totalGradePoints / totalCredits).toFixed(2) : '0.00';
                  return (
                    <TableRow key={student.matric}>
                      <TableCell>{student.matric}</TableCell>
                      {allCourses.map(course => (
                        <TableCell key={course.code} align="center">
                          {courseMap[course.code] ? `${courseMap[course.code].grade}` : '-'}
                        </TableCell>
                      ))}
                      <TableCell>{gpa}</TableCell>
                      <TableCell>
                        {/* Use MUI IconButton and Tooltip for View action */}
                        <Box display="flex" gap={1}>
                          <Tooltip title="View Transcript">
                            <IconButton color="primary" size="small" onClick={() => { setSelectedStudent(student); setOpenResult(true); }}>
                              <Visibility />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Download Transcript">
                            <IconButton color="primary" size="small" onClick={() => { handleDownloadTranscript(student); }}>
                              <Download />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                      <TableCell align="right" sx={{ position: 'sticky', right: 0, background: '#fff', zIndex: 1 }}>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          );
        })()}
        <TablePagination
          component="div"
          count={filteredStudents.length}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={e => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[10, 25, 50]}
        />
      </Box>
    )}
    {/* Transcript Modal */}
    <TranscriptModal
      open={openResult}
      handleClose={() => setOpenResult(false)}
      student={selectedStudent}
    />
  </Box>
  );
}
