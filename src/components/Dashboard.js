/** @format */

import { useState, useEffect, useRef } from "react";
import {
  Box,
  Typography,
  Card,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Paper,
  Button,
  Tooltip,
  Alert,
  Stack,
  CircularProgress,
  Snackbar,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import {
  CloudDownload as DownloadIcon,
  DataObject as JsonIcon,
  TableChart as CsvIcon,
  CloudUpload as UploadIcon,
} from "@mui/icons-material";
import { exportService, dashboardService } from "../services/api";
import moment from "moment";

function Dashboard() {
  const [timeRange, setTimeRange] = useState("6m"); // Default to show 6 months
  const [isLoading, setIsLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [exportError, setExportError] = useState(null);
  const [exportSuccess, setExportSuccess] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [chartError, setChartError] = useState(null);
  const canvasRef = useRef(null);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importLoading, setImportLoading] = useState(false);
  const [importError, setImportError] = useState(null);
  const [importSuccess, setImportSuccess] = useState(null);
  const fileInputRef = useRef(null);

  // Fallback mock data - used when API request fails
  const mockData = {
    "12m": [
      { month: "Apr", year: "2023", rate: 4.2 },
      { month: "May", year: "2023", rate: 3.8 },
      { month: "Jun", year: "2023", rate: 3.5 },
      { month: "Jul", year: "2023", rate: 4.1 },
      { month: "Aug", year: "2023", rate: 5.2 },
      { month: "Sep", year: "2023", rate: 5.7 },
      { month: "Oct", year: "2023", rate: 4.8 },
      { month: "Nov", year: "2023", rate: 3.9 },
      { month: "Dec", year: "2023", rate: 3.2 },
      { month: "Jan", year: "2024", rate: 2.8 },
      { month: "Feb", year: "2024", rate: 3.1 },
      { month: "Mar", year: "2024", rate: 3.4 },
    ],
    "6m": [
      { month: "Oct", year: "2023", rate: 4.8 },
      { month: "Nov", year: "2023", rate: 3.9 },
      { month: "Dec", year: "2023", rate: 3.2 },
      { month: "Jan", year: "2024", rate: 2.8 },
      { month: "Feb", year: "2024", rate: 3.1 },
      { month: "Mar", year: "2024", rate: 3.4 },
    ],
    "3m": [
      { month: "Jan", year: "2024", rate: 2.8 },
      { month: "Feb", year: "2024", rate: 3.1 },
      { month: "Mar", year: "2024", rate: 3.4 },
    ],
  };

  // Handle data export
  const handleExportJson = async () => {
    try {
      setExportLoading(true);
      setExportError(null);
      await exportService.exportAsJson();
      setExportSuccess("Database exported successfully as JSON");
      // Auto clear success message after 5 seconds
      setTimeout(() => setExportSuccess(null), 5000);
    } catch (error) {
      setExportError(error.message || "Failed to export database");
      // Auto clear error message after 5 seconds
      setTimeout(() => setExportError(null), 5000);
    } finally {
      setExportLoading(false);
    }
  };

  const handleExportCsv = async () => {
    try {
      setExportLoading(true);
      setExportError(null);
      await exportService.exportAsCsv();
      setExportSuccess("Database exported successfully as CSV");
      // Auto clear success message after 5 seconds
      setTimeout(() => setExportSuccess(null), 5000);
    } catch (error) {
      setExportError(error.message || "Failed to export database");
      // Auto clear error message after 5 seconds
      setTimeout(() => setExportError(null), 5000);
    } finally {
      setExportLoading(false);
    }
  };

  // Fetch discard rate data from API
  const fetchDiscardRateData = async (months) => {
    try {
      setIsLoading(true);
      setChartError(null);

      const data = await dashboardService.getDiscardRate(months);
      console.log("获取到的废弃率数据:", data);

      // Process API response data format
      const formattedData = data.map((item) => {
        const date = moment(item.month, "YYYY-MM");
        return {
          month: date.format("MMM"), // Convert to short month name, e.g. Jan, Feb
          year: date.format("YYYY"),
          rate: item.rate,
          used: item.used,
          scrapped: item.scrapped,
        };
      });

      setChartData(formattedData);
    } catch (error) {
      console.error("Failed to fetch data:", error);
      setChartError(error.message || "Failed to fetch discard rate data");

      // If API request fails, use mock data
      console.log("Using mock data as fallback");

      // Select corresponding mock data based on timeRange
      let monthsNumber = 6;
      if (timeRange === "3m") monthsNumber = 3;
      if (timeRange === "12m") monthsNumber = 12;

      // Use mock data
      setChartData(mockData[timeRange]);
    } finally {
      setIsLoading(false);
    }
  };

  // Statistics information
  const getStats = (data) => {
    if (!data || data.length === 0) {
      return {
        avgRate: "0.0",
        currentRate: "0.0",
        minRate: "0.0",
        trend: "0.0",
      };
    }

    const rates = data.map((item) => item.rate);
    const avgRate = rates.reduce((acc, val) => acc + val, 0) / rates.length;
    const minRate = Math.min(...rates);

    // Get current month's discard rate
    const currentMonth = moment().format("MMM");
    const currentYear = moment().format("YYYY");
    const currentMonthData = data.find(
      (item) => item.month === currentMonth && item.year === currentYear
    );
    const currentRate = currentMonthData ? currentMonthData.rate : "0.0";

    // Calculate trend (compared to previous time period)
    const firstHalf = data.slice(0, Math.floor(data.length / 2));
    const secondHalf = data.slice(Math.floor(data.length / 2));
    const firstHalfAvg =
      firstHalf.reduce((acc, val) => acc + val.rate, 0) / firstHalf.length;
    const secondHalfAvg =
      secondHalf.reduce((acc, val) => acc + val.rate, 0) / secondHalf.length;
    const trend = secondHalfAvg - firstHalfAvg;

    return {
      avgRate: avgRate.toFixed(1),
      currentRate: currentRate.toFixed(1),
      minRate: minRate.toFixed(1),
      trend: trend.toFixed(1),
    };
  };

  const renderChart = () => {
    const canvas = canvasRef.current;
    if (!canvas || !chartData || chartData.length === 0) return;

    const ctx = canvas.getContext("2d");
    const data = chartData;

    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Chart parameters
    const padding = 40;
    const chartWidth = canvas.width - 2 * padding;
    const chartHeight = canvas.height - 2 * padding;
    const barWidth = (chartWidth / data.length) * 0.6;
    const barSpacing = (chartWidth / data.length) * 0.4;

    // Y-axis maximum value (rounded up to next integer)
    const maxRate = Math.ceil(Math.max(...data.map((item) => item.rate)));
    const yAxisMax = Math.max(maxRate + 1, 6); // At least up to 6%

    // Draw X and Y axes
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, canvas.height - padding);
    ctx.lineTo(canvas.width - padding, canvas.height - padding);
    ctx.strokeStyle = "#ccc";
    ctx.stroke();

    // Draw Y-axis scale
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#666";
    // Modified: Only show labels at 0%, 10%, 20%... but maintain grid line density
    const yAxisStep = 10; // Label step changed to 10%
    const gridStep = 2; // Grid line step is 2%

    // Draw all grid lines first
    for (let i = 0; i <= yAxisMax; i += gridStep) {
      const y = canvas.height - padding - (i / yAxisMax) * chartHeight;

      // Draw grid line
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(canvas.width - padding, y);
      ctx.strokeStyle = "#eee";
      ctx.stroke();
    }

    // Then draw main scale and labels
    for (let i = 0; i <= yAxisMax; i += yAxisStep) {
      const y = canvas.height - padding - (i / yAxisMax) * chartHeight;

      // Draw scale line
      ctx.beginPath();
      ctx.moveTo(padding - 5, y);
      ctx.lineTo(padding, y);
      ctx.strokeStyle = "#ccc";
      ctx.stroke();

      // Add label
      ctx.fillText(`${i}%`, padding - 10, y);
    }

    ctx.strokeStyle = "#ccc";

    // Draw bar chart and X-axis labels
    ctx.textAlign = "center";
    ctx.textBaseline = "top";

    data.forEach((item, index) => {
      const x = padding + index * (barWidth + barSpacing) + barSpacing / 2;
      const barHeight = (item.rate / yAxisMax) * chartHeight;
      const y = canvas.height - padding - barHeight;

      // Bar chart
      ctx.fillStyle = "#3f51b5";
      ctx.fillRect(x, y, barWidth, barHeight);

      // Data value
      ctx.fillStyle = "#000";
      ctx.fillText(`${item.rate}%`, x + barWidth / 2, y - 20);

      // X-axis label
      ctx.fillText(
        `${item.month}`,
        x + barWidth / 2,
        canvas.height - padding + 10
      );
      ctx.fillText(
        `${item.year}`,
        x + barWidth / 2,
        canvas.height - padding + 30
      );
    });

    // Add title
    ctx.textAlign = "center";
    ctx.fillStyle = "#333";
    ctx.font = "bold 16px Arial";
    ctx.fillText("Component Discard Rate", canvas.width / 2, 15);
  };

  useEffect(() => {
    // Get number of months from time range
    let months = 6;
    if (timeRange === "3m") months = 3;
    if (timeRange === "12m") months = 12;

    // Call API to fetch data
    fetchDiscardRateData(months);
  }, [timeRange]);

  // Re-render chart when data loading is complete or data changes
  useEffect(() => {
    if (chartData && !isLoading) {
      renderChart();
    }
  }, [chartData, isLoading]);

  // Re-render chart when window size changes
  useEffect(() => {
    const handleResize = () => {
      if (chartData) {
        renderChart();
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [chartData]);

  const handleImportClick = () => {
    setImportDialogOpen(true);
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImportFile(file);
    }
  };

  const handleImportConfirm = async () => {
    if (!importFile) {
      setImportError("Please select a file to import");
      return;
    }

    try {
      setImportLoading(true);
      setImportError(null);
      await exportService.importData(importFile);
      setImportSuccess("Data imported successfully");
      setImportDialogOpen(false);
      setImportFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      setImportError(error.message || "Failed to import data");
    } finally {
      setImportLoading(false);
    }
  };

  const handleImportCancel = () => {
    setImportDialogOpen(false);
    setImportFile(null);
    setImportError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleExport = async () => {
    try {
      setExportLoading(true);
      setExportError(null);
      await exportService.exportAsJson();
      setExportSuccess("Data exported successfully");
    } catch (error) {
      setExportError(error.message || "Failed to export data");
    } finally {
      setExportLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
        Dashboard
      </Typography>

      <Grid container spacing={3}>
        {/* Database Management Cards */}
        <Grid item xs={12}>
          <Card sx={{ p: 3, mb: 3 }}>
            <Typography variant="h5" gutterBottom>
              Database Import/Export
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Import and export database data. Import only supports JSON format.
              Please ensure the data format matches the system requirements.
            </Typography>

            <Stack direction="row" spacing={2}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<UploadIcon />}
                onClick={handleImportClick}
              >
                Import Data
              </Button>
              <Button
                variant="contained"
                color="primary"
                startIcon={<JsonIcon />}
                onClick={handleExportJson}
                disabled={exportLoading}
              >
                {exportLoading ? (
                  <CircularProgress size={24} />
                ) : (
                  "Export as JSON"
                )}
              </Button>
              <Button
                variant="contained"
                color="secondary"
                startIcon={<CsvIcon />}
                onClick={handleExportCsv}
                disabled={exportLoading}
              >
                {exportLoading ? (
                  <CircularProgress size={24} />
                ) : (
                  "Export as CSV"
                )}
              </Button>
            </Stack>

            {exportError && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {exportError}
              </Alert>
            )}

            {exportSuccess && (
              <Alert severity="success" sx={{ mt: 2 }}>
                {exportSuccess}
              </Alert>
            )}
          </Card>
        </Grid>

        {/* Import Data Dialog */}
        <Dialog
          open={importDialogOpen}
          onClose={handleImportCancel}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Import Database Data</DialogTitle>
          <DialogContent>
            <DialogContentText sx={{ mb: 2 }}>
              <Alert severity="warning" sx={{ mb: 2 }}>
                Warning: Importing data will update existing records in the
                database. Please ensure the data is accurate before proceeding.
              </Alert>
              Please select a JSON file containing the database data to import.
              The file must follow the system's data structure requirements.
            </DialogContentText>
            <input
              type="file"
              accept=".json"
              onChange={handleFileChange}
              ref={fileInputRef}
              style={{ display: "none" }}
            />
            <Button
              variant="outlined"
              component="span"
              onClick={() => fileInputRef.current?.click()}
              startIcon={<UploadIcon />}
              fullWidth
            >
              {importFile ? importFile.name : "Select File"}
            </Button>
            {importError && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {importError}
              </Alert>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleImportCancel} disabled={importLoading}>
              Cancel
            </Button>
            <Button
              onClick={handleImportConfirm}
              variant="contained"
              disabled={!importFile || importLoading}
              startIcon={importLoading ? <CircularProgress size={20} /> : null}
            >
              {importLoading ? "Importing..." : "Import"}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Import Successful Prompt */}
        <Snackbar
          open={!!importSuccess}
          autoHideDuration={6000}
          onClose={() => setImportSuccess(null)}
        >
          <Alert severity="success" onClose={() => setImportSuccess(null)}>
            {importSuccess}
          </Alert>
        </Snackbar>

        {/* Statistics Card */}
        <Grid item xs={12} md={12}>
          <Card sx={{ p: 3, mb: 3 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 3,
              }}
            >
              <Typography variant="h5">
                Components Scrapped Rate Analysis
              </Typography>
              <FormControl sx={{ minWidth: 150 }}>
                <InputLabel id="time-range-label">Time Range</InputLabel>
                <Select
                  labelId="time-range-label"
                  id="time-range-select"
                  value={timeRange}
                  label="Time Range"
                  onChange={(e) => setTimeRange(e.target.value)}
                >
                  <MenuItem value="3m">Last 3 Months</MenuItem>
                  <MenuItem value="6m">Last 6 Months</MenuItem>
                  <MenuItem value="12m">Last 12 Months</MenuItem>
                </Select>
              </FormControl>
            </Box>

            {chartError && (
              <Alert severity="warning" sx={{ mb: 2 }}>
                {chartError}
                <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                  Displaying mock data as a fallback.
                </Typography>
              </Alert>
            )}

            <Grid container spacing={3} sx={{ mb: 3 }}>
              {isLoading ? (
                <Grid item xs={12}>
                  <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
                    <CircularProgress />
                    <Typography sx={{ ml: 2 }}>Loading data...</Typography>
                  </Box>
                </Grid>
              ) : (
                <>
                  <Grid item xs={12} sm={4}>
                    <Paper elevation={1} sx={{ p: 2, textAlign: "center" }}>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        gutterBottom
                      >
                        Average Scrapped Rate
                      </Typography>
                      <Typography variant="h4" sx={{ fontWeight: "medium" }}>
                        {chartData && getStats(chartData).avgRate}%
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Paper elevation={1} sx={{ p: 2, textAlign: "center" }}>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        gutterBottom
                      >
                        Current Month Rate
                      </Typography>
                      <Typography variant="h4" sx={{ fontWeight: "medium" }}>
                        {chartData && getStats(chartData).currentRate}%
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Paper elevation={1} sx={{ p: 2, textAlign: "center" }}>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        gutterBottom
                      >
                        Trend
                      </Typography>
                      {chartData && (
                        <Typography
                          variant="h4"
                          sx={{
                            fontWeight: "medium",
                            color:
                              parseFloat(getStats(chartData).trend) < 0
                                ? "success.main"
                                : "error.main",
                          }}
                        >
                          {parseFloat(getStats(chartData).trend) < 0
                            ? "↓"
                            : "↑"}
                          {Math.abs(parseFloat(getStats(chartData).trend))}%
                        </Typography>
                      )}
                    </Paper>
                  </Grid>
                </>
              )}
            </Grid>

            {/* graphs */}
            <Box sx={{ width: "100%", height: 400, position: "relative" }}>
              <canvas
                ref={canvasRef}
                style={{ width: "100%", height: "100%" }}
              />
              {isLoading && (
                <Box
                  sx={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor: "rgba(255, 255, 255, 0.7)",
                  }}
                >
                  <CircularProgress />
                  <Typography variant="h6" sx={{ ml: 2 }}>
                    Loading chart data...
                  </Typography>
                </Box>
              )}
            </Box>

            <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Note: Discard rate represents the percentage of components that
                failed quality checks or were damaged during handling.
              </Typography>
            </Box>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Dashboard;
