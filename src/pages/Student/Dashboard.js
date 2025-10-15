// src/pages/Student/Dashboard.js
import React from "react";
import { useEffect, useState } from "react";
import { getCurrentGPA } from "../../api/students";
import { Grid, Card, CardContent, Typography, Box } from "@mui/material";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";


const SummaryCard = ({ title, value }) => (
  <Card sx={{ bgcolor: "#2C2C78", color: "white", borderRadius: 3, textAlign: "center" }}>
    <CardContent>
      <Typography variant="h6">{title}</Typography>
      <Typography variant="h4" sx={{ fontWeight: "bold" }}>
        {value}
      </Typography>
    </CardContent>
  </Card>
);

const StudentDashboard = () => {
  const [gpaData, setGpaData] = useState({
    gpa: 0,
    cgpa: 0,
    total_courses: 0,
    total_failed: 0,
    performance: [],
  });

  useEffect(() => {
    getCurrentGPA()
      .then(res => {
        const floatgpa = parseFloat(res.data.gpa.gpa) || 0;
        const floatcgpa = parseFloat(res.data.gpa.cgpa) || 0;
        setGpaData({
          gpa: floatgpa.toFixed(2) || 0,
          cgpa: floatcgpa.toFixed(2) || 0,
          total_courses: res.data.gpa.total_courses || 0,
          total_failed: res.data.gpa.total_failed || 0,
          performance: res.data.gpa.performance || [],
        });
      })
      .catch((err) => {
        console.log(err.response.data.message || err.message || "Error fetching GPA");
        setGpaData({
          gpa: 0,
          cgpa: 0,
          total_courses: 0,
          total_failed: 0,
          performance: [],
        });
      });
  }, []);

  return (
    <Box sx={{ p: { xs: 1, sm: 2 }, maxWidth: 600, mx: "auto" }}>
      {/* Quick summary cards */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} sm={6} md={3}>
          <SummaryCard title="GPA (Current)" value={gpaData.gpa} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <SummaryCard title="CGPA" value={gpaData.cgpa} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <SummaryCard title="Courses Taken" value={gpaData.total_courses} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <SummaryCard title="Carry Over" value={gpaData.total_failed} />
        </Grid>
      </Grid>

      {/* Performance chart */}
      <Card sx={{ borderRadius: 3, p: { xs: 1, sm: 2 }, mb: 2 }}>
        <Typography variant="h6" sx={{ mb: { xs: 1, sm: 2 }, fontWeight: "bold", fontSize: { xs: 16, sm: 20 } }}>
          Performance Trend
        </Typography>
        <Box sx={{ width: "100%", minWidth: 0, overflowX: "auto" }}>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={gpaData.performance} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="semester" tick={{ fontSize: 10 }} interval={0} angle={-30} textAnchor="end" />
              <YAxis domain={[0, 4]} tick={{ fontSize: 10 }} />
              <Tooltip wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="gpa" fill="#2C2C78" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </Card>
    </Box>
  );
};

export default StudentDashboard;
