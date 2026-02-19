import { useEffect, useState } from 'react';
import { Box, Grid, Card, CardContent, Typography, Avatar, Chip, Alert, Button } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import EventIcon from '@mui/icons-material/Event';
import VideoCallIcon from '@mui/icons-material/VideoCall';
import useAuth from '../../hooks/useAuth';
import { getStudentMentor, getStudentAttendance } from '../../api/userApi';
import { getUpcomingSessions, getLiveSessions } from '../../api/sessionApi';
import { getAnnouncements } from '../../api/announcementApi';
import { getStudentHealthScore } from '../../api/userApi';
import HealthScoreGauge from '../../components/analytics/HealthScoreGauge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import SessionCard from '../../components/session/SessionCard';
import dayjs from 'dayjs';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [mentor, setMentor] = useState(null);
  const [upcoming, setUpcoming] = useState([]);
  const [liveSessions, setLiveSessions] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [healthScore, setHealthScore] = useState(null);
  const [attendancePct, setAttendancePct] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [mentorRes, upcomingRes, liveRes, annRes, scoreRes, attRes] = await Promise.allSettled([
          getStudentMentor(user._id),
          getUpcomingSessions(),
          getLiveSessions(),
          getAnnouncements(),
          getStudentHealthScore(user._id),
          getStudentAttendance(user._id),
        ]);
        if (mentorRes.status === 'fulfilled') setMentor(mentorRes.value.data.mentor);
        if (upcomingRes.status === 'fulfilled') setUpcoming(upcomingRes.value.data.sessions || []);
        if (liveRes.status === 'fulfilled') setLiveSessions(liveRes.value.data.sessions || []);
        if (annRes.status === 'fulfilled') setAnnouncements((annRes.value.data.announcements || []).slice(0, 3));
        if (scoreRes.status === 'fulfilled') setHealthScore(scoreRes.value.data.healthScore);
        if (attRes.status === 'fulfilled') {
          const att = attRes.value.data.attendance || [];
          const total = att.length;
          const present = att.filter(a => ['present', 'late'].includes(a.status)).length;
          setAttendancePct(total > 0 ? Math.round((present / total) * 100) : 0);
        }
      } finally {
        setLoading(false);
      }
    };
    load();
    const interval = setInterval(async () => {
      try { const { data } = await getLiveSessions(); setLiveSessions(data.sessions || []); } catch {}
    }, 30000);
    return () => clearInterval(interval);
  }, [user._id]);

  if (loading) return <LoadingSpinner />;

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} mb={0.5}>
        Welcome back, {user.name.split(' ')[0]}! 👋
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        {dayjs().format('dddd, MMMM D, YYYY')} • Semester {user.semester} | Section {user.section}
      </Typography>

      {/* LIVE session alert */}
      {liveSessions.length > 0 && (
        <Alert severity="error" icon={false} sx={{ mb: 3, bgcolor: '#FFEBEE', border: '2px solid #F44336', borderRadius: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
            <Box>
              <Typography fontWeight={700} color="error.dark">🔴 Session is LIVE!</Typography>
              <Typography variant="body2" color="error.dark">{liveSessions[0].title} — {liveSessions[0].mentor?.name}</Typography>
            </Box>
            {liveSessions[0].meetLink && (
              <Button variant="contained" color="error" size="small" startIcon={<VideoCallIcon />}
                component="a" href={liveSessions[0].meetLink} target="_blank" rel="noopener noreferrer"
                sx={{ fontWeight: 700 }}>
                JOIN NOW
              </Button>
            )}
          </Box>
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Mentor card */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="subtitle2" color="text.secondary" fontWeight={600} mb={2}>MY MENTOR</Typography>
              {mentor ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ width: 52, height: 52, bgcolor: 'primary.main', fontSize: 20 }}>
                    {mentor.name?.charAt(0)}
                  </Avatar>
                  <Box>
                    <Typography fontWeight={600}>{mentor.name}</Typography>
                    <Typography variant="caption" color="text.secondary">{mentor.designation}</Typography>
                    <br />
                    <Typography variant="caption" color="primary.main">{mentor.specialization}</Typography>
                    <br />
                    <Typography variant="caption" color="text.secondary">{mentor.phone}</Typography>
                  </Box>
                </Box>
              ) : (
                <Typography color="text.secondary">No mentor assigned yet</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Health Score */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Typography variant="subtitle2" color="text.secondary" fontWeight={600} mb={2}>MENTORING HEALTH SCORE</Typography>
              <HealthScoreGauge score={healthScore ?? user.healthScore ?? 50} size={110} />
              <Typography variant="caption" color="text.secondary" textAlign="center" sx={{ mt: 1 }}>
                Based on attendance, participation & academic performance
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Attendance */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="subtitle2" color="text.secondary" fontWeight={600} mb={2}>ATTENDANCE</Typography>
              <Typography variant="h2" fontWeight={800} color={attendancePct >= 75 ? 'success.main' : 'error.main'}>
                {attendancePct}%
              </Typography>
              <Typography variant="body2" color="text.secondary">Overall attendance rate</Typography>
              <Chip
                label={attendancePct >= 75 ? '✓ Good standing' : '⚠ Below threshold'}
                color={attendancePct >= 75 ? 'success' : 'error'}
                size="small" sx={{ mt: 1.5 }}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Upcoming Sessions */}
        <Grid item xs={12} md={8}>
          <Typography variant="h6" fontWeight={600} mb={2}>Upcoming Sessions</Typography>
          {upcoming.length === 0 ? (
            <Card><CardContent><Typography color="text.secondary" textAlign="center" py={2}>No upcoming sessions</Typography></CardContent></Card>
          ) : (
            <Grid container spacing={2}>
              {upcoming.slice(0, 3).map(s => (
                <Grid item xs={12} key={s._id}>
                  <SessionCard session={s} isTeacher={false} />
                </Grid>
              ))}
            </Grid>
          )}
        </Grid>

        {/* Announcements */}
        <Grid item xs={12} md={4}>
          <Typography variant="h6" fontWeight={600} mb={2}>Recent Announcements</Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {announcements.length === 0 ? (
              <Card><CardContent><Typography color="text.secondary" textAlign="center" py={2}>No announcements</Typography></CardContent></Card>
            ) : announcements.map(a => (
              <Card key={a._id}>
                <CardContent sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="subtitle2" fontWeight={600} sx={{ flex: 1 }} noWrap>{a.title}</Typography>
                    <Chip label={a.priority} size="small" color={a.priority === 'urgent' ? 'error' : a.priority === 'high' ? 'warning' : 'default'} sx={{ ml: 1 }} />
                  </Box>
                  <Typography variant="caption" color="text.secondary">{a.content.substring(0, 80)}...</Typography>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}
