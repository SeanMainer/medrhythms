/** @format */

import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  Grid,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Alert,
  Snackbar,
  Stack,
  Tabs,
  Tab,
  TextField,
  Paper,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TablePagination,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import {
  Headphones,
  Sensors,
  PhoneAndroid,
  SimCard,
  CheckCircle,
  Build as BuildIcon,
  Sync as SyncIcon,
  Block as BlockIcon,
  Settings as SettingsIcon,
  Search as SearchIcon,
  History as HistoryIcon,
  Inventory as BoxIcon,
} from "@mui/icons-material";
import { kitService } from "../services/api";
import moment from "moment";

// TabPanel component for tabs
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`components-tabpanel-${index}`}
      aria-labelledby={`components-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

function CreateKit() {
  const [tabValue, setTabValue] = useState(0);
  const [selectedComponents, setSelectedComponents] = useState({
    headphone: null,
    leftSensor: null,
    rightSensor: null,
    phone: null,
    simCard: null,
    box: null,
  });
  const [components, setComponents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [showAllComponents, setShowAllComponents] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [selectedComponent, setSelectedComponent] = useState(null);

  // Batch query states
  const [batchNumber, setBatchNumber] = useState("");
  const [batchResults, setBatchResults] = useState([]);
  const [batchLoading, setBatchLoading] = useState(false);
  const [batchError, setBatchError] = useState(null);
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  // Usage history states
  const [usageDialogOpen, setUsageDialogOpen] = useState(false);
  const [usageHistory, setUsageHistory] = useState([]);
  const [usageLoading, setUsageLoading] = useState(false);
  const [selectedComponentId, setSelectedComponentId] = useState(null);

  // Pagination states
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // Load components when component mounts
  useEffect(() => {
    fetchComponents();
  }, []);

  const fetchComponents = async () => {
    try {
      setLoading(true);
      const data = await kitService.getAllComponents();
      setComponents(data);
      // Initialize batch results with all components for the batch query tab
      setBatchResults(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    // Reset batch search field when switching to batch query tab
    if (newValue === 1) {
      setBatchNumber("");
      setFilterType("all");
      setFilterStatus("all");
      setBatchResults(components);
      setBatchError(null);
      // Reset pagination
      setPage(0);
    }
  };

  // Filter components by batch number
  const handleBatchQuery = () => {
    let filtered = [...components];

    // Filter by batch number if provided
    if (batchNumber.trim()) {
      filtered = filtered.filter(
        (component) =>
          component.batch_number &&
          component.batch_number
            .toLowerCase()
            .includes(batchNumber.toLowerCase())
      );
    }

    // Filter by component type
    if (filterType !== "all") {
      filtered = filtered.filter((component) => {
        // Convert frontend type (e.g., "leftSensor") to backend type (e.g., "LeftSensor")
        const frontendToBackendType = {
          phone: "phone",
          simCard: "simCard",
          rightSensor: "rightSensor",
          leftSensor: "leftSensor",
          headphone: "headphone",
          box: "box",
        };
        return (
          component.type &&
          component.type.toLowerCase() ===
            frontendToBackendType[filterType].toLowerCase()
        );
      });
    }

    // Filter by status
    if (filterStatus !== "all") {
      filtered = filtered.filter(
        (component) =>
          component.status &&
          component.status.toLowerCase() === filterStatus.toLowerCase()
      );
    }

    setBatchResults(filtered);
    // Reset to first page when applying filters
    setPage(0);

    if (filtered.length === 0) {
      setBatchError("No components found with the selected filters");
    } else {
      setBatchError(null);
    }
  };

  // Reset all filters
  const handleResetFilters = () => {
    setBatchNumber("");
    setFilterType("all");
    setFilterStatus("all");
    setBatchResults(components);
    setBatchError(null);
    // Reset pagination when clearing filters
    setPage(0);
  };

  // Fetch usage history for a component
  const handleViewUsageHistory = async (componentId) => {
    setSelectedComponentId(componentId);
    try {
      setUsageLoading(true);
      const result = await kitService.getComponentUsageHistory(componentId);
      setUsageHistory(Array.isArray(result) ? result : []);
      setUsageDialogOpen(true);
    } catch (error) {
      // Instead of setting an error, just show the dialog with empty history
      console.error(`Error fetching usage history: ${error.message}`);
      setUsageHistory([]);
      setUsageDialogOpen(true);
    } finally {
      setUsageLoading(false);
    }
  };

  const componentIcons = {
    headphone: <Headphones />,
    leftSensor: <Sensors />,
    rightSensor: <Sensors />,
    phone: <PhoneAndroid />,
    simCard: <SimCard />,
    box: <BoxIcon />,
  };

  const componentLabels = {
    headphone: "Headphone",
    leftSensor: "Left Sensor",
    rightSensor: "Right Sensor",
    phone: "Phone",
    simCard: "SIM Card",
    box: "Box",
  };

  const filteredComponents = showAllComponents
    ? components
    : components.filter((comp) =>
        ["available", "in-kit", "refurbishing"].includes(comp.status)
      );

  const handleStatusChange = async (component, newStatus) => {
    try {
      setLoading(true);
      await kitService.updateComponentStatus(component.id, newStatus);
      await fetchComponents();
      setSuccessMessage("Component status updated successfully");
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
      setStatusDialogOpen(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "available":
        return "success.main";
      case "in-kit":
        return "info.main";
      case "refurbishing":
        return "warning.main";
      case "scrapped":
        return "text.disabled";
      default:
        return "text.primary";
    }
  };

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case "available":
        return <CheckCircle sx={{ mr: 1 }} />;
      case "in-kit":
        return <BuildIcon sx={{ mr: 1 }} />;
      case "refurbishing":
        return <SyncIcon sx={{ mr: 1 }} />;
      case "scrapped":
        return <BlockIcon sx={{ mr: 1 }} />;
      default:
        return null;
    }
  };

  const columns = [
    { field: "id", headerName: "ID", flex: 1 },
    { field: "batch_number", headerName: "Batch Number", flex: 1 },
    {
      field: "type",
      headerName: "Type",
      flex: 1,
      renderCell: (params) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {componentIcons[params.value]}
          {componentLabels[params.value]}
        </Box>
      ),
    },
    {
      field: "status",
      headerName: "Status",
      flex: 1,
      renderCell: (params) => {
        const status = params.value;
        return (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              color: getStatusColor(status),
            }}
          >
            {getStatusIcon(status)}
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Box>
        );
      },
    },
    {
      field: "created_at",
      headerName: "Create Time",
      flex: 1,
      valueFormatter: (params) => {
        if (!params) return "-";
        try {
          return moment(params).format("YYYY-MM-DD HH:mm:ss");
        } catch (error) {
          console.error("Date parsing error:", error);
          return params.value;
        }
      },
    },
    {
      field: "actions",
      headerName: "Actions",
      flex: 1,
      renderCell: (params) => (
        <Button
          size="small"
          variant="outlined"
          startIcon={<SettingsIcon />}
          onClick={() => {
            setSelectedComponent(params.row);
            setStatusDialogOpen(true);
          }}
          sx={{
            minWidth: 100,
            borderRadius: 1,
          }}
        >
          Change
        </Button>
      ),
    },
  ];

  const handleCreateKit = async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await kitService.createKit(selectedComponents);

      if (result.message === "Kit created successfully") {
        setSuccessMessage(`Kit created successfully with ID: ${result.kit_ID}`);
        // Reset selections
        setSelectedComponents({
          headphone: null,
          leftSensor: null,
          rightSensor: null,
          phone: null,
          simCard: null,
          box: null,
        });
      } else if (result.unavailable_components) {
        setError(
          `Some components are not available: ${result.unavailable_components
            .map((c) => c.component_id)
            .join(", ")}`
        );
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateTimeStr) => {
    if (!dateTimeStr) return "N/A";
    return moment(dateTimeStr).format("YYYY-MM-DD HH:mm:ss");
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Components Management
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="components tabs"
        >
          <Tab
            label="Create Kit"
            id="components-tab-0"
            aria-controls="components-tabpanel-0"
          />
          <Tab
            label="Batch Query"
            id="components-tab-1"
            aria-controls="components-tabpanel-1"
          />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        <Card sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Selected Components
          </Typography>
          <Grid container spacing={2}>
            {Object.entries(componentLabels).map(([type, label]) => (
              <Grid item xs={12} sm={6} md={4} key={type}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    p: 2,
                    border: 1,
                    borderColor: selectedComponents[type]
                      ? "primary.main"
                      : "divider",
                    borderRadius: 1,
                    bgcolor: selectedComponents[type]
                      ? "primary.light"
                      : "transparent",
                  }}
                >
                  {componentIcons[type]}
                  <Typography
                    color={selectedComponents[type] ? "white" : "inherit"}
                  >
                    {label}:
                  </Typography>
                  {selectedComponents[type] ? (
                    <Chip
                      label={selectedComponents[type]?.id || ""}
                      color="primary"
                      icon={<CheckCircle />}
                      sx={{
                        bgcolor: "white",
                        "& .MuiChip-label": {
                          color: "primary.main",
                        },
                      }}
                    />
                  ) : (
                    <Typography
                      color="text.secondary"
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 0.5,
                      }}
                    >
                      Not Selected
                    </Typography>
                  )}
                </Box>
              </Grid>
            ))}
          </Grid>

          <Button
            variant="contained"
            color="primary"
            sx={{ mt: 3 }}
            onClick={handleCreateKit}
            disabled={
              Object.values(selectedComponents).some((comp) => comp === null) ||
              loading
            }
          >
            {loading ? "Creating..." : "Create Kit"}
          </Button>
        </Card>

        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
          <Typography variant="h6">Available Components</Typography>
          <Button
            variant="outlined"
            onClick={() => setShowAllComponents(!showAllComponents)}
          >
            {showAllComponents ? "Show Default" : "Show All"}
          </Button>
        </Box>
        <DataGrid
          rows={filteredComponents}
          columns={columns}
          pageSize={5}
          rowsPerPageOptions={[5]}
          checkboxSelection
          loading={loading}
          isRowSelectable={(params) => {
            // Only allow selection of available components
            if (params.row.status !== "available") {
              return false;
            }

            // Check if any component of the same type is already selected
            const sameTypeSelected = Object.values(selectedComponents)
              .filter(Boolean)
              .some(
                (comp) =>
                  comp.type === params.row.type && comp.id !== params.row.id
              );

            return !sameTypeSelected;
          }}
          onRowSelectionModelChange={(newSelectionModel) => {
            // Get all selected rows data
            const selectedRows = components.filter((row) =>
              newSelectionModel.includes(row.id)
            );

            // Update selected components
            const newSelectedComponents = { ...selectedComponents };

            // Handle unselection
            Object.keys(selectedComponents).forEach((type) => {
              if (
                selectedComponents[type] &&
                !newSelectionModel.includes(selectedComponents[type].id)
              ) {
                newSelectedComponents[type] = null;
              }
            });

            // Handle new selections
            selectedRows.forEach((row) => {
              newSelectedComponents[row.type] = row;
            });

            setSelectedComponents(newSelectedComponents);
          }}
          selectionModel={Object.values(selectedComponents)
            .filter(Boolean)
            .map((component) => component.id)}
          sx={{
            "& .MuiDataGrid-cell:focus": {
              outline: "none",
            },
            "& .MuiDataGrid-row.Mui-disabled": {
              opacity: 0.6,
              backgroundColor: "#f5f5f5",
              pointerEvents: "none",
            },
            height: 400,
          }}
        />
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <Card sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Components Inventory
          </Typography>

          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} md={4}>
              <TextField
                label="Filter by Batch Number"
                value={batchNumber}
                onChange={(e) => setBatchNumber(e.target.value)}
                variant="outlined"
                placeholder="Enter batch number to filter"
                fullWidth
              />
            </Grid>

            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Component Type</InputLabel>
                <Select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  label="Component Type"
                >
                  <MenuItem value="all">All Types</MenuItem>
                  {Object.entries(componentLabels).map(([type, label]) => (
                    <MenuItem key={type} value={type}>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        {componentIcons[type]}
                        {label}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  label="Status"
                >
                  <MenuItem value="all">All Statuses</MenuItem>
                  {["available", "in-kit", "refurbishing", "scrapped"].map(
                    (status) => (
                      <MenuItem key={status} value={status}>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            color: getStatusColor(status),
                          }}
                        >
                          {getStatusIcon(status)}
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </Box>
                      </MenuItem>
                    )
                  )}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={2}>
              <Box sx={{ display: "flex", gap: 1, height: "100%" }}>
                <Button
                  variant="contained"
                  startIcon={<SearchIcon />}
                  onClick={handleBatchQuery}
                  disabled={batchLoading}
                  sx={{ flexGrow: 1 }}
                >
                  {batchLoading ? <CircularProgress size={24} /> : "Apply"}
                </Button>
                <Button
                  variant="outlined"
                  onClick={handleResetFilters}
                  disabled={batchLoading}
                >
                  Reset
                </Button>
              </Box>
            </Grid>
          </Grid>

          {batchError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {batchError}
            </Alert>
          )}

          <Box sx={{ mt: 2 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
              }}
            >
              <Typography variant="subtitle1">
                {batchNumber.trim() ||
                filterType !== "all" ||
                filterStatus !== "all"
                  ? `Filtered Results: ${batchResults.length} components found`
                  : `Showing all ${batchResults.length} components`}
              </Typography>
            </Box>
            <TableContainer component={Paper} sx={{ maxHeight: 500 }}>
              <Table stickyHeader sx={{ minWidth: 700 }}>
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Batch Number</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Created At</TableCell>
                    <TableCell>Kit ID</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {batchResults
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((component) => (
                      <TableRow key={component.id}>
                        <TableCell>{component.id}</TableCell>
                        <TableCell>{component.batch_number || "N/A"}</TableCell>
                        <TableCell>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            {component.type &&
                              componentIcons[component.type.toLowerCase()]}
                            {componentLabels[component.type] || component.type}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              color: getStatusColor(component.status),
                            }}
                          >
                            {getStatusIcon(component.status)}
                            {component.status.charAt(0).toUpperCase() +
                              component.status.slice(1)}
                          </Box>
                        </TableCell>
                        <TableCell>
                          {formatDateTime(component.created_at)}
                        </TableCell>
                        <TableCell>{component.kit_id || "N/A"}</TableCell>
                        <TableCell>
                          <Button
                            variant="outlined"
                            color="primary"
                            size="small"
                            startIcon={<HistoryIcon />}
                            onClick={() => handleViewUsageHistory(component.id)}
                          >
                            Usage History
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
            <Box sx={{ display: "flex", justifyContent: "flex-end", pt: 2 }}>
              <TablePagination
                component="div"
                count={batchResults.length}
                page={page}
                onPageChange={(event, newPage) => setPage(newPage)}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={(event) => {
                  setRowsPerPage(parseInt(event.target.value, 10));
                  setPage(0);
                }}
                rowsPerPageOptions={[5, 10, 25, 50]}
              />
            </Box>
          </Box>
        </Card>
      </TabPanel>

      {/* Status Change Dialog */}
      <Dialog
        open={statusDialogOpen}
        onClose={() => setStatusDialogOpen(false)}
        PaperProps={{
          sx: { borderRadius: 2 },
        }}
      >
        <DialogTitle>Change Component Status</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1, minWidth: 250 }}>
            {[
              { value: "available", icon: <CheckCircle />, color: "success" },
              { value: "refurbishing", icon: <SyncIcon />, color: "warning" },
              { value: "scrapped", icon: <BlockIcon />, color: "error" },
            ].map((status) => (
              <Button
                key={status.value}
                variant="outlined"
                color={status.color}
                onClick={() =>
                  handleStatusChange(selectedComponent, status.value)
                }
                startIcon={status.icon}
                sx={{
                  justifyContent: "flex-start",
                  textTransform: "capitalize",
                  py: 1,
                }}
              >
                {status.value.charAt(0).toUpperCase() + status.value.slice(1)}
              </Button>
            ))}
          </Stack>
        </DialogContent>
      </Dialog>

      {/* Usage History Dialog */}
      <Dialog
        open={usageDialogOpen}
        onClose={() => setUsageDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 2 },
        }}
      >
        <DialogTitle>
          Usage History for Component: {selectedComponentId}
        </DialogTitle>
        <DialogContent>
          {usageLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
              <CircularProgress />
            </Box>
          ) : usageHistory.length === 0 ? (
            <Alert severity="info" sx={{ mt: 2 }}>
              No usage history found for this component
            </Alert>
          ) : (
            <TableContainer sx={{ mt: 2 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Kit ID</TableCell>
                    <TableCell>Distributor</TableCell>
                    <TableCell>Start Time</TableCell>
                    <TableCell>End Time</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {usageHistory.map((usage) => (
                    <TableRow key={usage.id}>
                      <TableCell>{usage.kit_id || "N/A"}</TableCell>
                      <TableCell>{usage.distributor_name || "N/A"}</TableCell>
                      <TableCell>{formatDateTime(usage.start_time)}</TableCell>
                      <TableCell>{formatDateTime(usage.end_time)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUsageDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={!!successMessage}
        autoHideDuration={6000}
        onClose={() => setSuccessMessage("")}
      >
        <Alert severity="success" onClose={() => setSuccessMessage("")}>
          {successMessage}
        </Alert>
      </Snackbar>

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
    </Box>
  );
}

export default CreateKit;
