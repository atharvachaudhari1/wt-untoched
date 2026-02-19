import { Box, Typography, Card, CardContent, Chip, Grid } from '@mui/material';
import useAuth from '../../hooks/useAuth';
import useFetch from '../../hooks/useFetch';
import { getStudentNotes } from '../../api/userApi';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import NoteIcon from '@mui/icons-material/Notes';
import dayjs from 'dayjs';

const categoryColors = { academic: 'primary', behavioral: 'error', personal: 'secondary', career: 'success', general: 'default' };
const severityColors = { info: '#2196F3', warning: '#FF9800', critical: '#F44336' };
const severityBg = { info: '#E3F2FD', warning: '#FFF3E0', critical: '#FFEBEE' };

export default function StudentNotes() {
  const { user } = useAuth();
  const { data, loading } = useFetch(() => getStudentNotes(user._id), [user._id]);

  if (loading) return <LoadingSpinner />;
  const notes = data?.notes || [];

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight={700}>My Mentoring Notes</Typography>
        <Typography variant="body2" color="text.secondary">Notes added by your mentor (read-only)</Typography>
      </Box>

      {notes.length === 0 ? <EmptyState title="No notes yet" icon={NoteIcon} /> : (
        <Grid container spacing={2}>
          {notes.map(note => (
            <Grid item xs={12} md={6} key={note._id}>
              <Card sx={{ borderLeft: `4px solid ${severityColors[note.severity]}`, bgcolor: severityBg[note.severity] + '40' }}>
                <CardContent sx={{ p: 2.5 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                    <Chip label={note.category} color={categoryColors[note.category]} size="small" sx={{ textTransform: 'capitalize' }} />
                    <Chip label={note.severity} size="small" sx={{ bgcolor: severityBg[note.severity], color: severityColors[note.severity], fontWeight: 600 }} />
                  </Box>
                  <Typography variant="body2" sx={{ lineHeight: 1.7 }}>{note.content}</Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1.5, display: 'block' }}>
                    By {note.mentor?.name} • {dayjs(note.createdAt).format('MMM D, YYYY')}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
