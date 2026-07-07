import {
  AppBar,
  Avatar,
  Box,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  BarChart3,
  CalendarDays,
  FileClock,
  LayoutDashboard,
  LogOut,
  Menu as MenuIcon,
  Moon,
  Settings,
  ShieldPlus,
  Sun,
  Users,
} from "lucide-react";
import { useMemo, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";
import { canAccess } from "../routes/roles";
import { useThemeMode } from "../theme/AppTheme";

const drawerWidth = 264;

const navItems = [
  { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { label: "User Management", path: "/users", icon: ShieldPlus },
  { label: "Patients", path: "/patients", icon: Users },
  { label: "Visits", path: "/visits", icon: CalendarDays },
  { label: "Medical History", path: "/medical-history", icon: FileClock },
  { label: "Settings", path: "/settings", icon: Settings },
];

export function DashboardLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { user, logout } = useAuth();
  const { mode, toggleMode } = useThemeMode();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("lg"));
  const navigate = useNavigate();
  const location = useLocation();

  const visibleItems = useMemo(() => (
    navItems.filter(item => user && canAccess(user.role, item.path))
  ), [user]);

  const drawer = (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <Box sx={{ px: 3, py: 2.5 }}>
        <Typography variant="h6">Smart Intake</Typography>
        <Typography color="text.secondary" variant="body2">Hospital operations</Typography>
      </Box>
      <Divider />
      <List sx={{ flex: 1, px: 1.5, py: 2 }}>
        {visibleItems.map(item => {
          const Icon = item.icon;
          return (
            <ListItemButton
              key={item.path}
              component={NavLink}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              selected={location.pathname === item.path || location.pathname.startsWith(`${item.path}/`)}
              sx={{ borderRadius: 2, mb: 0.5 }}
            >
              <ListItemIcon><Icon size={20} /></ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          );
        })}
      </List>
      <Box sx={{ p: 2 }}>
        <Divider sx={{ mb: 2 }} />
        <Typography variant="body2" fontWeight={700}>{user?.full_name}</Typography>
        <Typography color="text.secondary" variant="caption">{user?.role}</Typography>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <AppBar
        color="inherit"
        elevation={0}
        position="fixed"
        sx={{ borderBottom: 1, borderColor: "divider", ml: { lg: `${drawerWidth}px` }, width: { lg: `calc(100% - ${drawerWidth}px)` } }}
      >
        <Toolbar>
          {!isDesktop && <IconButton edge="start" onClick={() => setMobileOpen(true)}><MenuIcon /></IconButton>}
          <Typography variant="h6" sx={{ flex: 1 }}>Patient Intake Workspace</Typography>
          <IconButton onClick={toggleMode} aria-label="Toggle theme">
            {mode === "light" ? <Moon size={20} /> : <Sun size={20} />}
          </IconButton>
          <IconButton onClick={event => setAnchorEl(event.currentTarget)}>
            <Avatar sx={{ width: 34, height: 34 }}>{user?.full_name?.charAt(0) || "U"}</Avatar>
          </IconButton>
          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
            <MenuItem disabled>{user?.full_name}</MenuItem>
            <MenuItem onClick={() => { setAnchorEl(null); navigate("/settings"); }}>Settings</MenuItem>
            <MenuItem onClick={() => { setAnchorEl(null); logout(); navigate("/login"); }}>
              <ListItemIcon><LogOut size={18} /></ListItemIcon>
              Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      <Box component="nav" sx={{ width: { lg: drawerWidth }, flexShrink: { lg: 0 } }}>
        <Drawer variant="temporary" open={mobileOpen} onClose={() => setMobileOpen(false)} ModalProps={{ keepMounted: true }} sx={{ display: { xs: "block", lg: "none" }, "& .MuiDrawer-paper": { width: drawerWidth } }}>
          {drawer}
        </Drawer>
        <Drawer variant="permanent" sx={{ display: { xs: "none", lg: "block" }, "& .MuiDrawer-paper": { width: drawerWidth, boxSizing: "border-box" } }} open>
          {drawer}
        </Drawer>
      </Box>
      <Box component="main" sx={{ ml: { lg: `${drawerWidth}px` }, p: { xs: 2, md: 3 }, pt: { xs: 10, md: 11 } }}>
        <Outlet />
      </Box>
    </Box>
  );
}
