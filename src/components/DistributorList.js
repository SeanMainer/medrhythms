/** @format */

import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Stack,
  Alert,
  Snackbar,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
} from "@mui/icons-material";
import { distributorService } from "../services/api";

function DistributorList() {
  const [openDialog, setOpenDialog] = useState(false);
  const [editingDistributor, setEditingDistributor] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [distributors, setDistributors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showAll, setShowAll] = useState(false);

  // Load data
  useEffect(() => {
    fetchDistributors();
  }, []);

  const fetchDistributors = async () => {
    try {
      setLoading(true);
      const data = await distributorService.getAllDistributors();
      const filteredData = showAll
        ? data
        : data.filter((dist) => dist.status === "active");
      setDistributors(filteredData);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { field: "id", headerName: "ID", flex: 1 },
    { field: "name", headerName: "Name", flex: 1.5 },
    { field: "email", headerName: "Email", flex: 1.5 },
    { field: "tel", headerName: "Telephone", flex: 1 },
    { field: "contactPerson", headerName: "Contact Person", flex: 1 },
    {
      field: "status",
      headerName: "Status",
      flex: 1,
      renderCell: (params) => (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            color: params.value === "active" ? "success.main" : "error.main",
          }}
        >
          {params.value === "active" ? (
            <CheckCircleIcon sx={{ mr: 1 }} />
          ) : (
            <CancelIcon sx={{ mr: 1 }} />
          )}
          {params.value}
        </Box>
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      flex: 1,
      renderCell: (params) => (
        <Box
          sx={{
            width: "100%",
            display: "flex",
            justifyContent: "center",
            gap: 1,
          }}
        >
          <IconButton
            size="small"
            color="primary"
            onClick={() => handleEdit(params.row)}
          >
            <EditIcon />
          </IconButton>
          <IconButton
            size="small"
            color="error"
            onClick={() => handleDelete(params.row)}
          >
            <DeleteIcon />
          </IconButton>
        </Box>
      ),
    },
  ];

  const handleEdit = (distributor) => {
    setEditingDistributor(distributor);
    setOpenDialog(true);
  };

  const handleDelete = async (distributor) => {
    try {
      setLoading(true);
      await distributorService.updateDistributorStatus(
        distributor.id,
        "inactive"
      );
      setSuccessMessage("Distributor status updated to inactive");
      fetchDistributors(); // Refresh the list
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      setLoading(true);
      const formData = new FormData(event.target);
      const distributorData = {
        id: formData.get("id"),
        name: formData.get("name"),
        email: formData.get("email"),
        tel: formData.get("tel"),
        address: formData.get("address"),
        city: formData.get("city"),
        contact_person: formData.get("contactPerson"),
        status: "active",
      };

      if (editingDistributor) {
        await distributorService.updateDistributor(
          editingDistributor.id,
          distributorData
        );
        setSuccessMessage("Distributor updated successfully");
      } else {
        await distributorService.createDistributor(distributorData);
        setSuccessMessage("Distributor created successfully");
      }

      setOpenDialog(false);
      setEditingDistributor(null);
      fetchDistributors(); // Refresh the list
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Typography variant="h4">Distributors</Typography>
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button
            variant="outlined"
            onClick={() => {
              setShowAll(!showAll);
              fetchDistributors();
            }}
          >
            {showAll ? "Show Active" : "Show All"}
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenDialog(true)}
          >
            Add Distributor
          </Button>
        </Box>
      </Box>

      <Card sx={{ height: 600 }}>
        <DataGrid
          rows={distributors}
          columns={columns}
          pageSize={10}
          rowsPerPageOptions={[10]}
          disableSelectionOnClick
          sx={{
            "& .MuiDataGrid-cell:focus": {
              outline: "none",
            },
          }}
        />
      </Card>

      <Dialog
        open={openDialog}
        onClose={() => {
          setOpenDialog(false);
          setEditingDistributor(null);
        }}
        maxWidth="sm"
        fullWidth
      >
        <form onSubmit={handleSubmit}>
          <DialogTitle>
            {editingDistributor ? "Edit Distributor" : "Add Distributor"}
          </DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 2 }}>
              <TextField
                name="id"
                label="ID"
                defaultValue={editingDistributor?.id}
                required
                fullWidth
              />
              <TextField
                name="name"
                label="Name"
                defaultValue={editingDistributor?.name}
                required
                fullWidth
              />
              <TextField
                name="email"
                label="Email"
                type="email"
                defaultValue={editingDistributor?.email}
                required
                fullWidth
              />
              <TextField
                name="tel"
                label="Telephone"
                defaultValue={editingDistributor?.tel}
                required
                fullWidth
              />
              <TextField
                name="address"
                label="Address"
                defaultValue={editingDistributor?.address}
                required
                fullWidth
              />
              <TextField
                name="city"
                label="City"
                defaultValue={editingDistributor?.city}
                required
                fullWidth
              />
              <TextField
                name="contactPerson"
                label="Contact Person"
                defaultValue={editingDistributor?.contactPerson}
                required
                fullWidth
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button
              onClick={() => {
                setOpenDialog(false);
                setEditingDistributor(null);
              }}
            >
              Cancel
            </Button>
            <Button type="submit" variant="contained">
              {editingDistributor ? "Update" : "Create"}
            </Button>
          </DialogActions>
        </form>
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

export default DistributorList;
