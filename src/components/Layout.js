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
} from "@mui/material";
import {
  Inventory2 as InventoryIcon,
  Add as AddIcon,
  Menu as MenuIcon,
  Business as BusinessIcon,
} from "@mui/icons-material";
import KitList from "./KitList";
import CreateComponent from "./CreateComponent";
import CreateKit from "./CreateKit";
import DistributorList from "./DistributorList";

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

          <InventoryIcon sx={{ mr: 2 }} />
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
              startIcon={<AddIcon />}
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
      </Menu>

      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Routes>
          <Route path="/" element={<KitList />} />
          <Route path="/distributors" element={<DistributorList />} />
          <Route path="/create-component" element={<CreateComponent />} />
          <Route path="/create-kit" element={<CreateKit />} />
        </Routes>
      </Container>
    </Box>
  );
}

export default Layout;
