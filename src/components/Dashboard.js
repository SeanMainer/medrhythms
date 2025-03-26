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
} from "@mui/material";
import {
  CloudDownload as DownloadIcon,
  DataObject as JsonIcon,
  TableChart as CsvIcon,
} from "@mui/icons-material";
import { exportService, dashboardService } from "../services/api";
import moment from "moment";

function Dashboard() {
  const [timeRange, setTimeRange] = useState("6m"); // 默认显示6个月
  const [isLoading, setIsLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [exportError, setExportError] = useState(null);
  const [exportSuccess, setExportSuccess] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [chartError, setChartError] = useState(null);
  const canvasRef = useRef(null);

  // 备用模拟数据 - 当API请求失败时使用
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

  // 处理数据导出
  const handleExportJson = async () => {
    try {
      setExportLoading(true);
      setExportError(null);
      await exportService.exportAsJson();
      setExportSuccess("Database exported successfully as JSON");
      // 5秒后自动清除成功消息
      setTimeout(() => setExportSuccess(null), 5000);
    } catch (error) {
      setExportError(error.message || "Failed to export database");
      // 5秒后自动清除错误消息
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
      // 5秒后自动清除成功消息
      setTimeout(() => setExportSuccess(null), 5000);
    } catch (error) {
      setExportError(error.message || "Failed to export database");
      // 5秒后自动清除错误消息
      setTimeout(() => setExportError(null), 5000);
    } finally {
      setExportLoading(false);
    }
  };

  // 从API获取废弃率数据
  const fetchDiscardRateData = async (months) => {
    try {
      setIsLoading(true);
      setChartError(null);

      const data = await dashboardService.getDiscardRate(months);
      console.log("获取到的废弃率数据:", data);

      // 处理API返回的数据格式
      const formattedData = data.map((item) => {
        const date = moment(item.month, "YYYY-MM");
        return {
          month: date.format("MMM"), // 转换为简短月份名称，如Jan, Feb
          year: date.format("YYYY"),
          rate: item.rate,
          used: item.used,
          scrapped: item.scrapped,
        };
      });

      setChartData(formattedData);
    } catch (error) {
      console.error("获取废弃率数据失败:", error);
      setChartError(error.message || "Failed to fetch discard rate data");

      // 如果API请求失败，使用模拟数据
      console.log("使用模拟数据作为备用");

      // 根据timeRange选择对应的模拟数据
      let monthsNumber = 6;
      if (timeRange === "3m") monthsNumber = 3;
      if (timeRange === "12m") monthsNumber = 12;

      // 使用模拟数据
      setChartData(mockData[timeRange]);
    } finally {
      setIsLoading(false);
    }
  };

  // 统计信息
  const getStats = (data) => {
    if (!data || data.length === 0) {
      return {
        avgRate: "0.0",
        maxRate: "0.0",
        minRate: "0.0",
        trend: "0.0",
      };
    }

    const rates = data.map((item) => item.rate);
    const avgRate = rates.reduce((acc, val) => acc + val, 0) / rates.length;
    const maxRate = Math.max(...rates);
    const minRate = Math.min(...rates);

    // 计算趋势（与上一个时间段相比）
    const firstHalf = data.slice(0, Math.floor(data.length / 2));
    const secondHalf = data.slice(Math.floor(data.length / 2));
    const firstHalfAvg =
      firstHalf.reduce((acc, val) => acc + val.rate, 0) / firstHalf.length;
    const secondHalfAvg =
      secondHalf.reduce((acc, val) => acc + val.rate, 0) / secondHalf.length;
    const trend = secondHalfAvg - firstHalfAvg;

    return {
      avgRate: avgRate.toFixed(1),
      maxRate: maxRate.toFixed(1),
      minRate: minRate.toFixed(1),
      trend: trend.toFixed(1),
    };
  };

  const renderChart = () => {
    const canvas = canvasRef.current;
    if (!canvas || !chartData || chartData.length === 0) return;

    const ctx = canvas.getContext("2d");
    const data = chartData;

    // 设置画布大小
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 图表参数
    const padding = 40;
    const chartWidth = canvas.width - 2 * padding;
    const chartHeight = canvas.height - 2 * padding;
    const barWidth = (chartWidth / data.length) * 0.6;
    const barSpacing = (chartWidth / data.length) * 0.4;

    // Y轴最大值（向上取整到下一个整数)
    const maxRate = Math.ceil(Math.max(...data.map((item) => item.rate)));
    const yAxisMax = Math.max(maxRate + 1, 6); // 至少到6%

    // 绘制X轴和Y轴
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, canvas.height - padding);
    ctx.lineTo(canvas.width - padding, canvas.height - padding);
    ctx.strokeStyle = "#ccc";
    ctx.stroke();

    // 绘制Y轴刻度
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#666";
    // 修改：只在0%, 10%, 20%...处显示标签，但保持一定的网格线密度
    const yAxisStep = 10; // 标签步长改为10%
    const gridStep = 2; // 网格线步长为2%

    // 先绘制所有网格线
    for (let i = 0; i <= yAxisMax; i += gridStep) {
      const y = canvas.height - padding - (i / yAxisMax) * chartHeight;

      // 绘制网格线
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(canvas.width - padding, y);
      ctx.strokeStyle = "#eee";
      ctx.stroke();
    }

    // 再绘制主要刻度和标签
    for (let i = 0; i <= yAxisMax; i += yAxisStep) {
      const y = canvas.height - padding - (i / yAxisMax) * chartHeight;

      // 绘制刻度线
      ctx.beginPath();
      ctx.moveTo(padding - 5, y);
      ctx.lineTo(padding, y);
      ctx.strokeStyle = "#ccc";
      ctx.stroke();

      // 添加标签
      ctx.fillText(`${i}%`, padding - 10, y);
    }

    ctx.strokeStyle = "#ccc";

    // 绘制条形图和X轴标签
    ctx.textAlign = "center";
    ctx.textBaseline = "top";

    data.forEach((item, index) => {
      const x = padding + index * (barWidth + barSpacing) + barSpacing / 2;
      const barHeight = (item.rate / yAxisMax) * chartHeight;
      const y = canvas.height - padding - barHeight;

      // 条形图
      ctx.fillStyle = "#3f51b5";
      ctx.fillRect(x, y, barWidth, barHeight);

      // 数据值
      ctx.fillStyle = "#000";
      ctx.fillText(`${item.rate}%`, x + barWidth / 2, y - 20);

      // X轴标签
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

    // 添加标题
    ctx.textAlign = "center";
    ctx.fillStyle = "#333";
    ctx.font = "bold 16px Arial";
    ctx.fillText("Component Discard Rate", canvas.width / 2, 15);
  };

  useEffect(() => {
    // 从时间范围获取月份数
    let months = 6;
    if (timeRange === "3m") months = 3;
    if (timeRange === "12m") months = 12;

    // 调用API获取数据
    fetchDiscardRateData(months);
  }, [timeRange]);

  // 当数据加载完成或改变时重新渲染图表
  useEffect(() => {
    if (chartData && !isLoading) {
      renderChart();
    }
  }, [chartData, isLoading]);

  // 当窗口大小改变时重新渲染图表
  useEffect(() => {
    const handleResize = () => {
      if (chartData) {
        renderChart();
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [chartData]);

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
        Dashboard
      </Typography>

      <Grid container spacing={3}>
        {/* 数据导出卡片 */}
        <Grid item xs={12}>
          <Card sx={{ p: 3, mb: 3 }}>
            <Typography variant="h5" gutterBottom>
              Database Export
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Export the complete database in JSON or CSV format. CSV export
              will be delivered as a ZIP file containing multiple CSV files.
            </Typography>

            <Stack direction="row" spacing={2}>
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

        {/* 统计卡片 */}
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

            {/* 统计指标 */}
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
                        Highest Monthly Rate
                      </Typography>
                      <Typography variant="h4" sx={{ fontWeight: "medium" }}>
                        {chartData && getStats(chartData).maxRate}%
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

            {/* 图表 */}
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
