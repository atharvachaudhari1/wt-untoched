import { Box, Paper, Typography } from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';

const AuthLayout = ({ children }) => (
  <Box sx={{
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #FFF0F5 0%, #FCE4EC 50%, #F3E5F5 100%)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2,
  }}>
    <Box sx={{ width: '100%', maxWidth: 440 }}>
      {/* College branding */}
      <Box sx={{ textAlign: 'center', mb: 3 }}>
        <Box sx={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          width: 64, height: 64, borderRadius: '50%', bgcolor: 'primary.main', mb: 1.5,
          boxShadow: '0 8px 24px rgba(233,30,99,0.4)' }}>
          <SchoolIcon sx={{ color: 'white', fontSize: 32 }} />
        </Box>
        <Typography variant="h5" fontWeight={700} className="gradient-text">
          ECS Mentoring Portal
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Electronics & Computer Science Department
        </Typography>
      </Box>

      <Paper elevation={0} sx={{ p: 4, border: '1px solid rgba(233,30,99,0.12)', borderRadius: 3 }}>
        {children}
      </Paper>
    </Box>
  </Box>
);

export default AuthLayout;
