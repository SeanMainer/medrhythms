/** @format */

import { useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Divider,
  Alert,
  Snackbar,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  FormHelperText,
} from "@mui/material";
import {
  Headphones,
  Sensors,
  PhoneAndroid,
  SimCard,
  Delete as DeleteIcon,
  QrCodeScanner as ScannerIcon,
  CheckCircle,
  Cancel as CancelIcon,
  Edit as EditIcon,
  Inventory as BoxIcon,
} from "@mui/icons-material";
import { kitService } from "../services/api";

function CreateComponent() {
  const [open, setOpen] = useState(false);
  const [selectedType, setSelectedType] = useState("");
  const [scannedComponents, setScannedComponents] = useState([]);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingId, setEditingId] = useState("");
  const [editingModelNumber, setEditingModelNumber] = useState("");
  const [batchNumber, setBatchNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const componentTypes = [
    { value: "headphone", label: "Headphone", icon: <Headphones /> },
    { value: "leftSensor", label: "Left Sensor", icon: <Sensors /> },
    { value: "rightSensor", label: "Right Sensor", icon: <Sensors /> },
    { value: "phone", label: "Phone", icon: <PhoneAndroid /> },
    { value: "simCard", label: "SIM Card", icon: <SimCard /> },
    { value: "box", label: "Box", icon: <BoxIcon /> },
  ];

  // Model numbers for each component type
  const modelNumberOptions = {
    phone: ["P-Model-1", "P-Model-2", "P-Model-3"],
    sim_card: ["SIM-Model-1", "SIM-Model-2"],
    right_sensor: ["RS-Model-1", "RS-Model-2"],
    left_sensor: ["LS-Model-1", "LS-Model-2"],
    headphone: ["HP-Model-1", "HP-Model-2", "HP-Model-3"],
    box: ["Box-Model-1", "Box-Model-2"],
  };

  const handleManualAdd = () => {
    if (!editingId.trim()) {
      setErrorMessage("Component ID cannot be empty");
      return;
    }

    if (!editingModelNumber) {
      setErrorMessage("Please select a model number");
      return;
    }

    if (scannedComponents.some((comp) => comp.id === editingId)) {
      setErrorMessage("This component has already been added");
      return;
    }

    setScannedComponents([
      ...scannedComponents,
      {
        id: editingId,
        type: selectedType,
        model_number: editingModelNumber,
      },
    ]);

    setEditingId("");
    setEditingModelNumber("");
  };

  // This function will handle the Enter key press in the Component ID field
  const handleComponentIdKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      // If the model number is already selected, directly add the component
      if (editingModelNumber) {
        handleManualAdd();
      } else {
        // Focus on the model number field if it's not selected yet
        document.getElementById("model-number-select").focus();
      }
    }
  };

  const handleCreate = async () => {
    if (!batchNumber.trim()) {
      setErrorMessage("Batch number is required");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const result = await kitService.createComponentsByBatch(selectedType, {
        batch_number: batchNumber,
        ids: scannedComponents.map((comp) => ({
          id: comp.id,
          model_number: comp.model_number,
        })),
      });

      if (result.message) {
        setSuccessMessage(result.message);
        setScannedComponents([]);
        setBatchNumber("");
        setOpen(false);
      }
    } catch (error) {
      setError(error.message || "Failed to create components");
      setErrorMessage(error.message || "Failed to create components");
    } finally {
      setLoading(false);
    }
  };

  const handleTypeSelect = (type) => {
    const apiTypeMapping = {
      phone: "phone",
      simCard: "sim_card",
      rightSensor: "right_sensor",
      leftSensor: "left_sensor",
      headphone: "headphone",
      box: "box",
    };

    setSelectedType(apiTypeMapping[type]);
    setScannedComponents([]);
    setBatchNumber("");
    setOpen(true);
  };

  const handleRemoveScanned = (index) => {
    setScannedComponents(scannedComponents.filter((_, i) => i !== index));
  };

  const handleEdit = (index) => {
    setEditingIndex(index);
    setEditingId(scannedComponents[index].id);
    setEditingModelNumber(scannedComponents[index].model_number);
  };

  const handleSaveEdit = () => {
    if (!editingId.trim()) {
      setErrorMessage("Component ID cannot be empty");
      return;
    }

    if (!editingModelNumber) {
      setErrorMessage("Model number is required");
      return;
    }

    const isDuplicate = scannedComponents.some(
      (comp, index) => index !== editingIndex && comp.id === editingId
    );

    if (isDuplicate) {
      setErrorMessage("This component ID already exists");
      return;
    }

    const newComponents = [...scannedComponents];
    newComponents[editingIndex] = {
      ...newComponents[editingIndex],
      id: editingId,
      model_number: editingModelNumber,
    };
    setScannedComponents(newComponents);
    setEditingIndex(null);
    setEditingId("");
    setEditingModelNumber("");
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setEditingId("");
    setEditingModelNumber("");
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
        Create Component
      </Typography>

      <Grid container spacing={3}>
        {componentTypes.map((type) => (
          <Grid item xs={12} sm={6} md={4} key={type.value}>
            <Card
              sx={{
                cursor: "pointer",
                transition: "transform 0.2s",
                "&:hover": {
                  transform: "scale(1.02)",
                },
              }}
              onClick={() => handleTypeSelect(type.value)}
            >
              <CardContent
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 2,
                  padding: 3,
                }}
              >
                <Box
                  sx={{
                    backgroundColor: "primary.light",
                    borderRadius: "50%",
                    padding: 2,
                    width: 56,
                    height: 56,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                  }}
                >
                  {type.icon}
                </Box>
                <Typography variant="h6">{type.label}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog
        open={open}
        onClose={() => {
          setOpen(false);
          setScannedComponents([]);
          setBatchNumber("");
        }}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            maxHeight: "85vh",
          },
        }}
      >
        <DialogTitle
          sx={{
            backgroundColor: "primary.light",
            color: "white",
            mb: 2,
            py: 2,
          }}
        >
          Create{" "}
          {selectedType
            ? componentTypes.find(
                (t) => t.value === selectedType.replace("_", "")
              )?.label
            : ""}{" "}
          Components
        </DialogTitle>
        <DialogContent sx={{ px: 3, py: 1 }}>
          {/* Batch Number Input */}
          <Box
            sx={{
              mb: 4,
              mt: 1,
              backgroundColor: "background.paper",
              p: 2,
              borderRadius: 1,
              border: "1px solid #e0e0e0",
            }}
          >
            <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
              Batch Information
            </Typography>
            <TextField
              label="Batch Number"
              fullWidth
              value={batchNumber}
              onChange={(e) => setBatchNumber(e.target.value)}
              required
              placeholder="Enter batch number for all components"
              helperText="This batch number will be applied to all components in this session"
              variant="outlined"
              sx={{ mt: 1 }}
            />
          </Box>

          {/* Component Addition Form */}
          <Box
            sx={{
              mb: 3,
              backgroundColor: "background.paper",
              p: 2,
              borderRadius: 1,
              border: "1px solid #e0e0e0",
            }}
          >
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
              Add Components
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={7}>
                <TextField
                  label="Component ID"
                  fullWidth
                  value={editingId}
                  onChange={(e) => setEditingId(e.target.value)}
                  onKeyPress={handleComponentIdKeyPress}
                  placeholder="Scan or enter component ID"
                  size="medium"
                  autoFocus
                  helperText="Scanner will automatically input ID and press Enter"
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel id="model-number-label">Model Number</InputLabel>
                  <Select
                    labelId="model-number-label"
                    id="model-number-select"
                    value={editingModelNumber}
                    onChange={(e) => setEditingModelNumber(e.target.value)}
                    label="Model Number"
                  >
                    {selectedType &&
                      modelNumberOptions[selectedType]?.map((option) => (
                        <MenuItem key={option} value={option}>
                          {option}
                        </MenuItem>
                      ))}
                  </Select>
                  <FormHelperText>&nbsp;</FormHelperText>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={2}>
                <Box
                  sx={{
                    height: "100%",
                    display: "flex",
                    alignItems: "flex-start",
                    mt: 0.5,
                  }}
                >
                  <Button
                    variant="contained"
                    onClick={handleManualAdd}
                    fullWidth
                    sx={{
                      height: 56, // Match the height of MUI TextField/Select with size="medium"
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    Add
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Box>

          {scannedComponents.length > 0 && (
            <Box
              sx={{
                backgroundColor: "background.paper",
                p: 2,
                borderRadius: 1,
                border: "1px solid #e0e0e0",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 1,
                }}
              >
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  Components to Create
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total: {scannedComponents.length}
                </Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              <List
                sx={{
                  maxHeight: "300px",
                  overflow: "auto",
                  borderRadius: 1,
                  "&::-webkit-scrollbar": {
                    width: "8px",
                  },
                  "&::-webkit-scrollbar-thumb": {
                    backgroundColor: "rgba(0,0,0,0.2)",
                    borderRadius: "4px",
                  },
                }}
              >
                {scannedComponents.map((component, index) => (
                  <Box key={component.id}>
                    <ListItem
                      secondaryAction={
                        editingIndex === index ? (
                          <Box sx={{ display: "flex", gap: 1, ml: 1 }}>
                            <IconButton
                              edge="end"
                              onClick={handleSaveEdit}
                              color="primary"
                              size="small"
                            >
                              <CheckCircle />
                            </IconButton>
                            <IconButton
                              edge="end"
                              onClick={handleCancelEdit}
                              color="error"
                              size="small"
                            >
                              <CancelIcon />
                            </IconButton>
                          </Box>
                        ) : (
                          <Box sx={{ display: "flex", gap: 1 }}>
                            <IconButton
                              edge="end"
                              onClick={() => handleEdit(index)}
                              color="primary"
                              size="small"
                            >
                              <EditIcon />
                            </IconButton>
                            <IconButton
                              edge="end"
                              aria-label="delete"
                              onClick={() => handleRemoveScanned(index)}
                              color="error"
                              size="small"
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Box>
                        )
                      }
                      sx={{
                        pr: 12,
                        borderRadius: 1,
                        mb: 0.5,
                        "&:hover": {
                          backgroundColor: "rgba(0, 0, 0, 0.04)",
                        },
                      }}
                    >
                      {editingIndex === index ? (
                        <Grid container spacing={2} sx={{ pr: 2 }}>
                          <Grid item xs={6}>
                            <TextField
                              value={editingId}
                              onChange={(e) => setEditingId(e.target.value)}
                              size="small"
                              fullWidth
                              autoFocus
                              label="Component ID"
                            />
                          </Grid>
                          <Grid item xs={6}>
                            <FormControl fullWidth size="small">
                              <InputLabel>Model Number</InputLabel>
                              <Select
                                value={editingModelNumber}
                                onChange={(e) =>
                                  setEditingModelNumber(e.target.value)
                                }
                                label="Model Number"
                              >
                                {selectedType &&
                                  modelNumberOptions[selectedType]?.map(
                                    (option) => (
                                      <MenuItem key={option} value={option}>
                                        {option}
                                      </MenuItem>
                                    )
                                  )}
                              </Select>
                            </FormControl>
                          </Grid>
                        </Grid>
                      ) : (
                        <ListItemText
                          primary={
                            <Typography
                              variant="body1"
                              sx={{ fontWeight: 500 }}
                            >
                              {component.id}
                            </Typography>
                          }
                          secondary={
                            <Typography variant="body2" color="text.secondary">
                              Model: {component.model_number}
                            </Typography>
                          }
                        />
                      )}
                    </ListItem>
                    {index < scannedComponents.length - 1 && (
                      <Divider variant="middle" component="li" />
                    )}
                  </Box>
                ))}
              </List>
            </Box>
          )}
        </DialogContent>
        <DialogActions
          sx={{
            p: 3,
            justifyContent: "space-between",
            backgroundColor: "background.paper",
            borderTop: "1px solid #e0e0e0",
          }}
        >
          <Button
            variant="outlined"
            onClick={() => {
              setOpen(false);
              setScannedComponents([]);
              setBatchNumber("");
            }}
            sx={{ px: 3 }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleCreate}
            disabled={
              scannedComponents.length === 0 || !batchNumber.trim() || loading
            }
            sx={{ px: 3 }}
          >
            {loading
              ? "Creating..."
              : `Create ${scannedComponents.length} Component${
                  scannedComponents.length !== 1 ? "s" : ""
                }`}
          </Button>
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

      <Snackbar
        open={!!errorMessage}
        autoHideDuration={6000}
        onClose={() => setErrorMessage("")}
      >
        <Alert severity="error" onClose={() => setErrorMessage("")}>
          {errorMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default CreateComponent;
