import { Box, Typography } from '@mui/material';
import InboxIcon from '@mui/icons-material/Inbox';

const EmptyState = ({ title = 'No data found', description = '', icon: Icon = InboxIcon }) => (
  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 8, gap: 1.5, color: 'text.secondary' }}>
    <Icon sx={{ fontSize: 56, opacity: 0.3 }} />
    <Typography variant="h6" fontWeight={600}>{title}</Typography>
    {description && <Typography variant="body2" textAlign="center" maxWidth={360}>{description}</Typography>}
  </Box>
);

export default EmptyState;
