import {
  AppBar,
  Avatar,
  Badge,
  Box,
  Collapse,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Stack,
  Toolbar,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { Bell, ChevronDown, ChevronRight, LogOut, Maximize, Menu as MenuIcon, Minimize2, Moon, Settings, Sun, UserRound } from "lucide-react";
import { Fragment, useMemo, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router";
import { navigation, type NavigationItem } from "../constants/navigation";
import { GlobalSearch } from "../components/common/GlobalSearch";
import { useAuth } from "../context/AuthContext";
import { useLiveClock } from "../hooks/useLiveClock";
import { canAccess } from "../routes/roles";
import { resourceApi } from "../services/resourceApi";
import { useThemeMode } from "../theme/AppTheme";

const expandedWidth = 284;
const collapsedWidth = 84;

function usePersistedBoolean(key: string, initialValue: boolean) {
  const [value, setValue] = useState(() => {
    const stored = localStorage.getItem(key);
    return stored ? stored === "true" : initialValue;
  });

  function update(next: boolean) {
    localStorage.setItem(key, String(next));
    setValue(next);
  }

  return [value, update] as const;
}

export function EnterpriseLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = usePersistedBoolean("spi_sidebar_collapsed", false);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});
  const [profileAnchor, setProfileAnchor] = useState<null | HTMLElement>(null);
  const [notificationsAnchor, setNotificationsAnchor] = useState<null | HTMLElement>(null);
  const { user, logout } = useAuth();
  const { mode, toggleMode } = useThemeMode();
  const clock = useLiveClock();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("lg"));
  const navigate = useNavigate();
  const location = useLocation();
  const notifications = useQuery({ queryKey: ["layout-notifications"], queryFn: resourceApi.notifications, retry: false });

  const drawerWidth = collapsed ? collapsedWidth : expandedWidth;
  const visibleItems = useMemo(() => navigation.filter(item => user && item.roles.includes(user.role)), [user]);
  const unreadCount = (notifications.data || []).filter(notification => !notification.is_read).length;

  function renderItem(item: NavigationItem, depth = 0) {
    const Icon = item.icon;
    const hasChildren = Boolean(item.children?.length);
    const allowedChildren = item.children?.filter(child => user && canAccess(user.role, child.path.split("?")[0])) || [];
    const selected = location.pathname === item.path || location.pathname.startsWith(`${item.path}/`);
    const open = openGroups[item.label] ?? selected;

    if (hasChildren && allowedChildren.length === 0) return null;

    return (
      <Fragment key={`${item.label}-${item.path}`}>
        <Tooltip title={collapsed ? item.label : ""} placement="right">
          <ListItemButton
            component={hasChildren ? "button" : NavLink}
            to={hasChildren ? undefined : item.path}
            selected={selected}
            onClick={() => {
              if (hasChildren) setOpenGroups(current => ({ ...current, [item.label]: !open }));
              else setMobileOpen(false);
            }}
            sx={{ borderRadius: 2, mb: 0.5, minHeight: 44, pl: collapsed ? 2.2 : 2 + depth * 2, transition: "all .18s ease" }}
          >
            <ListItemIcon sx={{ minWidth: collapsed ? 0 : 42 }}><Icon size={20} /></ListItemIcon>
            {!collapsed && <ListItemText primary={item.label} primaryTypographyProps={{ fontWeight: selected ? 700 : 500 }} />}
            {!collapsed && hasChildren && (open ? <ChevronDown size={16} /> : <ChevronRight size={16} />)}
          </ListItemButton>
        </Tooltip>
        {hasChildren && !collapsed && (
          <Collapse in={open} timeout="auto" unmountOnExit>
            <List disablePadding>{allowedChildren.map(child => renderItem(child, depth + 1))}</List>
          </Collapse>
        )}
      </Fragment>
    );
  }

  const drawer = (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ px: 2, py: 2 }}>
        {!collapsed && (
          <Box>
            <Typography variant="h6">Smart Intake</Typography>
            <Typography color="text.secondary" variant="body2">Enterprise HMS</Typography>
          </Box>
        )}
        <Tooltip title={collapsed ? "Expand sidebar" : "Collapse sidebar"}>
          <IconButton onClick={() => setCollapsed(!collapsed)}>{collapsed ? <ChevronRight /> : <Minimize2 />}</IconButton>
        </Tooltip>
      </Stack>
      <Divider />
      <List sx={{ flex: 1, px: 1.5, py: 2, overflowY: "auto" }}>{visibleItems.map(item => renderItem(item))}</List>
      <Box sx={{ p: 2 }}>
        <Divider sx={{ mb: 2 }} />
        <Stack direction="row" spacing={1.25} alignItems="center">
          <Avatar sx={{ width: 34, height: 34 }}>{user?.full_name?.charAt(0) || "U"}</Avatar>
          {!collapsed && (
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="body2" fontWeight={700} noWrap>{user?.full_name}</Typography>
              <Typography color="text.secondary" variant="caption">{user?.role}</Typography>
            </Box>
          )}
        </Stack>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <AppBar color="inherit" elevation={0} position="fixed" sx={{ borderBottom: 1, borderColor: "divider", ml: { lg: `${drawerWidth}px` }, transition: "all .18s ease", width: { lg: `calc(100% - ${drawerWidth}px)` } }}>
        <Toolbar sx={{ gap: 2 }}>
          {!isDesktop && <IconButton edge="start" onClick={() => setMobileOpen(true)}><MenuIcon /></IconButton>}
          <Box sx={{ display: { xs: "none", md: "block" } }}>
            <Typography variant="body2" fontWeight={700}>{clock.day}</Typography>
            <Typography color="text.secondary" variant="caption">{clock.date} · {clock.time}</Typography>
          </Box>
          <GlobalSearch />
          <Tooltip title="Notifications"><IconButton onClick={event => setNotificationsAnchor(event.currentTarget)}><Badge badgeContent={unreadCount} color="error"><Bell size={20} /></Badge></IconButton></Tooltip>
          <Tooltip title={mode === "light" ? "Dark mode" : "Light mode"}><IconButton onClick={toggleMode}>{mode === "light" ? <Moon size={20} /> : <Sun size={20} />}</IconButton></Tooltip>
          <Tooltip title="Fullscreen"><IconButton onClick={() => document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen()}><Maximize size={20} /></IconButton></Tooltip>
          <IconButton onClick={event => setProfileAnchor(event.currentTarget)}><Avatar sx={{ width: 34, height: 34 }}>{user?.full_name?.charAt(0) || "U"}</Avatar></IconButton>
          <Menu anchorEl={notificationsAnchor} open={Boolean(notificationsAnchor)} onClose={() => setNotificationsAnchor(null)}>
            <MenuItem disabled>Notification Center</MenuItem>
            {notifications.isError && <MenuItem disabled>Notifications are unavailable because the backend endpoint is not exposed.</MenuItem>}
            {!notifications.isError && (notifications.data || []).slice(0, 5).map(notification => (
              <MenuItem key={notification.id} onClick={() => { setNotificationsAnchor(null); navigate("/notifications"); }}>
                {notification.title}
              </MenuItem>
            ))}
            {!notifications.isError && (notifications.data || []).length === 0 && <MenuItem disabled>No notifications</MenuItem>}
          </Menu>
          <Menu anchorEl={profileAnchor} open={Boolean(profileAnchor)} onClose={() => setProfileAnchor(null)}>
            <MenuItem disabled>{user?.full_name}</MenuItem>
            <MenuItem onClick={() => { setProfileAnchor(null); navigate("/profile"); }}><UserRound size={18} /> Profile</MenuItem>
            <MenuItem onClick={() => { setProfileAnchor(null); navigate("/settings"); }}><Settings size={18} /> Settings</MenuItem>
            <MenuItem disabled>Change password unavailable</MenuItem>
            <MenuItem onClick={() => { setProfileAnchor(null); logout(); navigate("/login"); }}><LogOut size={18} /> Logout</MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      <Box component="nav" sx={{ width: { lg: drawerWidth }, flexShrink: { lg: 0 } }}>
        <Drawer variant="temporary" open={mobileOpen} onClose={() => setMobileOpen(false)} ModalProps={{ keepMounted: true }} sx={{ display: { xs: "block", lg: "none" }, "& .MuiDrawer-paper": { width: expandedWidth } }}>{drawer}</Drawer>
        <Drawer variant="permanent" sx={{ display: { xs: "none", lg: "block" }, "& .MuiDrawer-paper": { width: drawerWidth, boxSizing: "border-box", transition: "width .18s ease" } }} open>{drawer}</Drawer>
      </Box>
      <Box component="main" sx={{ ml: { lg: `${drawerWidth}px` }, p: { xs: 2, md: 3 }, pt: { xs: 10, md: 11 }, transition: "margin .18s ease" }}>
        <Outlet />
        <Typography component="footer" color="text.secondary" variant="caption" sx={{ display: "block", mt: 4, textAlign: "center" }}>
          Smart Patient Intake System · API status: connected when backend is reachable · {clock.timezone}
        </Typography>
      </Box>
    </Box>
  );
}
