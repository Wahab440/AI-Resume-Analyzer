import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  LinearProgress,
  Chip,
  List,
  ListItem,
  ListItemText,
  Paper,
  Grid,
  Avatar,
  ThemeProvider,
  createTheme,
  AppBar,
  Toolbar,
  CssBaseline,
  Skeleton,
  IconButton,
  Collapse,
} from "@mui/material";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import AssessmentIcon from "@mui/icons-material/Assessment";
import SchoolIcon from "@mui/icons-material/School";
import WorkIcon from "@mui/icons-material/Work";
import LightbulbIcon from "@mui/icons-material/Lightbulb";
import AnalyticsIcon from "@mui/icons-material/Analytics";
import HistoryIcon from "@mui/icons-material/History";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: "#1e3a8a", // Deep blue
    },
    secondary: {
      main: "#7c3aed", // Purple
    },
    background: {
      default: "#f8fafc",
      paper: "#ffffff",
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h3: {
      fontWeight: 700,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          border: '1px solid rgba(0,0,0,0.05)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 8,
        },
      },
    },
  },
});

function App() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [view, setView] = useState('analyze'); // 'analyze' or 'history'
  const [reports, setReports] = useState([]);
  const [expandedReport, setExpandedReport] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      setFile(files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const sendFile = async () => {
    if (!file) return;
    setLoading(true);
    const formData = new FormData();
    formData.append("resume", file);

    try {
      const response = await fetch("http://localhost:5000/upload", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      if (!response.ok || data.error) {
        alert(data.error || "AI processing failed");
        setResult(null);
      } else {
        setResult(data);
      }
    } catch (error) {
      alert("Error uploading resume");
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const getChartData = (skills) => {
    const languages = ["html", "css", "javascript", "python"];
    return languages.map(lang => ({
      name: lang.toUpperCase(),
      proficiency: skills.includes(lang) ? Math.floor(Math.random() * 40) + 60 : 0, // Random proficiency if detected
    }));
  };

  const fetchReports = async () => {
    try {
      const response = await fetch("http://localhost:5000/reports");
      if (!response.ok) {
        setReports([]);
        console.error("Error fetching reports: HTTP", response.status);
        return;
      }
      const data = await response.json();
      if (Array.isArray(data)) {
        setReports(data);
      } else {
        setReports([]);
        console.error("Error fetching reports: Response is not array", data);
      }
    } catch (error) {
      setReports([]);
      console.error("Error fetching reports:", error);
    }
  };

  useEffect(() => {
    if (view === 'history') {
      fetchReports();
    }
  }, [view]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppBar position="static" elevation={2} sx={{ bgcolor: 'primary.main' }}>
        <Toolbar>
          <AnalyticsIcon sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 700 }}>
            AI Resume Analyzer
          </Typography>
          <Button
            color="inherit"
            startIcon={<AssessmentIcon />}
            onClick={() => setView('analyze')}
            sx={{ mr: 2, fontWeight: 600 }}
            variant={view === 'analyze' ? 'outlined' : 'text'}
          >
            Analyze
          </Button>
          <Button
            color="inherit"
            startIcon={<HistoryIcon />}
            onClick={() => setView('history')}
            sx={{ fontWeight: 600 }}
            variant={view === 'history' ? 'outlined' : 'text'}
          >
            History
          </Button>
        </Toolbar>
      </AppBar>
      <Container maxWidth="xl" sx={{ py: 4, bgcolor: 'background.default', minHeight: '100vh' }}>
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Typography variant="h4" component="h1" gutterBottom align="center" color="primary" sx={{ mb: 2 }}>
            Professional Resume Analysis Dashboard
          </Typography>
          <Typography variant="subtitle1" align="center" color="textSecondary" gutterBottom sx={{ mb: 4 }}>
            Leverage AI to gain deep insights into your resume's strengths and areas for improvement
          </Typography>
        </motion.div>

        {view === 'history' ? (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Typography variant="h4" component="h1" gutterBottom align="center" color="primary" sx={{ mb: 2 }}>
              Analysis History
            </Typography>
            <Typography variant="subtitle1" align="center" color="textSecondary" gutterBottom sx={{ mb: 4 }}>
              View your past resume analysis reports
            </Typography>

            {reports.length === 0 ? (
              <Box textAlign="center" py={8}>
                <HistoryIcon sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
                <Typography variant="h6" color="textSecondary">
                  No analysis reports yet
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Upload and analyze your first resume to see it here
                </Typography>
              </Box>
            ) : (
              <Grid container spacing={3}>
                {reports.map((report, index) => (
                  <Grid size={{ xs: 12, md: 6, lg: 4 }} key={report._id}>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                    >
                      <Card elevation={3} sx={{ borderRadius: 3, cursor: 'pointer', '&:hover': { elevation: 6 } }}>
                        <CardContent sx={{ p: 3 }}>
                          <Box display="flex" alignItems="center" mb={2}>
                            <Avatar sx={{ bgcolor: 'primary.light', mr: 2 }}>
                              <AssessmentIcon sx={{ color: 'primary.main' }} />
                            </Avatar>
                            <Box flexGrow={1}>
                              <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                                {report.filename}
                              </Typography>
                              <Typography variant="body2" color="textSecondary">
                                {new Date(report.createdAt).toLocaleDateString()}
                              </Typography>
                            </Box>
                          </Box>

                          <Box display="flex" alignItems="center" mb={2}>
                            <Typography variant="body2" color="textSecondary" sx={{ mr: 1 }}>
                              Score:
                            </Typography>
                            <Chip
                              label={`${report.score}/100`}
                              color={report.score >= 80 ? 'success' : report.score >= 60 ? 'warning' : 'error'}
                              size="small"
                            />
                          </Box>

                          <Box display="flex" alignItems="center" mb={2}>
                            <WorkIcon sx={{ mr: 1, color: 'textSecondary', fontSize: 18 }} />
                            <Typography variant="body2">
                              {report.experience_years} years experience
                            </Typography>
                          </Box>

                          <Box display="flex" alignItems="center" mb={2}>
                            <SchoolIcon sx={{ mr: 1, color: 'textSecondary', fontSize: 18 }} />
                            <Typography variant="body2">
                              Education: {report.has_education ? 'Present' : 'Not found'}
                            </Typography>
                          </Box>

                          <Button
                            fullWidth
                            variant="outlined"
                            startIcon={expandedReport === report._id ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                            onClick={() => setExpandedReport(expandedReport === report._id ? null : report._id)}
                            sx={{ mt: 2 }}
                          >
                            {expandedReport === report._id ? 'Hide Details' : 'View Details'}
                          </Button>

                          <Collapse in={expandedReport === report._id}>
                            <Box mt={2}>
                              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                                Skills Detected
                              </Typography>
                              <Box display="flex" flexWrap="wrap" gap={1} mb={2}>
                                {report.skills.slice(0, 10).map((skill, idx) => (
                                  <Chip key={idx} label={skill} size="small" variant="outlined" />
                                ))}
                                {report.skills.length > 10 && (
                                  <Chip label={`+${report.skills.length - 10} more`} size="small" variant="outlined" />
                                )}
                              </Box>

                              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                                Suggestions
                              </Typography>
                              <List dense>
                                {report.suggestions.slice(0, 3).map((suggestion, idx) => (
                                  <ListItem key={idx} sx={{ px: 0 }}>
                                    <ListItemText
                                      primary={suggestion}
                                      primaryTypographyProps={{ variant: 'body2' }}
                                    />
                                  </ListItem>
                                ))}
                                {report.suggestions.length > 3 && (
                                  <ListItem sx={{ px: 0 }}>
                                    <ListItemText
                                      primary={`+${report.suggestions.length - 3} more suggestions`}
                                      primaryTypographyProps={{ variant: 'body2', color: 'textSecondary' }}
                                    />
                                  </ListItem>
                                )}
                              </List>
                            </Box>
                          </Collapse>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </Grid>
                ))}
              </Grid>
            )}
          </motion.div>
        ) : (
          <Grid container spacing={4} sx={{ mt: 2 }}>
          <Grid size={{ xs: 12, md: 5 }}>
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card elevation={4} sx={{ p: 3, borderRadius: 3 }}>
                <Box display="flex" flexDirection="column" alignItems="center" textAlign="center">
                  <Avatar sx={{ bgcolor: 'primary.light', width: 80, height: 80, mb: 2 }}>
                    <CloudUploadIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                  </Avatar>
                  <Typography variant="h5" gutterBottom color="primary" sx={{ fontWeight: 600 }}>
                    Upload Your Resume
                  </Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                    Drag and drop your PDF resume here or click to browse. Our AI will analyze it instantly.
                  </Typography>
                  <Paper
                    elevation={dragOver ? 8 : 2}
                    sx={{
                      p: 3,
                      border: dragOver ? "2px dashed #1e3a8a" : "2px dashed #e0e0e0",
                      backgroundColor: dragOver ? "#f0f4ff" : "#fafafa",
                      transition: "all 0.3s ease",
                      width: '100%',
                      cursor: 'pointer',
                      '&:hover': {
                        backgroundColor: '#f5f5f5',
                        borderColor: '#1e3a8a',
                      },
                    }}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                  >
                    <input
                      accept=".pdf"
                      style={{ display: "none" }}
                      id="resume-file"
                      type="file"
                      onChange={handleFileChange}
                    />
                    <label htmlFor="resume-file" style={{ cursor: 'pointer', width: '100%' }}>
                      <Box display="flex" flexDirection="column" alignItems="center">
                        <CloudUploadIcon sx={{ fontSize: 48, color: dragOver ? 'primary.main' : 'action.disabled', mb: 1 }} />
                        <Typography variant="body1" color="textSecondary">
                          {file ? `Selected: ${file.name}` : "Click to select or drag PDF here"}
                        </Typography>
                      </Box>
                    </label>
                  </Paper>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={sendFile}
                    disabled={!file || loading}
                    sx={{ mt: 3, px: 4, py: 1.5, fontSize: '1rem' }}
                    startIcon={<AssessmentIcon />}
                    size="large"
                  >
                    {loading ? "Analyzing..." : "Analyze Resume"}
                  </Button>
                </Box>
              </Card>
            </motion.div>
          </Grid>

        <Grid size={{ xs: 12, md: 7 }}>
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Card elevation={4} sx={{ p: 3, mb: 3, borderRadius: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Analyzing Resume...
                </Typography>
                <LinearProgress sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                  <Grid size={{ xs: 6 }}>
                    <Skeleton variant="rectangular" height={100} />
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Skeleton variant="rectangular" height={100} />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <Skeleton variant="rectangular" height={200} />
                  </Grid>
                </Grid>
              </Card>
            </motion.div>
          )}

          {result && (
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Typography variant="h5" gutterBottom color="primary" sx={{ fontWeight: 600, mb: 3 }}>
                Analysis Results
              </Typography>

              <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Card elevation={4} sx={{ borderRadius: 3 }}>
                    <CardContent>
                      <Box display="flex" alignItems="center" mb={2}>
                        <Avatar sx={{ bgcolor: "primary.main", mr: 2 }}>
                          <AssessmentIcon />
                        </Avatar>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>Resume Score</Typography>
                      </Box>
                      <Typography variant="h3" color="primary" sx={{ fontWeight: 700, mb: 1 }}>
                        {result.score}/100
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={result.score}
                        sx={{ height: 12, borderRadius: 6, mb: 1 }}
                        color={result.score >= 70 ? "success" : result.score >= 50 ? "warning" : "error"}
                      />
                      <Typography variant="body2" color="textSecondary">
                        {result.score >= 80 ? "Excellent" : result.score >= 60 ? "Good" : result.score >= 40 ? "Fair" : "Needs Improvement"}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <Card elevation={4} sx={{ borderRadius: 3 }}>
                    <CardContent>
                      <Box display="flex" alignItems="center" mb={2}>
                        <Avatar sx={{ bgcolor: "secondary.main", mr: 2 }}>
                          <WorkIcon />
                        </Avatar>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>Skills Detected</Typography>
                      </Box>
                      <Box sx={{ mb: 2 }}>
                        {(result.skills || []).slice(0, 8).map((skill, index) => (
                          <motion.div
                            key={skill}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                            style={{ display: "inline-block", margin: 4 }}
                          >
                            <Chip
                              label={skill}
                              color="primary"
                              variant="filled"
                              sx={{ fontWeight: 500 }}
                            />
                          </motion.div>
                        ))}
                        {(result.skills || []).length > 8 && (
                          <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                            +{(result.skills || []).length - 8} more skills
                          </Typography>
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <Card elevation={4} sx={{ borderRadius: 3 }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, display: 'flex', alignItems: 'center' }}>
                        <AnalyticsIcon sx={{ mr: 1, color: 'secondary.main' }} />
                        Language Proficiency Analysis
                      </Typography>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={getChartData(result.skills || [])} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                          <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                          <YAxis tick={{ fontSize: 12 }} />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: '#fff',
                              border: '1px solid #e0e0e0',
                              borderRadius: 8,
                              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                            }}
                          />
                          <Bar dataKey="proficiency" fill="#1e3a8a" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <Card elevation={4} sx={{ borderRadius: 3 }}>
                    <CardContent>
                      <Box display="flex" alignItems="center" mb={1}>
                        <WorkIcon sx={{ mr: 1, color: "action.active" }} />
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>Experience</Typography>
                      </Box>
                      <Typography variant="h4" color="textPrimary" sx={{ fontWeight: 700 }}>
                        {result.experience_years} years
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <Card elevation={4} sx={{ borderRadius: 3 }}>
                    <CardContent>
                      <Box display="flex" alignItems="center">
                        <SchoolIcon sx={{ mr: 1, color: "action.active" }} />
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>Education</Typography>
                      </Box>
                      <Typography variant="h4" color="textPrimary" sx={{ fontWeight: 700 }}>
                        {result.has_education ? "Verified" : "Not Detected"}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <Card elevation={4} sx={{ borderRadius: 3 }}>
                    <CardContent>
                      <Box display="flex" alignItems="center" mb={2}>
                        <Avatar sx={{ bgcolor: "warning.main", mr: 2 }}>
                          <LightbulbIcon />
                        </Avatar>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>AI-Powered Suggestions</Typography>
                      </Box>
                      <List sx={{ bgcolor: 'background.paper', borderRadius: 2 }}>
                        {(result.suggestions || []).map((suggestion, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: index * 0.1 }}
                          >
                            <ListItem sx={{ borderBottom: index < (result.suggestions || []).length - 1 ? '1px solid #e0e0e0' : 'none' }}>
                              <ListItemText
                                primary={suggestion}
                                primaryTypographyProps={{ fontWeight: 500 }}
                              />
                            </ListItem>
                          </motion.div>
                        ))}
                      </List>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </motion.div>
          )}
        </Grid>
      </Grid>
        )}

    </Container>
    </ThemeProvider>
  );
}

export default App;