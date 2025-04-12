import { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  alpha,
  InputBase,
  Button,
  Stack,
  IconButton,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  Tooltip,
  useTheme
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import ClearIcon from '@mui/icons-material/Clear';
import FilterListIcon from '@mui/icons-material/FilterList';
import DeleteIcon from '@mui/icons-material/Delete';
import NavBar from '../../components/ui/navigation/navbar';
import AppTheme from '../../components/ui/template/shared-theme/AppTheme';
import CssBaseline from '@mui/material/CssBaseline';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';

interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
}

export default function NewAgent() {
  const theme = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [selected, setSelected] = useState<string[]>([]);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [currentClient, setCurrentClient] = useState<Client | null>(null);
  
  // Mock data
  const [clients, setClients] = useState<Client[]>([
    { id: '1001', name: 'John Doe', email: 'john@example.com', phone: '555-1234' },
    { id: '1002', name: 'Jane Smith', email: 'jane@example.com', phone: '555-5678' },
    { id: '1003', name: 'Bob Johnson', email: 'bob@example.com' },
    { id: '1004', name: 'Alice Williams', email: 'alice@example.com', phone: '555-9012' },
    { id: '1005', name: 'Charlie Brown', email: 'charlie@example.com' },
  ]);
  
  // Filter clients based on search term
  const filteredClients = clients.filter(client => 
    client.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const handleCreateAccount = () => {
    console.log('Create account clicked');
  };

  const handleClearSearch = () => {
    setSearchTerm('');
  };
  
  const handleEditClient = (id: string) => {
    const client = clients.find(c => c.id === id);
    if (client) {
      setCurrentClient(client);
      setEditDialogOpen(true);
    }
  };
  
  const handleCloseEditDialog = () => {
    setEditDialogOpen(false);
    setCurrentClient(null);
  };

  const handleSaveClient = () => {
    if (!currentClient) return;
    
    // Here you would typically make an API call to update the client
    // For this demo we'll just update the local state
    setClients(prevClients => 
      prevClients.map(client => 
        client.id === currentClient.id ? currentClient : client
      )
    );
    
    handleCloseEditDialog();
  };

  const handleClientChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!currentClient) return;
    
    setCurrentClient({
      ...currentClient,
      [e.target.name]: e.target.value
    });
  };

  const handleDeleteClient = (id: string) => {
    // Remove the client from the list
    setClients(prevClients => prevClients.filter(client => client.id !== id));
    
    // Also remove from selection if selected
    setSelected(prev => prev.filter(selectedId => selectedId !== id));
  };

  // Selection handlers
  const isSelected = (id: string) => selected.indexOf(id) !== -1;
  
  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelected = filteredClients.map((n) => n.id);
      setSelected(newSelected);
      return;
    }
    setSelected([]);
  };
  
  const handleClick = (event: React.MouseEvent<unknown>, id: string) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected: string[] = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1),
      );
    }

    setSelected(newSelected);
  };
  
  return (
    <AppTheme>
      <CssBaseline enableColorScheme />
      <NavBar />
      
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 8,
          px: 2,
          mt: 'calc(var(--template-frame-height, 0px) + 64px)',
        }}
      >
        <Container maxWidth="lg">
          {/* Search bar and controls */}
          <Stack 
            direction="row" 
            spacing={2} 
            alignItems="center" 
            sx={{ mb: 3 }}
          >
            {/* Select all checkbox with Box wrapper */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: 42, // Match standard MUI button height
                width: 42, // Make it square for better visual balance
                borderRadius: 1.5,
                bgcolor: theme.palette.mode === 'dark' 
                  ? alpha(theme.palette.common.black, 0.6)
                  : alpha(theme.palette.background.paper, 0.6),
                border: '1px solid',
                borderColor: alpha(theme.palette.divider, 0.1),
              }}
            >
              <Checkbox
                indeterminate={selected.length > 0 && selected.length < filteredClients.length}
                checked={filteredClients.length > 0 && selected.length === filteredClients.length}
                onChange={handleSelectAllClick}
                inputProps={{ 'aria-label': 'select all clients' }}
              />
            </Box>
            
            {/* Search input */}
            <Paper
              sx={{
                p: '2px 4px',
                display: 'flex',
                alignItems: 'center',
                flex: 1,
                borderRadius: 2
              }}
              elevation={1}
            >
              <InputBase
                sx={{ ml: 2, flex: 1 }}
                placeholder="Search clients by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <IconButton size="small" onClick={handleClearSearch}>
                  <ClearIcon fontSize="small" />
                </IconButton>
              )}
              <Divider sx={{ height: 28, m: 0.5 }} orientation="vertical" />
              <IconButton sx={{ p: '10px' }}>
                <FilterListIcon />
              </IconButton>
            </Paper>

            {/* Create account button */}
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleCreateAccount}
            >
              Create Account
            </Button>
          </Stack>
          
          {/* Client table with enhanced dark theme styling */}
          <TableContainer 
            component={Paper} 
            elevation={0}
            sx={{ 
              borderRadius: 2,
              bgcolor: theme.palette.mode === 'dark' 
                ? '#121212' // True black background for dark mode
                : alpha(theme.palette.background.paper, 0.8),
              backdropFilter: 'blur(20px)',
              '& .MuiTableCell-root': {
                borderColor: theme.palette.mode === 'dark' 
                  ? alpha(theme.palette.divider, 0.3)  // Subtle borders in dark mode
                  : alpha(theme.palette.divider, 0.5),
                color: theme.palette.mode === 'dark' 
                  ? theme.palette.common.white 
                  : theme.palette.text.primary,
              },
              '& .MuiTableHead-root': {
                '& .MuiTableCell-root': {
                  backgroundColor: theme.palette.mode === 'dark'
                    ? '#1e1e1e'  // Slightly lighter than black for header
                    : alpha(theme.palette.background.default, 0.4),
                  fontWeight: 500,
                  color: theme.palette.mode === 'dark' 
                    ? alpha(theme.palette.common.white, 0.8)
                    : theme.palette.text.primary,
                }
              },
              '& .MuiCheckbox-root': {
                color: theme.palette.mode === 'dark'
                  ? alpha(theme.palette.common.white, 0.7)
                  : theme.palette.text.secondary,
              },
              '& .MuiTableRow-hover:hover': {
                backgroundColor: theme.palette.mode === 'dark'
                  ? alpha(theme.palette.common.white, 0.05)  // Subtle hover in dark mode
                  : alpha(theme.palette.action.hover, 0.1),
              }
            }}
          >
            <Table sx={{ minWidth: 650 }} aria-label="client table">
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox">
                    <Checkbox
                      color="primary"
                      indeterminate={selected.length > 0 && selected.length < filteredClients.length}
                      checked={filteredClients.length > 0 && selected.length === filteredClients.length}
                      onChange={handleSelectAllClick}
                      inputProps={{
                        'aria-label': 'select all clients',
                      }}
                    />
                  </TableCell>
                  <TableCell>ID</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredClients.length > 0 ? (
                  filteredClients.map((client) => {
                    const isItemSelected = isSelected(client.id);
                    
                    return (
                      <TableRow
                        hover
                        onClick={(event) => handleClick(event, client.id)}
                        role="checkbox"
                        aria-checked={isItemSelected}
                        tabIndex={-1}
                        key={client.id}
                        selected={isItemSelected}
                        sx={{ 
                          '&:last-child td, &:last-child th': { border: 0 },
                          '&.Mui-selected': {
                            backgroundColor: alpha(theme.palette.primary.main, 0.15),
                          },
                          '&.Mui-selected:hover': {
                            backgroundColor: alpha(theme.palette.primary.main, 0.25),
                          },
                        }}
                      >
                        <TableCell padding="checkbox">
                          <Checkbox
                            color="primary"
                            checked={isItemSelected}
                            inputProps={{
                              'aria-labelledby': `enhanced-table-checkbox-${client.id}`,
                            }}
                          />
                        </TableCell>
                        <TableCell sx={{ color: 'text.secondary' }}>{client.id}</TableCell>
                        <TableCell component="th" scope="row" id={`enhanced-table-checkbox-${client.id}`}>
                          <Typography variant="body1" fontWeight="medium">
                            {client.name}
                          </Typography>
                        </TableCell>
                        <TableCell>{client.email}</TableCell>
                        <TableCell align="right">
                          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                            <Tooltip title="Edit client">
                              <IconButton
                                aria-label={`edit ${client.name}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditClient(client.id);
                                }}
                                size="small"
                                color="primary"
                                sx={{
                                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                                  '&:hover': {
                                    backgroundColor: alpha(theme.palette.primary.main, 0.2),
                                  }
                                }}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete client">
                              <IconButton
                                aria-label={`delete ${client.name}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteClient(client.id);
                                }}
                                size="small"
                                color="error"
                                sx={{
                                  backgroundColor: alpha(theme.palette.error.main, 0.1),
                                  '&:hover': {
                                    backgroundColor: alpha(theme.palette.error.main, 0.2),
                                  }
                                }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                      <Typography variant="h6" color="text.secondary">
                        No clients found
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Try adjusting your search or create a new client account
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            {filteredClients.length > 0 && (
              <Box sx={{ p: 2, borderTop: '1px solid', borderColor: alpha(theme.palette.divider, 0.5) }}>
                <Typography variant="caption" color="text.secondary">
                  {selected.length} of {filteredClients.length} selected
                </Typography>
              </Box>
            )}
          </TableContainer>
        </Container>
      </Box>

      {/* Client Edit Dialog */}
      <Dialog 
        open={editDialogOpen} 
        onClose={handleCloseEditDialog}
        PaperProps={{
          sx: {
            bgcolor: theme.palette.mode === 'dark' ? '#1e1e1e' : 'background.paper',
            borderRadius: 2,
            boxShadow: 24,
            minWidth: { xs: '80%', sm: 400 }
          }
        }}
      >
        <DialogTitle>
          Edit Client
          {currentClient && (
            <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 0.5 }}>
              ID: {currentClient.id}
            </Typography>
          )}
        </DialogTitle>
        
        <DialogContent dividers>
          {currentClient && (
            <Stack spacing={3} sx={{ mt: 1 }}>
              <TextField
                label="Name"
                name="name"
                fullWidth
                value={currentClient.name || ''}
                onChange={handleClientChange}
                required
              />
              <TextField
                label="Email"
                name="email"
                type="email"
                fullWidth
                value={currentClient.email || ''}
                onChange={handleClientChange}
              />
              <TextField
                label="Phone"
                name="phone"
                fullWidth
                value={currentClient.phone || ''}
                onChange={handleClientChange}
              />
            </Stack>
          )}
        </DialogContent>
        
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={handleCloseEditDialog}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleSaveClient}
            color="primary"
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </AppTheme>
  );
}