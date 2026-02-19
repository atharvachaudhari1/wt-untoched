import { Card, CardContent, Box, Typography, Chip, IconButton, Tooltip } from '@mui/material';
import EventIcon from '@mui/icons-material/Event';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PersonIcon from '@mui/icons-material/Person';
import VideoCallIcon from '@mui/icons-material/VideoCall';
import dayjs from 'dayjs';

const statusColors = {
  scheduled: 'info', in_progress: 'error', completed: 'success', cancelled: 'default',
};

const SessionCard = ({ session, onJoin, onGoLive, onEndLive, isTeacher }) => {
  const isLive = session.isLive;

  return (
    <Card sx={{ position: 'relative', overflow: 'visible' }}>
      {isLive && (
        <Box sx={{
          position: 'absolute', top: -8, right: 12,
          bgcolor: '#F44336', color: 'white', px: 1.5, py: 0.3, borderRadius: 5,
          fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 0.5,
          boxShadow: '0 0 0 4px rgba(244,67,54,0.2)',
        }} className="live-pulse">
          <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: 'white' }} />
          LIVE
        </Box>
      )}
      <CardContent sx={{ p: 2.5 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="subtitle1" fontWeight={600} noWrap>{session.title}</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.3 }} noWrap>{session.description}</Typography>
          </Box>
          <Chip label={session.status.replace('_', ' ')} color={statusColors[session.status]} size="small" sx={{ ml: 1, textTransform: 'capitalize' }} />
        </Box>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mb: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary' }}>
            <EventIcon fontSize="small" />
            <Typography variant="caption">{dayjs(session.date).format('MMM D, YYYY')}</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary' }}>
            <AccessTimeIcon fontSize="small" />
            <Typography variant="caption">{session.startTime} – {session.endTime}</Typography>
          </Box>
          {session.mentor && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary' }}>
              <PersonIcon fontSize="small" />
              <Typography variant="caption">{session.mentor.name}</Typography>
            </Box>
          )}
        </Box>

        <Box sx={{ display: 'flex', gap: 1 }}>
          {/* Student: join button when live */}
          {!isTeacher && isLive && session.meetLink && (
            <Box component="a" href={session.meetLink} target="_blank" rel="noopener noreferrer"
              sx={{ display: 'flex', alignItems: 'center', gap: 0.8, bgcolor: '#F44336', color: 'white',
                px: 2, py: 0.8, borderRadius: 2, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                textDecoration: 'none', '&:hover': { bgcolor: '#D32F2F' }, transition: 'all 0.2s' }}>
              <VideoCallIcon fontSize="small" />
              JOIN LIVE MEETING
            </Box>
          )}

          {/* Teacher controls */}
          {isTeacher && session.status !== 'completed' && session.status !== 'cancelled' && (
            <>
              {!isLive ? (
                <Box component="button" onClick={() => onGoLive?.(session)}
                  sx={{ display: 'flex', alignItems: 'center', gap: 0.8, bgcolor: '#E91E63', color: 'white',
                    px: 2, py: 0.8, borderRadius: 2, fontSize: 13, fontWeight: 600, cursor: 'pointer', border: 'none',
                    '&:hover': { bgcolor: '#C2185B' }, transition: 'all 0.2s' }}>
                  🔴 GO LIVE
                </Box>
              ) : (
                <Box component="button" onClick={() => onEndLive?.(session)}
                  sx={{ display: 'flex', alignItems: 'center', gap: 0.8, bgcolor: '#FF9800', color: 'white',
                    px: 2, py: 0.8, borderRadius: 2, fontSize: 13, fontWeight: 600, cursor: 'pointer', border: 'none',
                    '&:hover': { bgcolor: '#F57C00' }, transition: 'all 0.2s' }}>
                  ⏹ END SESSION
                </Box>
              )}
            </>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default SessionCard;
