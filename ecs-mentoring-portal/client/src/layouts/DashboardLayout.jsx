import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Box, Drawer, AppBar, Toolbar, Typography, List, ListItem, ListItemButton,
  ListItemIcon, ListItemText, IconButton, Avatar, Badge, Menu, MenuItem,
  Divider, useMediaQuery, useTheme, Tooltip,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import LogoutIcon from '@mui/icons-material/Logout';
import SchoolIcon from '@mui/icons-material/School';
import DashboardIcon from '@mui/icons-material/Dashboard';
import EventIcon from '@mui/icons-material/Event';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import NoteIcon from '@mui/icons-material/Notes';
import CampaignIcon from '@mui/icons-material/Campaign';
import PeopleIcon from '@mui/icons-material/People';
import BarChartIcon from '@mui/icons-material/BarChart';
import SettingsIcon from '@mui/icons-material/Settings';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import NotificationBell from '../components/common/NotificationBell';
import useAuth from '../hooks/useAuth';
import toast from 'react-hot-toast';

const DRAWER_WIDTH = 250;

const sidebarConfig = {
  student: [
    { label: 'Dashboard', icon: DashboardIcon, path: '/student/dashboard' },
    { label: 'My Sessions', icon: EventIcon, path: '/student/sessions' },
    { label: 'Attendance', icon: CheckCircleIcon, path: '/student/attendance' },
    { label: 'My Notes', icon: NoteIcon, path: '/student/notes' },
    { label: 'Announcements', icon: CampaignIcon, path: '/student/announcements' },
  ],
  teacher: [
    { label: 'Dashboard', icon: DashboardIcon, path: '/teacher/dashboard' },
    { label: 'Sessions', icon: EventIcon, path: '/teacher/sessions' },
    { label: 'My Students', icon: PeopleIcon, path: '/teacher/students' },
    { label: 'Attendance', icon: CheckCircleIcon, path: '/teacher/attendance' },
    { label: 'Notes', icon: NoteIcon, path: '/teacher/notes' },
    { label: 'Announcements', icon: CampaignIcon, path: '/teacher/announcements' },
  ],
  parent: [
    { label: 'Dashboard', icon: DashboardIcon, path: '/parent/dashboard' },
    { label: 'Schedule', icon: CalendarMonthIcon, path: '/parent/schedule' },
    { label: 'Attendance', icon: CheckCircleIcon, path: '/parent/attendance' },
    { label: 'Remarks', icon: NoteIcon, path: '/parent/remarks' },
  ],
  admin: [
    { label: 'Dashboard', icon: DashboardIcon, path: '/admin/dashboard' },
    { label: 'Users', icon: PeopleIcon, path: '/admin/users' },
    { label: 'Mentor Assignment', icon: AssignmentIcon, path: '/admin/mentor-assignment' },
    { label: 'Sessions', icon: EventIcon, path: '/admin/sessions' },
    { label: 'Analytics', icon: BarChartIcon, path: '/admin/analytics' },
    { label: 'Announcements', icon: CampaignIcon, path: '/admin/announcements' },
    { label: 'Settings', icon: SettingsIcon, path: '/admin/settings' },
  ],
};

