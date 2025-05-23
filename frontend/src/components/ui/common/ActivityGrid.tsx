import { useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { useTheme, alpha } from '@mui/material';
import { columns, rows as defaultRows } from './ActivityData';

interface ActivityGridProps {
  rows?: readonly any[];
  agentId?: string; // Add optional agentId for filtering
}

export default function ActivityGrid({ 
  rows = defaultRows, 
  agentId 
}: ActivityGridProps) {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  
  // Debug the incoming data
  useEffect(() => {
    if (agentId) {
      console.log("Activity Grid - Agent ID received:", agentId);
      console.log("Activity Grid - Sample row:", rows[0]);
      console.log("Activity Grid - Total rows before filtering:", rows.length);
    }
  }, [agentId, rows]);
  
  // Filter rows by agentId if provided
  const filteredRows = agentId 
    ? rows.filter(row => {
        // Check if agentId exists and convert both to strings for comparison
        return row.agentId !== undefined && 
               String(row.agentId).toLowerCase() === String(agentId).toLowerCase();
      })
    : rows;
  
  // Debug the filtered results
  useEffect(() => {
    if (agentId) {
      console.log("Activity Grid - Rows after filtering:", filteredRows.length);
    }
  }, [filteredRows, agentId]);
  
  return (
    <DataGrid
      rows={filteredRows}
      columns={columns}
      initialState={{
        pagination: { paginationModel: { pageSize: 10 } },
        sorting: {
          sortModel: [{ field: 'timestamp', sort: 'desc' }]
        }
      }}
      pageSizeOptions={[5, 10, 25]}
      disableRowSelectionOnClick
      disableColumnMenu
      getRowClassName={(params) =>
        params.indexRelativeToCurrentPage % 2 === 0 ? 'even' : 'odd'
      }
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
        
        // Override MUI's default focus outline
        '&.MuiDataGrid-root:focus-within': {
          outline: 'none',
          border: isDarkMode 
            ? '1px solid rgba(255, 255, 255, 0.3)' 
            : '1px solid rgba(0, 0, 0, 0.2)',
        },
      }}
    />
  );
}