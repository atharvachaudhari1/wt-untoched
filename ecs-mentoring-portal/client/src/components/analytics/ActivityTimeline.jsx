import { Box, Typography, Avatar, Chip } from '@mui/material';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);

const actionColors = {
  session_created: '#E91E63', session_live: '#F44336', attendance_marked: '#4CAF50',
  note_added: '#FF9800', announcement_created: '#2196F3', user_created: '#7C4DFF',
  mentor_assigned: '#00BCD4',
};
const actionEmojis = {
  session_created: '📅', session_live: '🔴', attendance_marked: '✅',
  note_added: '📝', announcement_created: '📢', user_created: '👤', mentor_assigned: '🤝',
};

const ActivityTimeline = ({ activities = [] }) => {
  if (!activities.length) {
    return <Typography color="text.secondary" textAlign="center" py={4}>No recent activity</Typography>;
  }

  return (
    <Box sx={{ position: 'relative' }}>
      {/* Vertical line */}
      <Box sx={{ position: 'absolute', left: 18, top: 0, bottom: 0, width: 2, bgcolor: 'rgba(0,0,0,0.06)' }} />

      {activities.map((activity, idx) => (
        <Box key={activity._id || idx} sx={{ display: 'flex', gap: 2, mb: 2.5, position: 'relative' }}>
          {/* Dot */}
          <Box sx={{ width: 38, height: 38, borderRadius: '50%', bgcolor: `${actionColors[activity.action] || '#9E9E9E'}15`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, zIndex: 1,
            border: `2px solid ${actionColors[activity.action] || '#9E9E9E'}30` }}>
            <Typography sx={{ fontSize: 16 }}>{actionEmojis[activity.action] || '•'}</Typography>
          </Box>

          <Box sx={{ flex: 1, pt: 0.5 }}>
            <Typography variant="body2" fontWeight={500}>{activity.description}</Typography>
            <Typography variant="caption" color="text.secondary">
              {dayjs(activity.createdAt).fromNow()}
            </Typography>
          </Box>
        </Box>
      ))}
    </Box>
  );
};

export default ActivityTimeline;