const roleColors = { student: '#2196F3', teacher: '#E91E63', parent: '#4CAF50', admin: '#7C4DFF' };
const roleLabels = { student: 'Student', teacher: 'Mentor', parent: 'Parent', admin: 'Admin' };

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  const navItems = sidebarConfig[user?.role] || [];

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully');
    navigate('/');
  };

  const DrawerContent = () => (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: 'white' }}>
      {/* Logo */}
      <Box sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box sx={{ width: 40, height: 40, borderRadius: '50%', bgcolor: 'primary.main',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(233,30,99,0.4)' }}>
          <SchoolIcon sx={{ color: 'white', fontSize: 22 }} />
        </Box>
        <Box>
          <Typography variant="subtitle2" fontWeight={700} color="primary" sx={{ lineHeight: 1.2 }}>
            ECS Mentoring
          </Typography>
          <Typography variant="caption" color="text.secondary">Portal</Typography>
        </Box>
      </Box>
      <Divider />

      {/* Role badge */}
      <Box sx={{ px: 2, py: 1.5 }}>
        <Box sx={{ bgcolor: `${roleColors[user?.role]}15`, borderRadius: 2, px: 2, py: 1,
          border: `1px solid ${roleColors[user?.role]}30` }}>
          <Typography variant="caption" fontWeight={600} sx={{ color: roleColors[user?.role] }}>
            {roleLabels[user?.role]} Portal
          </Typography>
        </Box>
      </Box>

      {/* Nav items */}
      <List sx={{ flex: 1, px: 1 }}>
        {navItems.map(({ label, icon: Icon, path }) => {
          const active = location.pathname === path || location.pathname.startsWith(path + '/');
          return (
            <ListItem key={path} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => { navigate(path); setMobileOpen(false); }}
                sx={{
                  borderRadius: 2,
                  bgcolor: active ? 'primary.main' : 'transparent',
                  color: active ? 'white' : 'text.secondary',
                  '&:hover': { bgcolor: active ? 'primary.dark' : 'rgba(233,30,99,0.08)' },
                  transition: 'all 0.2s',
                }}
              >
                <ListItemIcon sx={{ minWidth: 38, color: 'inherit' }}>
                  <Icon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary={label} primaryTypographyProps={{ fontSize: 14, fontWeight: active ? 600 : 400 }} />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      {/* User info */}
      <Divider />
      <Box sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar sx={{ width: 36, height: 36, bgcolor: roleColors[user?.role], fontSize: 14, fontWeight: 700 }}>
            {user?.name?.charAt(0)}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="body2" fontWeight={600} noWrap>{user?.name}</Typography>
            <Typography variant="caption" color="text.secondary" noWrap>{user?.email}</Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Sidebar */}
      {isMobile ? (
        <Drawer variant="temporary" open={mobileOpen} onClose={() => setMobileOpen(false)}
          sx={{ '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box' } }}>
          <DrawerContent />
        </Drawer>
      ) : (
        <Drawer variant="permanent"
          sx={{ width: DRAWER_WIDTH, flexShrink: 0, '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box', border: 'none', boxShadow: '2px 0 12px rgba(0,0,0,0.06)' } }}>
          <DrawerContent />
        </Drawer>
      )}

      {/* Main area */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Top bar */}
        <AppBar position="sticky" color="inherit" elevation={0}
          sx={{ borderBottom: '1px solid rgba(0,0,0,0.08)', bgcolor: 'white' }}>
          <Toolbar sx={{ gap: 1 }}>
            {isMobile && (
              <IconButton edge="start" onClick={() => setMobileOpen(true)}>
                <MenuIcon />
              </IconButton>
            )}
            <Typography variant="h6" fontWeight={600} color="primary" sx={{ flex: 1, display: { xs: 'block', md: 'none' } }}>
              ECS Portal
            </Typography>
            <Box sx={{ flex: 1 }} />
            <NotificationBell />
            <Tooltip title={user?.name}>
              <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} size="small">
                <Avatar sx={{ width: 36, height: 36, bgcolor: roleColors[user?.role], fontSize: 14, fontWeight: 700 }}>
                  {user?.name?.charAt(0)}
                </Avatar>
              </IconButton>
            </Tooltip>
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
              <MenuItem disabled>
                <Box>
                  <Typography variant="body2" fontWeight={600}>{user?.name}</Typography>
                  <Typography variant="caption" color="text.secondary">{user?.email}</Typography>
                </Box>
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleLogout} sx={{ color: 'error.main', gap: 1 }}>
                <LogoutIcon fontSize="small" /> Logout
              </MenuItem>
            </Menu>
          </Toolbar>
        </AppBar>

        {/* Page content */}
        <Box sx={{ flex: 1, p: { xs: 2, md: 3 }, overflow: 'auto' }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
