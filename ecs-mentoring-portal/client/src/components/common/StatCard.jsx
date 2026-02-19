import { Card, CardContent, Box, Typography } from '@mui/material';

const StatCard = ({ title, value, subtitle, icon: Icon, color = '#E91E63', trend }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
            {title}
          </Typography>
          <Typography variant="h3" fontWeight={700} sx={{ color, mt: 0.5 }}>{value}</Typography>
          {subtitle && <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>{subtitle}</Typography>}
        </Box>
        {Icon && (
          <Box sx={{ width: 52, height: 52, borderRadius: 2, bgcolor: `${color}15`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icon sx={{ color, fontSize: 26 }} />
          </Box>
        )}
      </Box>
    </CardContent>
  </Card>
);

export default StatCard;
