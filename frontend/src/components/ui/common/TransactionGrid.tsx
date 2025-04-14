import { useTheme, alpha, Chip } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';

// API transaction interface that matches our data structure
interface ApiTransaction {
  id: string;
  amount: string; // Changed from number to string since we're formatting in TransactionsTab
  type: string;
  status: string;
  date: string;
  clientName: string;
  clientId: string;
}

// Define column structure based on the API transaction model
const columns: GridColDef[] = [
  { 
    field: 'id', 
    headerName: 'Transaction ID', 
    width: 180,
  },
  { 
    field: 'amount', 
    headerName: 'Amount', 
    width: 150,
    // No valueFormatter needed since we're already formatting in TransactionsTab
  },
  { 
    field: 'type', 
    headerName: 'Type', 
    width: 150,
    renderCell: (params) => {
      const type = String(params.value);
      return (
        <Chip 
          label={type} 
          color={type === 'Deposit' ? 'primary' : 'secondary'} 
          variant="outlined" 
          size="small" 
        />
      );
    }
  },
  { 
    field: 'status', 
    headerName: 'Status', 
    width: 150,
    renderCell: (params) => {
      const status = String(params.value);
      let color: 'success' | 'warning' | 'error' | 'default' = 'default';
      
      if (status === 'Completed') {
        color = 'success';
      } else if (status === 'Pending') {
        color = 'warning';
      } else if (status === 'Failed') {
        color = 'error';
      }
      
      return (
        <Chip 
          label={status} 
          color={color} 
          size="small" 
        />
      );
    }
  },
  { 
    field: 'date', 
    headerName: 'Date', 
    width: 180,
    // No valueFormatter needed since we're already formatting in TransactionsTab
  },
  { 
    field: 'clientName', 
    headerName: 'Client', 
    width: 200
  },
  { 
    field: 'clientId', 
    headerName: 'Client ID', 
    width: 120
  }
];

interface TransactionGridProps {
  rows: ApiTransaction[];
  loading?: boolean;
}

export default function TransactionGrid({ 
  rows,
  loading = false
}: TransactionGridProps) {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  
  return (
    <DataGrid
      rows={rows}
      columns={columns}
      loading={loading}
      initialState={{
        pagination: { paginationModel: { pageSize: 10 } },
        sorting: {
          sortModel: [{ field: 'date', sort: 'desc' }]
        }
      }}
      pageSizeOptions={[5, 10, 25]}
      disableRowSelectionOnClick
      disableColumnMenu
      getRowClassName={(params) =>
        params.indexRelativeToCurrentPage % 2 === 0 ? 'even' : 'odd'
      }
      getRowId={(row) => row.id} // Ensure unique ID for each row
      sx={{
        border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid rgba(0, 0, 0, 0.1)',
        borderRadius: 1,
        bgcolor: isDarkMode ? '#121212' : 'background.paper',
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
          color: isDarkMode ? 'white' : 'inherit',
        },
        
        // Header styling
        '& .MuiDataGrid-columnHeaders': {
          backgroundColor: isDarkMode
            ? '#1e1e1e'
            : alpha(theme.palette.background.default, 0.4),
          color: isDarkMode ? 'white' : 'inherit',
        },
      }}
    />
  );
}