import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from '@mui/material';

const ConfirmDialog = ({ open, title = 'Confirm', message, onConfirm, onCancel, confirmLabel = 'Confirm', confirmColor = 'error' }) => (
  <Dialog open={open} onClose={onCancel} maxWidth="xs" fullWidth>
    <DialogTitle fontWeight={600}>{title}</DialogTitle>
    <DialogContent>
      <Typography>{message}</Typography>
    </DialogContent>
    <DialogActions sx={{ p: 2, gap: 1 }}>
      <Button onClick={onCancel} variant="outlined" color="inherit">Cancel</Button>
      <Button onClick={onConfirm} variant="contained" color={confirmColor}>{confirmLabel}</Button>
    </DialogActions>
  </Dialog>
);

export default ConfirmDialog;
