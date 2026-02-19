import { Box, Typography, Card, CardContent, Chip, Grid } from '@mui/material';
import useFetch from '../../hooks/useFetch';
import { getAnnouncements } from '../../api/announcementApi';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import CampaignIcon from '@mui/icons-material/Campaign';
import dayjs from 'dayjs';

const priorityColors = { low: 'default', medium: 'info', high: 'warning', urgent: 'error' };

export default function StudentAnnouncements() {
  const { data, loading } = useFetch(getAnnouncements);
  if (loading) return <LoadingSpinner />;
  const announcements = data?.announcements || [];

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} mb={3}>Announcements</Typography>
      {announcements.length === 0 ? <EmptyState title="No announcements" icon={CampaignIcon} /> : (
        <Grid container spacing={2}>
          {announcements.map(a => (
            <Grid item xs={12} md={6} key={a._id}>
              <Card>
                <CardContent sx={{ p: 2.5 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                    <Typography variant="subtitle1" fontWeight={600} sx={{ flex: 1 }}>{a.title}</Typography>
                    <Chip label={a.priority} color={priorityColors[a.priority]} size="small" sx={{ ml: 1, textTransform: 'capitalize' }} />
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>{a.content}</Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1.5, display: 'block' }}>
                    By {a.author?.name} • {dayjs(a.createdAt).format('MMM D, YYYY')}
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
