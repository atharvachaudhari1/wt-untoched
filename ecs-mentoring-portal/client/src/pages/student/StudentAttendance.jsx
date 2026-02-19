import { Box, Typography, Card, CardContent, Chip, Table, TableBody, TableCell, TableHead, TableRow, Paper, Grid } from '@mui/material';
import useAuth from '../../hooks/useAuth';
import useFetch from '../../hooks/useFetch';
import { getStudentAttendance } from '../../api/userApi';
import { getStudentAttendanceSummary } from '../../api/attendanceApi';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import dayjs from 'dayjs';

const statusColors = { present: 'success', absent: 'error', late: 'warning', excused: 'info' };

export default function StudentAttendance() {
  const { user } = useAuth();
  const { data: attData, loading: attLoading } = useFetch(() => getStudentAttendance(user._id), [user._id]);
  const { data: summaryData } = useFetch(() => getStudentAttendanceSummary(user._id), [user._id]);

  if (attLoading) return <LoadingSpinner />;
  const attendance = attData?.attendance || [];
  const summary = summaryData?.summary || {};

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} mb={3}>Attendance Record</Typography>

      {/* Summary cards */}
      <Grid container spacing={2} mb={3}>
        {[
          { label: 'Overall', value: `${summary.percentage || 0}%`, color: summary.percentage >= 75 ? '#4CAF50' : '#F44336' },
          { label: 'Present', value: summary.present || 0, color: '#4CAF50' },
          { label: 'Absent', value: summary.absent || 0, color: '#F44336' },
          { label: 'Late', value: summary.late || 0, color: '#FF9800' },
          { label: 'Total', value: summary.total || 0, color: '#2196F3' },
        ].map(({ label, value, color }) => (
          <Grid item xs={6} sm={4} md={2.4} key={label}>
            <Card>
              <CardContent sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h4" fontWeight={700} sx={{ color }}>{value}</Typography>
                <Typography variant="caption" color="text.secondary">{label}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {attendance.length === 0 ? <EmptyState title="No attendance records yet" /> : (
        <Paper sx={{ overflow: 'hidden' }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'rgba(233,30,99,0.04)' }}>
                <TableCell fontWeight={600}>Session</TableCell>
                <TableCell fontWeight={600}>Date</TableCell>
                <TableCell fontWeight={600}>Time</TableCell>
                <TableCell fontWeight={600}>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {attendance.map(a => (
                <TableRow key={a._id} hover>
                  <TableCell fontWeight={500}>{a.session?.title}</TableCell>
                  <TableCell>{dayjs(a.session?.date).format('MMM D, YYYY')}</TableCell>
                  <TableCell>{a.session?.startTime} – {a.session?.endTime}</TableCell>
                  <TableCell>
                    <Chip label={a.status} color={statusColors[a.status]} size="small" sx={{ textTransform: 'capitalize' }} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      )}
    </Box>
  );
}
