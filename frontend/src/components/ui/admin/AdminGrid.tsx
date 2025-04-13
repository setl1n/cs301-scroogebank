import { useState, useEffect } from 'react';
import { DataGrid, GridColDef, GridRenderCellParams, GridRowModel, GridOverlay } from '@mui/x-data-grid';
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
import InboxIcon from '@mui/icons-material/Inbox';

// Define the Account interface
interface Account {
  id: string;
  name: string;
  accountType: string;
  dateCreated: Date;
  status: string;
}

interface AdminGridProps {
  rows?: readonly GridRowModel[]; // Use GridRowModel which is compatible with DataGrid
}

export default function AdminGrid({ rows = defaultRows }: AdminGridProps) {
  const theme = useTheme();
  
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
      renderCell: (params: GridRenderCellParams) => {
        const accountType = params.value as string;
        const chipColor = getAccountTypeColor(accountType);
        return (
          <Chip 
            label={accountType}
            size="small"
            color={chipColor}
            sx={{ 
              fontWeight: 600,
              color: theme.palette.mode === 'dark' && chipColor === 'default' 
                ? theme.palette.common.white 
                : undefined,
              py: 0.5, // Add vertical padding
              px: 0.25, // Add horizontal padding
              height: 'auto', // Allow chip to grow based on content
              '& .MuiChip-label': {
                px: 1.5, // More padding for the label
              }
            }}
          />
        );
      }
    },
    // Override status column to show colored chips
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      renderCell: (params: GridRenderCellParams) => {
        const status = params.value as string;
        const chipColor = getStatusColor(status);
        return (
          <Chip 
            label={status}
            size="small"
            color={chipColor}
            variant={theme.palette.mode === 'dark' ? 'filled' : 'outlined'}
            sx={{ 
              borderColor: theme.palette.mode === 'dark' ? 'transparent' : undefined,
              py: 0.5, // Add vertical padding
              px: 0.25, // Add horizontal padding
              height: 'auto', // Allow chip to grow based on content
              '& .MuiChip-label': {
                px: 1.5, // More padding for the label
                fontWeight: 500,
              }
            }}
          />
        );
      }
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
              sx={{ 
                color: theme.palette.mode === 'dark' ? 'rgb(161, 161, 170)' : theme.palette.text.secondary,
                '&:hover': {
                  backgroundColor: theme.palette.mode === 'dark' 
                    ? 'rgba(63, 63, 70, 0.5)' 
                    : alpha(theme.palette.primary.main, 0.08),
                  color: theme.palette.mode === 'dark' 
                    ? 'rgb(244, 244, 245)' 
                    : theme.palette.text.primary,
                }
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
              sx={{ 
                color: theme.palette.mode === 'dark' ? 'rgb(161, 161, 170)' : theme.palette.text.secondary,
                '&:hover': {
                  backgroundColor: theme.palette.mode === 'dark' 
                    ? 'rgba(239, 68, 68, 0.2)' 
                    : alpha(theme.palette.error.main, 0.08),
                  color: theme.palette.mode === 'dark' 
                    ? 'rgb(239, 68, 68)' 
                    : theme.palette.error.main,
                }
              }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    }
  ];
  
  // Custom No Rows Overlay
  function CustomNoRowsOverlay() {
    return (
      <GridOverlay
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          '& .ant-empty-img-1': {
            fill: theme.palette.mode === 'dark' ? '#262626' : '#f5f5f5',
          },
        }}
      >
        <Box sx={{ mt: 1, mb: 2 }}>
          <InboxIcon 
            sx={{ 
              fontSize: '3rem', 
              color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'
            }} 
          />
        </Box>
        <Typography variant="h6" color="text.secondary">
          No accounts to display
        </Typography>
      </GridOverlay>
    );
  }
  
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
        density="standard"
        rowHeight={52}
        columnHeaderHeight={56}
        disableRowSelectionOnClick
        slots={{
          noRowsOverlay: CustomNoRowsOverlay,
        }}
        sx={{
          // Border styling - matching dashboard zinc/slate styling
          border: 'none',
          borderRadius: 0,
          bgcolor: theme.palette.mode === 'dark' ? 'rgba(24, 24, 27, 0.9)' : '#fff',
          color: theme.palette.mode === 'dark' ? 'rgb(244, 244, 245)' : theme.palette.text.primary,
          
          // Cell styling
          '& .MuiDataGrid-cell': {
            color: theme.palette.mode === 'dark' ? 'rgb(244, 244, 245)' : theme.palette.text.primary,
            borderBottom: theme.palette.mode === 'dark' 
              ? '1px solid rgba(63, 63, 70, 0.5)' 
              : `1px solid ${theme.palette.divider}`,
            padding: '12px 16px',
            fontSize: '0.9rem',
          },
          
          // Row styling
          '& .MuiDataGrid-row': {
            backgroundColor: theme.palette.mode === 'dark' 
              ? 'rgba(24, 24, 27, 0.9)'
              : '#fff',
            '&:hover': {
              backgroundColor: theme.palette.mode === 'dark'
                ? 'rgba(39, 39, 42, 0.7)'
                : alpha(theme.palette.primary.main, 0.04),
            },
            '&.even': {
              backgroundColor: theme.palette.mode === 'dark' 
                ? 'rgba(39, 39, 42, 0.5)'
                : alpha(theme.palette.common.black, 0.02),
            },
            // Increase row height and spacing
            minHeight: '52px !important',
            '&.MuiDataGrid-row--lastVisible': {
              borderBottom: theme.palette.mode === 'dark'
                ? '1px solid rgba(63, 63, 70, 0.9)'
                : `1px solid ${theme.palette.divider}`,
            },
            // Better text rendering
            '& .MuiTypography-root, & .MuiChip-label': {
              color: theme.palette.mode === 'dark' ? 'rgb(244, 244, 245)' : 'inherit',
            }
          },
          
          // Header styling
          '& .MuiDataGrid-columnHeaders': {
            backgroundColor: theme.palette.mode === 'dark'
              ? 'rgba(39, 39, 42, 0.6)'
              : alpha(theme.palette.common.black, 0.02),
            color: theme.palette.mode === 'dark' ? 'rgb(161, 161, 170)' : theme.palette.text.secondary,
            borderBottom: theme.palette.mode === 'dark'
              ? '1px solid rgba(63, 63, 70, 0.9)'
              : `1px solid ${theme.palette.divider}`,
            fontWeight: 600,
            textTransform: 'uppercase',
            fontSize: '0.75rem',
            letterSpacing: '0.05em',
          },
          
          // Footer/pagination styling
          '& .MuiDataGrid-footerContainer': {
            borderTop: theme.palette.mode === 'dark'
              ? '1px solid rgba(63, 63, 70, 0.9)'
              : `1px solid ${theme.palette.divider}`,
            backgroundColor: theme.palette.mode === 'dark'
              ? 'rgba(39, 39, 42, 0.6)'
              : alpha(theme.palette.common.black, 0.02),
          },
          
          // Checkbox styling
          '& .MuiCheckbox-root': {
            color: theme.palette.mode === 'dark' ? 'rgb(161, 161, 170)' : undefined,
            '&.Mui-checked': {
              color: theme.palette.mode === 'dark' ? theme.palette.primary.light : undefined,
            }
          },
          
          // Column separator styling
          '& .MuiDataGrid-columnSeparator': {
            color: theme.palette.mode === 'dark' ? 'rgba(63, 63, 70, 0.5)' : theme.palette.divider,
          },
          
          // Selection styling
          '& .MuiDataGrid-selectedRowCount': {
            color: theme.palette.mode === 'dark' ? 'rgb(161, 161, 170)' : theme.palette.text.secondary,
          },
          
          // Pagination styling
          '& .MuiTablePagination-root': {
            color: theme.palette.mode === 'dark' ? 'rgb(161, 161, 170)' : theme.palette.text.secondary,
          },

          // No rows overlay
          '& .MuiDataGrid-overlay': {
            backgroundColor: 'transparent',
            color: theme.palette.mode === 'dark' ? 'rgb(161, 161, 170)' : theme.palette.text.secondary,
          }
        }}
      />

      {/* Account Edit Dialog */}
      <Dialog 
        open={editDialogOpen} 
        onClose={handleCloseEditDialog}
        PaperProps={{
          sx: {
            bgcolor: theme.palette.background.paper,
            boxShadow: theme.shadows[4],
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