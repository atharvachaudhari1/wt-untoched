import { useEffect, useState } from 'react';
import { Box, Typography, Grid, Card, CardContent, Button } from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import EventIcon from '@mui/icons-material/Event';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import StarIcon from '@mui/icons-material/Star';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { getTeacherStudents } from '../../api/userApi';
import { getUpcomingSessions, getLiveSessions, goLive, endLive } from '../../api/sessionApi';
import { getActivityTimeline } from '../../api/analyticsApi';
import SessionCard from '../../components/session/SessionCard';
import StatCard from '../../components/common/StatCard';
import ActivityTimeline from '../../components/analytics/ActivityTimeline';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';

export default function TeacherDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [studRes, upcomingRes, actRes] = await Promise.allSettled([
          getTeacherStudents(user._id),
          getUpcomingSessions(),
          getActivityTimeline({ limit: 8 }),
        ]);
        if (studRes.status === 'fulfilled') setStudents(studRes.value.data.students || []);
        if (upcomingRes.status === 'fulfilled') setUpcoming(upcomingRes.value.data.sessions || []);
        if (actRes.status === 'fulfilled') setActivities(actRes.value.data.activities || []);
      } finally { setLoading(false); }
    };
    load();
  }, [user._id]);

  const handleGoLive = async (session) => {
    try {
      await goLive(session._id);
      setUpcoming(prev => prev.map(s => s._id === session._id ? { ...s, isLive: true, status: 'in_progress' } : s));
      toast.success('Session is now LIVE!');
    } catch { toast.error('Failed to go live'); }
  };

  const handleEndLive = async (session) => {
    try {
      await endLive(session._id);
      setUpcoming(prev => prev.filter(s => s._id !== session._id));
      toast.success('Session ended');
    } catch { toast.error('Failed to end session'); }
  };

  if (loading) return <LoadingSpinner />;

  const avgHealth = students.length ? Math.round(students.reduce((s, st) => s + (st.healthScore || 0), 0) / students.length) : 0;

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} mb={0.5}>Welcome, {user.name.split(' ')[0]}! 👩‍🏫</Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>{dayjs().format('dddd, MMMM D, YYYY')} • {user.designation}</Typography>

      <Grid container spacing={2} mb={3}>
        <Grid item xs={6} md={3}>
          <StatCard title="My Students" value={students.length} icon={PeopleIcon} color="#E91E63" />
        </Grid>
        <Grid item xs={6} md={3}>
          <StatCard title="Upcoming Sessions" value={upcoming.length} icon={EventIcon} color="#7C4DFF" />
        </Grid>
        <Grid item xs={6} md={3}>
          <StatCard title="Avg Health Score" value={avgHealth} icon={StarIcon} color="#FF9800" />
        </Grid>
        <Grid item xs={6} md={3}>
          <StatCard title="Live Now" value={upcoming.filter(s => s.isLive).length} icon={CheckCircleIcon} color="#F44336" />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={7}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" fontWeight={600}>Upcoming Sessions</Typography>
            <Button size="small" onClick={() => navigate('/teacher/sessions/new')} variant="contained">+ New Session</Button>
          </Box>
          {upcoming.length === 0 ? (
            <Card><CardContent><Typography color="text.secondary" textAlign="center" py={2}>No upcoming sessions</Typography></CardContent></Card>
          ) : (
            <Grid container spacing={1.5}>
              {upcoming.slice(0, 4).map(s => (
                <Grid item xs={12} key={s._id}>
                  <SessionCard session={s} isTeacher onGoLive={handleGoLive} onEndLive={handleEndLive} />
                </Grid>
              ))}
            </Grid>
          )}
        </Grid>

        <Grid item xs={12} md={5}>
          <Typography variant="h6" fontWeight={600} mb={2}>Recent Activity</Typography>
          <Card><CardContent sx={{ p: 2.5 }}>
            <ActivityTimeline activities={activities} />
          </CardContent></Card>
        </Grid>
      </Grid>
    </Box>
  );
}
