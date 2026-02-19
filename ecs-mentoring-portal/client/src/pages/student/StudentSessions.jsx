import { Box, Typography, Grid, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { useState } from 'react';
import useFetch from '../../hooks/useFetch';
import useAuth from '../../hooks/useAuth';
import { getStudentSessions } from '../../api/userApi';
import SessionCard from '../../components/session/SessionCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import EventIcon from '@mui/icons-material/Event';

export default function StudentSessions() {
  const { user } = useAuth();
  const [filter, setFilter] = useState('all');
  const { data, loading } = useFetch(() => getStudentSessions(user._id), [user._id]);

  if (loading) return <LoadingSpinner />;

  const sessions = (data?.sessions || []).filter(s => filter === 'all' || s.status === filter);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight={700}>My Sessions</Typography>
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>Filter</InputLabel>
          <Select value={filter} label="Filter" onChange={e => setFilter(e.target.value)}>
            <MenuItem value="all">All Sessions</MenuItem>
            <MenuItem value="scheduled">Scheduled</MenuItem>
            <MenuItem value="in_progress">Live</MenuItem>
            <MenuItem value="completed">Completed</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {sessions.length === 0 ? (
        <EmptyState title="No sessions found" icon={EventIcon} />
      ) : (
        <Grid container spacing={2}>
          {sessions.map(s => (
            <Grid item xs={12} md={6} key={s._id}>
              <SessionCard session={s} isTeacher={false} />
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
