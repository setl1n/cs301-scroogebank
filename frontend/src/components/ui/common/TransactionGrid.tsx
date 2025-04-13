import { useState, useEffect } from 'react';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { useTheme, alpha, Chip } from '@mui/material';
import { Transaction, formatTransactionType, formatTransactionStatus } from '../../../types/Transaction';

// Define column structure based on our Transaction model
const columns: GridColDef[] = [
  { 
    field: 'id', 
    headerName: 'Transaction ID', 
    width: 180,
    valueGetter: (params) => `TRX-${params.value}`
  },
  { 
    field: 'amount', 
    headerName: 'Amount', 
    width: 150,
    type: 'number',
    valueFormatter: (params) => {
      if (params.value == null) return '';
      return `$${params.value.toFixed(2)}`;
    }
  },
  { 
    field: 'transactionType', 
    headerName: 'Type', 
    width: 150,
    valueFormatter: (params) => formatTransactionType(params.value), 
    renderCell: (params) => {
      const type = params.value;
      return (
        <Chip 
          label={formatTransactionType(type)} 
          color={type === 'D' ? 'primary' : 'secondary'} 
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
    valueFormatter: (params) => formatTransactionStatus(params.value),
    renderCell: (params) => {
      const status = params.value;
      let color = 'default';
      
      switch (status) {
        case 'COMPLETED':
          color = 'success';
          break;
        case 'PENDING':
          color = 'warning';
          break;
        case 'FAILED':
          color = 'error';
          break;
      }
      
      return (
        <Chip 
          label={formatTransactionStatus(status)} 
          color={color as any} 
          size="small" 
        />
      );
    }
  },
  { 
    field: 'date', 
    headerName: 'Date', 
    width: 180,
    valueFormatter: (params) => {
      if (!params.value) return '';
      const date = new Date(params.value);
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
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
  rows: Transaction[];
  agentId?: string; // Agent ID for filtering
  loading?: boolean;
}

export default function TransactionGrid({ 
  rows,
  agentId,
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