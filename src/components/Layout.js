/** @format */

import { useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container,
  IconButton,
  Menu,
  MenuItem,
  SvgIcon,
} from "@mui/material";
import {
  Inventory2 as InventoryIcon,
  Dashboard as DashboardIcon,
  BuildCircle as BuildCircleIcon,
  Menu as MenuIcon,
  Business as BusinessIcon,
  Extension as ExtensionIcon,
  Add as AddIcon,
} from "@mui/icons-material";
import KitList from "./KitList";
import CreateComponent from "./CreateComponent";
import CreateKit from "./CreateKit";
import DistributorList from "./DistributorList";
import Dashboard from "./Dashboard";

function Layout() {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2, display: { xs: "flex", md: "none" } }}
            onClick={handleMenu}
          >
            <MenuIcon />
          </IconButton>

          {/* MedRhythm Logo SVG */}
          <SvgIcon
            sx={{
              mr: 2,
              fontSize: "3rem",
              width: 120,
              height: 48,
              cursor: "pointer",
            }}
            viewBox="0 0 252.33 56.59"
            onClick={() => navigate("/")}
          >
            <path
              d="M27.91,31.64c-.92,0-1.85,0-2.77,0-.71,0-1-.28-1-1,0-1.44,0-2.87,0-4.31a1,1,0,0,0-.35-.81c-.83-.7-1.64-1.42-2.44-2.15a1.24,1.24,0,0,0-.9-.34h-3.9c-.94,0-1.16-.22-1.16-1.14V16.64c0-.91.25-1.17,1.15-1.17h5.32c.83,0,1.1.28,1.1,1.1,0,1.45,0,2.91,0,4.37a1,1,0,0,0,.39.86c.77.65,1.5,1.33,2.28,2a1.46,1.46,0,0,0,.78.29c1,0,2.09,0,3.14,0a1.27,1.27,0,0,0,.73-.28c.79-.65,1.54-1.34,2.32-2a.89.89,0,0,0,.34-.76c0-1.46,0-2.92,0-4.37,0-.9.27-1.17,1.16-1.17h5.26c.89,0,1.15.25,1.15,1.11v5.37c0,.89-.23,1.09-1.15,1.09-1.32,0-2.64,0-4,0a1.4,1.4,0,0,0-.79.28c-.87.71-1.69,1.48-2.55,2.21a.93.93,0,0,0-.34.77c0,1.41,0,2.83,0,4.25,0,.85-.25,1.08-1.09,1.08S28.81,31.64,27.91,31.64Z"
              style={{ fill: "#fff" }}
            ></path>
            <path
              d="M207.75,36.8h-4.07V36q0-4.34-.08-8.66a7.34,7.34,0,0,0-.16-1.41,2.68,2.68,0,0,0-4.24-1.75,4,4,0,0,0-1.72,2.72,6.14,6.14,0,0,0-.13,1.29c0,2.62,0,5.23,0,7.85v.74H193.2V14h3.52c.59,0,.59,0,.6.59v7.37c.35-.26.59-.43.83-.59a7,7,0,0,1,4.52-1.4,5.28,5.28,0,0,1,5,4.29,10.37,10.37,0,0,1,.15,1.76c0,3.43,0,6.88,0,10.32C207.78,36.45,207.76,36.6,207.75,36.8Z"
              style={{ fill: "#fff" }}
            ></path>
            <path
              d="M167,42.86c.12-.27.19-.46.28-.66l2.85-6.08a1.15,1.15,0,0,0,0-1q-2.89-7-5.76-14c-.1-.25-.19-.51-.28-.76h1.17c.85,0,1.69,0,2.54,0,.46,0,.61.2.75.57,1.23,3,2.49,6,3.73,9,.08.21.19.41.33.73.14-.29.25-.49.34-.71,1.37-3,2.76-6,4.12-9a.81.81,0,0,1,.88-.57c1,0,2,0,3,0h.66c-.1.27-.16.45-.23.63q-4.9,10.69-9.79,21.38a.8.8,0,0,1-.89.55c-1.21,0-2.4,0-3.69,0Z"
              style={{ fill: "#fff" }}
            ></path>
            <path
              d="M188.51,20.3h2.41v3.6h-2.39V36.79h-4.15V23.92c-.58,0-1.08,0-1.58,0s-.59-.14-.58-.57c0-.85,0-1.69,0-2.54,0-.38.12-.54.51-.52s1,0,1.61,0v-6h4.16c0,2,0,4,0,6Z"
              style={{ fill: "#fff" }}
            ></path>
            <path
              d="M36.67,41.44H34c-.75,0-1.07-.32-1.07-1.07,0-1.83,0-3.66,0-5.48,0-.73.3-1.06,1-1.07,1.87,0,3.73,0,5.6,0,.71,0,1,.31,1,1,0,1.87,0,3.73,0,5.6,0,.72-.34,1-1.09,1Z"
              style={{ fill: "#fff" }}
            ></path>
            <path
              d="M15.36,37.44V34.67c0-.68.28-1,.95-1,1.9,0,3.79,0,5.67,0a.86.86,0,0,1,1,1c0,1.89,0,3.78,0,5.66,0,.68-.32,1-1,1-1.84,0-3.7,0-5.54,0-.74,0-1-.31-1-1Z"
              style={{ fill: "#fff" }}
            ></path>
            <path
              d="M96.49,18.74v4h7.87v4.12H96.52c0,.23,0,.39,0,.54v4.72c0,.57,0,.58.61.59h6.5c.25,0,.5,0,.8,0v4.13H92.28V14.63h12.07v4.11Z"
              style={{ fill: "#fff" }}
            ></path>
            <path
              d="M2.26,27.85c.07-.74.14-1.48.22-2.22A25.56,25.56,0,0,1,23.68,3.22c.43-.07.85-.11,1.34-.18v4.7a20.86,20.86,0,0,0-14.83,9.68A20,20,0,0,0,7.05,29.15,20.42,20.42,0,0,0,12.4,42.39,20.8,20.8,0,0,0,25,49.13V53.9c-.92-.17-1.8-.27-2.65-.47A25.54,25.54,0,0,1,2.94,34.05c-.3-1.36-.39-2.76-.58-4.14L2.26,29Z"
              style={{ fill: "#fff" }}
            ></path>
            <path
              d="M251.26,32.58c-.06.24-.11.49-.18.74a4.71,4.71,0,0,1-3.15,3.48,7.16,7.16,0,0,1-7.46-1.28c-.35-.31-.65-.68-1-1.07L242,31.67a11.3,11.3,0,0,0,.87.75,4.29,4.29,0,0,0,2.73,1.1,1.86,1.86,0,0,0,.52-.07,1.37,1.37,0,0,0,1.07-.91,1.19,1.19,0,0,0-.53-1.33,15.71,15.71,0,0,0-1.33-.85c-1-.58-2-1.09-3-1.74a4.81,4.81,0,0,1-2.07-2.78,4.57,4.57,0,0,1,2.24-5.19,6.58,6.58,0,0,1,8.32,1.94l-2.53,2.56c-.25-.2-.54-.45-.85-.67a3,3,0,0,0-2.23-.75,2.23,2.23,0,0,0-.68.2.85.85,0,0,0-.14,1.47,6.5,6.5,0,0,0,1.11.66c1.06.58,2.16,1.12,3.22,1.75a4.8,4.8,0,0,1,2.18,2.55c.15.42.24.86.36,1.3,0,.29,0,.6,0,.92Z"
              style={{ fill: "#fff" }}
            ></path>
            <path
              d="M88.89,36.92H84.77c-.78-4.6-1.55-9.21-2.33-13.8h-.13c-.28.85-.56,1.7-.86,2.55-1.19,3.58-2.41,7.15-3.58,10.74a.68.68,0,0,1-.79.56c-1,0-2.09,0-3.16,0-1.54-4.63-3-9.24-4.58-13.83h-.13c-.79,4.58-1.57,9.15-2.36,13.77H62.7c.16-1,.32-2,.48-2.92q1.58-9.21,3.18-18.41c.19-1.09-.07-1,1.16-1,.85,0,1.69,0,2.54,0a.71.71,0,0,1,.84.59c1.07,3.3,2.16,6.58,3.24,9.86l1.53,4.6c0,.1.08.21.16.41.1-.24.17-.38.22-.53,1.58-4.74,3.18-9.47,4.76-14.21.24-.7.24-.7,1-.7h2.66l.7,0,3.75,22.29Z"
              style={{ fill: "#fff" }}
            ></path>
            <path
              d="M30.81,7.77V3.11c5.08.19,13,3.44,18,10.41a25.38,25.38,0,0,1,1.65,27.2c-4.27,7.63-10.88,11.93-19.61,13.21V49.12a20.83,20.83,0,0,0,14-8.46,20.1,20.1,0,0,0,4-12.64A20.28,20.28,0,0,0,43.53,14.6,20.68,20.68,0,0,0,30.81,7.77Z"
              style={{ fill: "#fff" }}
            ></path>
            <path
              d="M226.44,36.8h-4.2V36c0-2.92,0-5.86-.08-8.79a6.49,6.49,0,0,0-.21-1.39,2.67,2.67,0,0,0-4.11-1.73,3.71,3.71,0,0,0-1.79,3,19.26,19.26,0,0,0-.14,2.52c0,2.16,0,4.33,0,6.49v.72h-4.18V20.38c.18,0,.33-.06.47-.06,1.06,0,2.13,0,3.19,0,.39,0,.54.14.51.52a6.66,6.66,0,0,0,.05,1.18,7.08,7.08,0,0,1,5.19-2.09,5.3,5.3,0,0,1,4.67,2.89c.24-.27.43-.52.64-.74A6.44,6.44,0,0,1,233,20.13a4.83,4.83,0,0,1,3.81,4.81c.1,3.85.09,7.71.13,11.56a2.07,2.07,0,0,1-.05.3h-4.19v-.74c0-2.89,0-5.79,0-8.68a6.89,6.89,0,0,0-.2-1.57,2.45,2.45,0,0,0-3.21-2,3.15,3.15,0,0,0-2.47,2.43,13.71,13.71,0,0,0-.35,2.92c-.05,2.3,0,4.6,0,6.91,0,.22,0,.46,0,.76Z"
              style={{ fill: "#fff" }}
            ></path>
            <path
              d="M123.71,18.56a8.19,8.19,0,0,0-4.84-3.36,23.36,23.36,0,0,0-3.79-.53c-2-.1-4.11-.05-6.15-.06a4.15,4.15,0,0,0-.59.05V36.91a.73.73,0,0,1,.24.05c2.87-.05,5.73,0,8.58-.15A8.47,8.47,0,0,0,124.61,32,12.11,12.11,0,0,0,126,26.24,12.51,12.51,0,0,0,123.71,18.56Zm-2.31,9.78c-.52,2-1.75,4-4.63,4.28-1.36.12-2.74.15-4.17.22V18.79l.11-.07a12,12,0,0,1,5.51.74,5.72,5.72,0,0,1,3.2,4.14A9.63,9.63,0,0,1,121.4,28.34Z"
              style={{ fill: "#fff" }}
            ></path>
            <path
              d="M144.48,36.84c-1.79-3.35-3.5-6.59-5.26-9.87l.73-.34a5.59,5.59,0,0,0,3.29-4,7.46,7.46,0,0,0,0-3.05,5.54,5.54,0,0,0-3.81-4.54,8.77,8.77,0,0,0-2.32-.41c-2.11-.09-4.24-.09-6.37-.13-.19,0-.38,0-.58,0V36.8h4.24V27.44l.17-.07a2.67,2.67,0,0,1,.38.44c.54,1,1.06,2,1.58,3q1.48,2.82,3,5.62c.1.18.31.42.48.42,1.43,0,2.86,0,4.43,0ZM138,22.94a9.87,9.87,0,0,1-3.52.27V18.8a1.06,1.06,0,0,1,.33-.08,18.69,18.69,0,0,1,2.81.16,2.18,2.18,0,0,1,1.28,3.44A1.88,1.88,0,0,1,138,22.94Z"
              style={{ fill: "#fff" }}
            ></path>
            <path
              d="M162,36.81h-4.11v-.7c0-2.78,0-5.55,0-8.33a11.47,11.47,0,0,0-.14-1.64A2.49,2.49,0,0,0,156,23.9a3,3,0,0,0-3.08.65,4.17,4.17,0,0,0-1.36,3.16c-.06,2.78-.06,5.55-.1,8.33v.78h-4.12c0-.23,0-.44,0-.65V14.63c0-.66,0-.66.65-.67h2.9a4.54,4.54,0,0,1,.58,0V22c.27-.19.44-.29.6-.42a7.19,7.19,0,0,1,4.82-1.6,5.26,5.26,0,0,1,5,4.41A11.22,11.22,0,0,1,162,26q0,5.13,0,10.27C162,36.41,162,36.59,162,36.81Z"
              style={{ fill: "#fff" }}
            ></path>
          </SvgIcon>

          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Kit Management System
          </Typography>

          <Box sx={{ display: { xs: "none", md: "flex" }, gap: 2 }}>
            <Button
              color="inherit"
              startIcon={<InventoryIcon />}
              onClick={() => navigate("/")}
            >
              Kits
            </Button>
            <Button
              color="inherit"
              startIcon={<ExtensionIcon />}
              onClick={() => navigate("/create-kit")}
            >
              Components
            </Button>
            <Button
              color="inherit"
              startIcon={<BusinessIcon />}
              onClick={() => navigate("/distributors")}
            >
              Distributors
            </Button>
            <Button
              color="inherit"
              startIcon={<AddIcon />}
              onClick={() => navigate("/create-component")}
            >
              Create Component
            </Button>
            <Button
              color="inherit"
              startIcon={<DashboardIcon />}
              onClick={() => navigate("/dashboard")}
            >
              Dashboard
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
        <MenuItem
          onClick={() => {
            navigate("/");
            handleClose();
          }}
        >
          Kits
        </MenuItem>
        <MenuItem
          onClick={() => {
            navigate("/create-kit");
            handleClose();
          }}
        >
          Components
        </MenuItem>
        <MenuItem
          onClick={() => {
            navigate("/distributors");
            handleClose();
          }}
        >
          Distributors
        </MenuItem>
        <MenuItem
          onClick={() => {
            navigate("/create-component");
            handleClose();
          }}
        >
          Create Component
        </MenuItem>
        <MenuItem
          onClick={() => {
            navigate("/dashboard");
            handleClose();
          }}
        >
          Dashboard
        </MenuItem>
      </Menu>

      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Routes>
          <Route path="/" element={<KitList />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/distributors" element={<DistributorList />} />
          <Route path="/create-component" element={<CreateComponent />} />
          <Route path="/create-kit" element={<CreateKit />} />
        </Routes>
      </Container>
    </Box>
  );
}

export default Layout;
