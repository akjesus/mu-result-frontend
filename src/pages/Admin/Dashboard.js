import React from "react";
import { getDashboardStats } from "../../api/dashboard";
import { useEffect, useState } from "react";
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Snackbar,
  Alert,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  // Stats state
  const [stats, setStats] = useState([]);
  useEffect(() => {
    getDashboardStats()
      .then((res) => {
        // Assuming API returns an object with keys matching the stat keys
        const data = res.data.dashboardData;
        showSnackbar("Dashboard stats fetched successfully!", "success");
        // Map API response to stats array
        const statsArr = [
          { key: "totalStudents", label: "Total Students", value: data.totalStudents, path: "/admin/students" },
          { key: "totalCourses", label: "Total Courses", value: data.totalCourses, path: "/admin/courses" },
          { key: "totalDepartments", label: "Departments", value: data.totalDepartments, path: "/admin/departments" },
          { key: "avgCGPA", label: "Average CGPA", value: data.avgCGPA.toFixed(2) },
          { key: "highestCGPA", label: "Highest CGPA", value: data.highestCGPA.toFixed(2) },
          { key: "highestGPA", label: "Highest GPA", value: data.highestGPA.toFixed(2) },
          { key: "lowestCGPA", label: "Lowest CGPA", value: data.lowestCGPA.toFixed(2) },
          { key: "lowestGPA", label: "Lowest GPA", value: data.lowestGPA.toFixed(2) },
        ];
        setStats(statsArr);
      })
      .catch((err) => {
        console.log(err.response.data.message || err)
        showSnackbar(`${err.response.data.message || "Failed to fetch dashboard stats"}`, "error");
      });
  }, []);

  //get data from API

  //
  // Mock data for departmental performance
  const deptPerformance = [
    { name: "Computer Science", avgGPA: 3.8 },
    { name: "Pharmacy", avgGPA: 3.5 },
    { name: "Engineering", avgGPA: 3.2 },
    { name: "Law", avgGPA: 2.9 },
    { name: "Medicine", avgGPA: 3.7 },
  ];

  // Mock data for CGPA distribution
  const cgpaDistribution = [
    { name: "First Class (4.5+)", value: 300 },
    { name: "2nd Upper (3.5 - 4.49)", value: 500 },
    { name: "2nd Lower (2.5 - 3.49)", value: 300 },
    { name: "Pass (<2.5)", value: 100 },
  ];

  const COLORS = ["#2C2C78", "#4682B4", "#87CEEB", "#B0C4DE"];
  function showSnackbar(message, severity) {
    setSnackbar({ open: true, message, severity });
  }

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <>
    <Box p={{ xs: 1, sm: 3 }} sx={{ maxWidth: 900, mx: 'auto' }}>
      <Typography variant="h5" gutterBottom sx={{ fontWeight: "bold", color: "#2C2C78", fontSize: { xs: 18, sm: 24 } }}>
      Admin Dashboard
      </Typography>
      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        {stats.map((item) => (
          <Grid item xs={12} sm={6} md={3} key={item.key}>
            <Card
              sx={{
                bgcolor: "#f5f5f5",
                borderRadius: 2,
                cursor: item.path ? "pointer" : "default",
                "&:hover": item.path ? { bgcolor: "#e0e0e0" } : {},
                minWidth: 0,
              }}
              onClick={() => item.path && (window.innerWidth >= 900) && navigate(item.path)}
            >
              <CardContent>
                <Typography variant="subtitle2" sx={{ fontWeight: "bold", fontSize: { xs: 13, sm: 16 } }}>
                  {item.label}
                </Typography>
                <Typography variant="h6" sx={{ fontSize: { xs: 16, sm: 22 } }}>{item.value}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      {/* Charts Section */}
      <Grid container spacing={2} sx={{ mt: 2 }}>
        {/* Department Performance */}
        <Grid xs={12} md={6}>
          <Card sx={{ borderRadius: 2, mb: { xs: 2, md: 0 } }}>
            <CardContent>
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: "bold", fontSize: { xs: 15, sm: 18 } }}>
                Departmental Performance
              </Typography>
              <Box sx={{ width: "100%", minWidth: 0, overflowX: "auto" }}>
                <BarChart width={window.innerWidth < 600 ? 300 : 400} height={250} data={deptPerformance}>
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 5]} />
                  <Tooltip />
                  <Bar dataKey="avgGPA" fill="#2C2C78" />
                </BarChart>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        {/* CGPA Distribution */}
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 2 }}>
            <CardContent>
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: "bold", fontSize: { xs: 15, sm: 18 } }}>
                CGPA Distribution
              </Typography>
              <Box sx={{ width: "100%", minWidth: 0, overflowX: "auto" }}>
                <PieChart width={window.innerWidth < 600 ? 300 : 400} height={250}>
                  <Pie
                    data={cgpaDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={window.innerWidth < 600 ? 70 : 90}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {cgpaDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
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
