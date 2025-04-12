import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
  Typography
} from '@mui/material';

interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
}

interface EditClientProps {
  open: boolean;
  onClose: () => void;
  client: Client;
}

export default function EditClient({ open, onClose, client }: EditClientProps) {
  // In a real implementation, you would:
  // 1. Use form state (useState or react-hook-form)
  // 2. Add validation
  // 3. Handle API calls to update the client
  
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    console.log('Would update client:', client);
    onClose();
  };
  
  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle>
        Edit Client
      </DialogTitle>
      
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Stack spacing={3}>
            <Typography variant="caption" color="text.secondary">
              Client ID: {client.id}
            </Typography>
            
            <TextField
              label="Name"
              fullWidth
              defaultValue={client.name}
              required
              autoFocus
            />
            
            <TextField
              label="Email"
              type="email"
              fullWidth
              defaultValue={client.email || ''}
            />
            
            <TextField
              label="Phone"
              fullWidth
              defaultValue={client.phone || ''}
            />
          </Stack>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained">Save Changes</Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}