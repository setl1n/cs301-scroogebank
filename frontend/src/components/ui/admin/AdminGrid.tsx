import { useState, useEffect } from 'react';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { columns as baseColumns, rows as defaultRows } from './AdminData';
import { 
  useTheme, 
  alpha, 
  Box, 
  IconButton, 
  Tooltip, 
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
  Typography,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Chip,
  SelectChangeEvent
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

// Define the Account interface
interface Account {
  id: string;
  name: string;
  accountType: string;
  dateCreated: Date;
  status: string;
}

interface AdminGridProps {
  rows?: readonly any[]; // Accept custom rows prop with readonly
}

export default function AdminGrid({ rows = defaultRows }: AdminGridProps) {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  
  // State for the edit dialog
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [currentAccount, setCurrentAccount] = useState<Account | null>(null);
  const [accountData, setAccountData] = useState(rows);
  
  // Update account data when rows prop changes
  useEffect(() => {
    setAccountData(rows);
  }, [rows]);
  
  // Handle edit action
  const handleEdit = (id: string) => {
    const account = accountData.find(a => a.id === id);
    if (account) {
      setCurrentAccount(account as Account);
      setEditDialogOpen(true);
    }
  };
  
  // Handle delete action
  const handleDelete = (id: string) => {
    console.log(`Deleting account with ID: ${id}`);
    setAccountData(prevData => prevData.filter(account => account.id !== id));
  };
  
  // Handle dialog close
  const handleCloseEditDialog = () => {
    setEditDialogOpen(false);
    setCurrentAccount(null);
  };

  // Handle save changes
  const handleSaveAccount = () => {
    if (!currentAccount) return;
    
    setAccountData(prevAccounts => 
      prevAccounts.map(account => 
        account.id === currentAccount.id ? { ...account, ...currentAccount } : account
      )
    );
    
    handleCloseEditDialog();
  };

  // Handle form field changes
  const handleAccountChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }> | SelectChangeEvent<string>) => {
    if (!currentAccount) return;
    
    setCurrentAccount({
      ...currentAccount,
      [e.target.name as string]: e.target.value
    });
  };
  
  // Get status chip color
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'success';
      case 'pending': return 'warning';
      case 'inactive': return 'error';
      default: return 'default';
    }
  };
  
  // Get account type color
  const getAccountTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'admin': return 'primary';
      case 'agent': return 'secondary';
      case 'client': return 'info';
      default: return 'default';
    }
  };
  
  // Add actions column to the existing columns
  const columns: GridColDef[] = [
    ...baseColumns,
    // Override accountType column to show colored chips
    {
      field: 'accountType',
      headerName: 'Account Type',
      width: 150,
      renderCell: (params: GridRenderCellParams) => (
        <Chip 
          label={params.value as string}
          size="small"
          color={getAccountTypeColor(params.value as string)}
          sx={{ fontWeight: 600 }}
        />
      )
    },
    // Override status column to show colored chips
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      renderCell: (params: GridRenderCellParams) => (
        <Chip 
          label={params.value as string}
          size="small"
          color={getStatusColor(params.value as string)}
          variant="outlined"
        />
      )
    },
    // Actions column
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params: GridRenderCellParams) => (
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
          <Tooltip title="Edit account">
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                handleEdit(params.row.id.toString());
              }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete account">
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(params.row.id.toString());
              }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    }
  ];
  
  return (
    <>
      <DataGrid
        checkboxSelection
        rows={accountData}
        columns={columns}
        getRowClassName={(params) =>
          params.indexRelativeToCurrentPage % 2 === 0 ? 'even' : 'odd'
        }
        initialState={{
          pagination: { paginationModel: { pageSize: 10 } },
        }}
        pageSizeOptions={[5, 10, 25]}
        disableColumnResize
        density="compact"
        sx={{
          border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid rgba(0, 0, 0, 0.1)',
          borderRadius: 1,
          bgcolor: isDarkMode ? '#121212' : theme.palette.background.paper,
          color: isDarkMode ? 'white' : 'inherit',
          
          // Cell styling
          '& .MuiDataGrid-cell': {
            color: isDarkMode ? 'white' : 'inherit',
            borderBottom: isDarkMode
              ? '1px solid rgba(255, 255, 255, 0.1)'
              : `1px solid ${theme.palette.divider}`,
          },
          
          // Row styling
          '& .MuiDataGrid-row': {
            backgroundColor: isDarkMode 
              ? 'rgba(18, 18, 18, 0.4)'
              : 'inherit',
          },
          
          // Header styling
          '& .MuiDataGrid-columnHeaders': {
            backgroundColor: isDarkMode
              ? '#1e1e1e'
              : alpha(theme.palette.background.default, 0.4),
            color: isDarkMode ? 'white' : 'inherit',
          }
        }}
      />

      {/* Account Edit Dialog */}
      <Dialog 
        open={editDialogOpen} 
        onClose={handleCloseEditDialog}
        PaperProps={{
          sx: {
            bgcolor: theme.palette.mode === 'dark' ? '#1e1e1e' : 'background.paper',
            boxShadow: 24,
            minWidth: { xs: '80%', sm: 400 }
          }
        }}
      >
        <DialogTitle>
          Edit Account
          {currentAccount && (
            <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 0.5 }}>
              ID: {currentAccount.id}
            </Typography>
          )}
        </DialogTitle>
        
        <DialogContent dividers>
          {currentAccount && (
            <Stack spacing={3} sx={{ mt: 1 }}>
              <TextField
                label="Name"
                name="name"
                fullWidth
                value={currentAccount.name || ''}
                onChange={handleAccountChange}
                required
              />
              
              <FormControl fullWidth>
                <InputLabel id="account-type-label">Account Type</InputLabel>
                <Select
                  labelId="account-type-label"
                  id="account-type"
                  name="accountType"
                  value={currentAccount.accountType}
                  label="Account Type"
                  onChange={handleAccountChange}
                >
                  <MenuItem value="Admin">Admin</MenuItem>
                  <MenuItem value="Agent">Agent</MenuItem>
                  <MenuItem value="Client">Client</MenuItem>
                </Select>
              </FormControl>
              
              <FormControl fullWidth>
                <InputLabel id="status-label">Status</InputLabel>
                <Select
                  labelId="status-label"
                  id="status"
                  name="status"
                  value={currentAccount.status}
                  label="Status"
                  onChange={handleAccountChange}
                >
                  <MenuItem value="Active">Active</MenuItem>
                  <MenuItem value="Inactive">Inactive</MenuItem>
                  <MenuItem value="Pending">Pending</MenuItem>
                </Select>
              </FormControl>
            </Stack>
          )}
        </DialogContent>
        
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={handleCloseEditDialog}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleSaveAccount}
            color="primary"
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}