import { useState, useEffect } from 'react';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { columns as baseColumns, rows as defaultRows } from './AgentData';
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
  Typography
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

// Define the Agent interface based on your data structure
interface Agent {
  id: string;
  agentName: string;
  // Add other fields if needed
}

interface CustomizedDataGridProps {
  rows?: readonly any[]; // Accept custom rows prop with readonly
}

export default function AgentGrid({ rows = defaultRows }: CustomizedDataGridProps) {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  
  // State for the edit dialog
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [currentAgent, setCurrentAgent] = useState<Agent | null>(null);
  const [agentData, setAgentData] = useState(rows);
  
  // Update agent data when rows prop changes
  useEffect(() => {
    setAgentData(rows);
  }, [rows]);
  
  // Handle edit action
  const handleEdit = (id: string) => {
    const agent = agentData.find(a => a.id === id);
    if (agent) {
      setCurrentAgent(agent as Agent);
      setEditDialogOpen(true);
    }
  };
  
  // Handle delete action
  const handleDelete = (id: string) => {
    console.log(`Deleting row with ID: ${id}`);
    setAgentData(prevData => prevData.filter(agent => agent.id !== id));
  };
  
  // Handle dialog close
  const handleCloseEditDialog = () => {
    setEditDialogOpen(false);
    setCurrentAgent(null);
  };

  // Handle save changes
  const handleSaveAgent = () => {
    if (!currentAgent) return;
    
    setAgentData(prevAgents => 
      prevAgents.map(agent => 
        agent.id === currentAgent.id ? { ...agent, ...currentAgent } : agent
      )
    );
    
    handleCloseEditDialog();
  };

  // Handle form field changes
  const handleAgentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!currentAgent) return;
    
    setCurrentAgent({
      ...currentAgent,
      [e.target.name]: e.target.value
    });
  };
  
  // Add actions column to the existing columns
  const columns: GridColDef[] = [
    ...baseColumns,
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
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1}}>
          <Tooltip title="Edit agent">
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
          <Tooltip title="Delete agent">
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
        rows={agentData}
        columns={columns}
        getRowClassName={(params) =>
          params.indexRelativeToCurrentPage % 2 === 0 ? 'even' : 'odd'
        }
        initialState={{
          pagination: { paginationModel: { pageSize: 20 } },
        }}
        pageSizeOptions={[10, 20, 50]}
        disableColumnResize
        density="compact"
        slotProps={{
          filterPanel: {
            filterFormProps: {
              logicOperatorInputProps: {
                variant: 'outlined',
                size: 'small',
              },
              columnInputProps: {
                variant: 'outlined',
                size: 'small',
                sx: { mt: 'auto' },
              },
              operatorInputProps: {
                variant: 'outlined',
                size: 'small',
                sx: { mt: 'auto' },
              },
              valueInputProps: {
                InputComponentProps: {
                  variant: 'outlined',
                  size: 'small',
                },
              },
            },
          },
        }}
        sx={{
          border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid rgba(0, 0, 0, 0.1)',
          borderRadius: 1,
          bgcolor: isDarkMode ? '#121212' : theme.palette.background.paper,
          
          // Make buttons visible on dark mode rows
          '& .MuiDataGrid-cell': {
            color: isDarkMode ? 'white' : 'inherit',
            borderBottom: isDarkMode
              ? '1px solid rgba(255, 255, 255, 0.1)'
              : `1px solid ${theme.palette.divider}`,
          },
          
          // Row styling
          '& .MuiDataGrid-row': {
            color: isDarkMode ? 'white' : 'inherit',
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

      {/* Agent Edit Dialog */}
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
          Edit Agent
          {currentAgent && (
            <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 0.5 }}>
              ID: {currentAgent.id}
            </Typography>
          )}
        </DialogTitle>
        
        <DialogContent dividers>
          {currentAgent && (
            <Stack spacing={3} sx={{ mt: 1 }}>
              <TextField
                label="Agent Name"
                name="agentName"
                fullWidth
                value={currentAgent.agentName || ''}
                onChange={handleAgentChange}
                required
              />
              {/* Add more fields as needed */}
            </Stack>
          )}
        </DialogContent>
        
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={handleCloseEditDialog}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleSaveAgent}
            color="primary"
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}