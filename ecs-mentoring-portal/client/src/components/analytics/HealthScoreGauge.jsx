import { Box, Typography } from '@mui/material';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

const getColor = (score) => {
  if (score >= 75) return '#4CAF50';
  if (score >= 50) return '#FF9800';
  if (score >= 25) return '#FF5722';
  return '#F44336';
};

const getLabel = (score) => {
  if (score >= 75) return 'Excellent';
  if (score >= 50) return 'Good';
  if (score >= 25) return 'Needs Attention';
  return 'At Risk';
};

const HealthScoreGauge = ({ score = 0, size = 120, showLabel = true }) => {
  const color = getColor(score);
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
      <Box sx={{ width: size, height: size }}>
        <CircularProgressbar
          value={score}
          text={`${score}`}
          styles={buildStyles({
            textColor: color,
            pathColor: color,
            trailColor: '#f0f0f0',
            textSize: '24px',
          })}
        />
      </Box>
      {showLabel && (
        <Box>
          <Typography variant="caption" fontWeight={600} sx={{ color }}>
            {getLabel(score)}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>
            Health Score
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default HealthScoreGauge;
