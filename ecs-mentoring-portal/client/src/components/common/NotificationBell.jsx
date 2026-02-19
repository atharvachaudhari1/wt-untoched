import { useState, useEffect } from 'react';
import { IconButton, Badge, Popover, Box, Typography, List, ListItem, ListItemText, Button, Divider } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { getNotifications, getUnreadCount, markNotificationRead, markAllRead } from '../../api/notificationApi';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);

export default function NotificationBell() {
  const [count, setCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();

  const fetchCount = async () => {
    try { const { data } = await getUnreadCount(); setCount(data.count); } catch { /* ignore */ }
  };

  useEffect(() => {
    fetchCount();
    const interval = setInterval(fetchCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleOpen = async (e) => {
    setAnchorEl(e.currentTarget);
    try {
      const { data } = await getNotifications({ limit: 10 });
      setNotifications(data.notifications || []);
    } catch { /* ignore */ }
  };

  const handleMarkAllRead = async () => {
    await markAllRead();
    setCount(0);
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const handleClickNotification = async (n) => {
    if (!n.isRead) {
      await markNotificationRead(n._id);
      setCount(c => Math.max(0, c - 1));
      setNotifications(prev => prev.map(x => x._id === n._id ? { ...x, isRead: true } : x));
    }
    if (n.link) { navigate(n.link); setAnchorEl(null); }
  };

  return (
    <>
      <IconButton onClick={handleOpen}>
        <Badge badgeContent={count} color="error" max={99}>
          <NotificationsIcon />
        </Badge>
      </IconButton>
      <Popover open={Boolean(anchorEl)} anchorEl={anchorEl} onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{ sx: { width: 360, borderRadius: 3, boxShadow: '0 8px 32px rgba(0,0,0,0.15)' } }}>
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="subtitle1" fontWeight={600}>Notifications</Typography>
          {count > 0 && <Button size="small" onClick={handleMarkAllRead}>Mark all read</Button>}
        </Box>
        <Divider />
        <List dense sx={{ maxHeight: 400, overflow: 'auto', p: 0 }}>
          {notifications.length === 0 ? (
            <ListItem><ListItemText primary="No notifications" sx={{ textAlign: 'center', color: 'text.secondary' }} /></ListItem>
          ) : notifications.map(n => (
            <ListItem key={n._id} button onClick={() => handleClickNotification(n)}
              sx={{ bgcolor: n.isRead ? 'transparent' : 'rgba(233,30,99,0.04)', borderLeft: n.isRead ? 'none' : '3px solid #E91E63' }}>
              <ListItemText
                primary={n.title}
                secondary={<>{n.message}<br /><Typography variant="caption" color="text.secondary">{dayjs(n.createdAt).fromNow()}</Typography></>}
                primaryTypographyProps={{ fontWeight: n.isRead ? 400 : 600, fontSize: 14 }}
              />
            </ListItem>
          ))}
        </List>
      </Popover>
    </>
  );
}
