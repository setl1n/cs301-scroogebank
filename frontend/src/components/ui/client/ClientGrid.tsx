import { useState } from 'react';
import { 
  DataGrid, 
  GridColDef, 
  GridValueGetterParams,
  GridRenderCellParams,
  GridToolbar
} from '@mui/x-data-grid';
import { Client, formatClientName } from '../../../types/Client';
import { IconButton, Box, Chip, Typography, Tooltip } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import EmailIcon from '@mui/icons-material/Email';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';

interface ClientGridProps {
  rows: Client[];
  onEdit?: (client: Client) => void;
  onDelete?: (clientId: number) => void;
  onRequestImageUpload?: (clientId: number) => void;
  loading?: boolean;
}

export default function ClientGrid({ 
  rows, 
  onEdit, 
  onDelete, 
  onRequestImageUpload,
  loading = false 
}: ClientGridProps) {
  const [pageSize, setPageSize] = useState<number>(10);

  const columns: GridColDef[] = [
    { 
      field: 'clientId', 
      headerName: 'ID', 
      width: 90,
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="body2" fontWeight="medium">
          {params.value}
        </Typography>
      )
    },
    { 
      field: 'fullName', 
      headerName: 'Full Name', 
      width: 200,
      valueGetter: (params: GridValueGetterParams) => formatClientName(params.row),
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="body2" fontWeight="medium">
          {params.value}
        </Typography>
      )
    },
    { 
      field: 'emailAddress', 
      headerName: 'Email', 
      width: 200,
      renderCell: (params: GridRenderCellParams) => (
        <Tooltip title={params.value}>
          <Typography variant="body2" noWrap>
            {params.value}
          </Typography>
        </Tooltip>
      )
    },
    { 
      field: 'phoneNumber', 
      headerName: 'Phone', 
      width: 150
    },
    { 
      field: 'address', 
      headerName: 'Address', 
      width: 250,
      renderCell: (params: GridRenderCellParams) => (
        <Tooltip title={`${params.row.address}, ${params.row.city}, ${params.row.state} ${params.row.postalCode}, ${params.row.country}`}>
          <Typography variant="body2" noWrap>
            {params.row.address}, {params.row.city}
          </Typography>
        </Tooltip>
      )
    },
    { 
      field: 'actions', 
      headerName: 'Actions', 
      width: 180,
      sortable: false,
      filterable: false,
      renderCell: (params: GridRenderCellParams) => (
        <Box>
          {onEdit && (
            <Tooltip title="Edit Client">
              <IconButton 
                color="primary" 
                size="small"
                onClick={() => onEdit(params.row)}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          
          {onRequestImageUpload && (
            <Tooltip title="Request ID Upload">
              <IconButton 
                color="secondary" 
                size="small"
                onClick={() => onRequestImageUpload(params.row.clientId)}
              >
                <PhotoCameraIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          
          {onDelete && (
            <Tooltip title="Delete Client">
              <IconButton 
                color="error" 
                size="small"
                onClick={() => onDelete(params.row.clientId)}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      )
    }
  ];

  return (
    <DataGrid
      rows={rows}
      columns={columns}
      getRowId={(row) => row.clientId}
      pagination
      pageSize={pageSize}
      onPageSizeChange={setPageSize}
      rowsPerPageOptions={[5, 10, 20, 50]}
      disableSelectionOnClick
      autoHeight
      loading={loading}
      components={{
        Toolbar: GridToolbar,
      }}
      componentsProps={{
        toolbar: {
          showQuickFilter: true,
          quickFilterProps: { debounceMs: 500 },
        },
      }}
      sx={{
        '& .MuiDataGrid-cell:focus': {
          outline: 'none',
        },
        '& .MuiDataGrid-row:hover': {
          backgroundColor: 'rgba(0, 0, 0, 0.04)',
        },
      }}
    />
  );
} 