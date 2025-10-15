import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getResultsByDepartment } from "../../api/results";
import { Box, Typography, Table, TableHead, TableRow, TableCell, TableBody, Paper } from "@mui/material";

export default function DepartmentResults() {
  const { id } = useParams();
  console.log(id);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const resResults = await getResultsByDepartment(id);
        console.log(resResults);
        setResults(resResults.data.results || []);
      } catch (err) {
        setResults([]);
      }
      setLoading(false);
    }
    fetchData();
  }, [id]);

  return (
    <Box p={3}>
      <Typography variant="h5" gutterBottom>Department Results & GPA</Typography>
      {loading ? (
        <Typography>Loading...</Typography>
      ) : (
        <>
          <Paper sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{ p: 2 }}>GPA Summary</Typography>
          </Paper>
          <Paper>
            <Typography variant="h6" sx={{ p: 2 }}>All Results</Typography>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Student</TableCell>
                  <TableCell>Course</TableCell>
                  <TableCell>Total Score</TableCell>
                  <TableCell>Grade</TableCell>
                  <TableCell>Credit Load</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {results.map((row, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{row.first_name} {row.last_name}</TableCell>
                    <TableCell>{row.course_name}</TableCell>
                    <TableCell>{row.total_score}</TableCell>
                    <TableCell>{row.grade}</TableCell>
                    <TableCell>{row.credit_load}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        </>
      )}
    </Box>
  );
}
