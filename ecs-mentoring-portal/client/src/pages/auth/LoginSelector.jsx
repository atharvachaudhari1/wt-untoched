import { useNavigate } from 'react-router-dom';
import { Box, Typography, Grid, Card, CardActionArea, CardContent } from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import PersonIcon from '@mui/icons-material/Person';
import FamilyRestroomIcon from '@mui/icons-material/FamilyRestroom';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import CastForEducationIcon from '@mui/icons-material/CastForEducation';

const roles = [
  { label: 'Student', path: '/login/student', icon: PersonIcon, color: '#2196F3', bg: '#E3F2FD', desc: 'Access your sessions, attendance & notes' },
  { label: 'Teacher / Mentor', path: '/login/teacher', icon: CastForEducationIcon, color: '#E91E63', bg: '#FCE4EC', desc: 'Manage students, sessions & attendance' },
  { label: 'Parent', path: '/login/parent', icon: FamilyRestroomIcon, color: '#4CAF50', bg: '#E8F5E9', desc: 'Monitor your child\'s academic progress' },
  { label: 'Admin', path: '/login/admin', icon: AdminPanelSettingsIcon, color: '#7C4DFF', bg: '#EDE7F6', desc: 'Full department management & analytics' },
];

export default function LoginSelector() {
  const navigate = useNavigate();
  return (
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #FFF0F5 0%, #FCE4EC 50%, #F3E5F5 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 3 }}>
      <Box sx={{ maxWidth: 640, width: '100%' }}>
        <Box sx={{ textAlign: 'center', mb: 5 }}>
          <Box sx={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 72, height: 72, borderRadius: '50%', bgcolor: 'primary.main', mb: 2, boxShadow: '0 8px 32px rgba(233,30,99,0.4)' }}>
            <SchoolIcon sx={{ color: 'white', fontSize: 36 }} />
          </Box>
          <Typography variant="h4" fontWeight={800} className="gradient-text">ECS Mentoring Portal</Typography>
          <Typography variant="h6" color="text.secondary" fontWeight={400} sx={{ mt: 0.5 }}>
            Electronics & Computer Science Department
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            National Engineering College • Academic Year 2025-26
          </Typography>
        </Box>

        <Typography variant="subtitle1" fontWeight={600} textAlign="center" color="text.secondary" mb={3}>
          Choose your role to login
        </Typography>

        <Grid container spacing={2}>
          {roles.map(({ label, path, icon: Icon, color, bg, desc }) => (
            <Grid item xs={12} sm={6} key={path}>
              <Card sx={{ border: `2px solid ${color}20`, '&:hover': { border: `2px solid ${color}`, transform: 'translateY(-2px)', boxShadow: `0 8px 24px ${color}30` }, transition: 'all 0.2s' }}>
                <CardActionArea onClick={() => navigate(path)} sx={{ p: 0.5 }}>
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box sx={{ width: 52, height: 52, borderRadius: 2, bgcolor: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Icon sx={{ color, fontSize: 28 }} />
                      </Box>
                      <Box>
                        <Typography variant="subtitle1" fontWeight={700}>{label}</Typography>
                        <Typography variant="caption" color="text.secondary">{desc}</Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
}
