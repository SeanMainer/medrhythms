/** @format */

import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    primary: {
      main: "#1b5e20",
      light: "#4c8c4a",
      dark: "#003300",
    },
    secondary: {
      main: "#81c784",
      light: "#b2fab4",
      dark: "#519657",
    },
    background: {
      default: "#f1f8e9",
      paper: "#ffffff",
    },
    success: {
      main: "#2e7d32",
    },
    text: {
      primary: "#1b5e20",
      secondary: "#4c8c4a",
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: "none",
        },
        contained: {
          "&:hover": {
            backgroundColor: "#4c8c4a",
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: "0 4px 6px rgba(27, 94, 32, 0.1)",
          "&:hover": {
            boxShadow: "0 6px 12px rgba(27, 94, 32, 0.15)",
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: "#1b5e20",
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          backgroundColor: "#e8f5e9",
          "&.MuiChip-colorPrimary": {
            backgroundColor: "#c8e6c9",
            color: "#1b5e20",
          },
        },
      },
    },
    MuiDataGrid: {
      styleOverrides: {
        root: {
          border: "none",
          "& .MuiDataGrid-cell:focus": {
            outline: "none",
          },
          "& .MuiDataGrid-columnHeader": {
            backgroundColor: "#e8f5e9",
            color: "#1b5e20",
          },
          "& .MuiDataGrid-row:hover": {
            backgroundColor: "#f1f8e9",
          },
        },
      },
    },
  },
});
