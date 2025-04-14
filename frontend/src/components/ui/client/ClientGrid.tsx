import { 
  DataGrid, 
  GridColDef, 
  GridRenderCellParams,
  GridToolbar,
} from '@mui/x-data-grid';
import { Client } from '../../../types/Client';
import { IconButton, Box, Typography, Tooltip } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
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
  const pageSize = 10;

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
      valueGetter: (_, row) => {
        const client = row as Client;
        
        // Capitalize first letter of first name and last name
        const firstName = client.firstName ? client.firstName.charAt(0).toUpperCase() + client.firstName.slice(1) : '';
        const lastName = client.lastName ? client.lastName.charAt(0).toUpperCase() + client.lastName.slice(1) : '';
        
        return `${firstName} ${lastName}`.trim();
      },
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
      renderCell: (params: GridRenderCellParams) => {
        const row = params.row as Client | undefined;
        if (!row) return null;
        
        return (
          <Tooltip title={`${row.address}, ${row.city}, ${row.state} ${row.postalCode}, ${row.country}`}>
            <Typography variant="body2" noWrap>
              {row.address}, {row.city}
            </Typography>
          </Tooltip>
        );
      }
    },
    { 
      field: 'actions', 
      headerName: 'Actions', 
      width: 180,
      sortable: false,
      filterable: false,
      renderCell: (params: GridRenderCellParams) => {
        const row = params.row as Client | undefined;
        if (!row) return null;
        
        return (
          <Box>
            {onEdit && (
              <Tooltip title="Edit Client">
                <IconButton 
                  color="primary" 
                  size="small"
                  onClick={() => onEdit(row)}
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
                  onClick={() => onRequestImageUpload(row.clientId)}
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
                  onClick={() => onDelete(row.clientId)}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        );
      }
    }
  ];

  return (
    <DataGrid
      rows={rows}
      columns={columns}
      getRowId={(row) => row.clientId}
      pagination
      initialState={{
        pagination: {
          paginationModel: { pageSize, page: 0 },
        },
      }}
      pageSizeOptions={[5, 10, 20, 50]}
      disableRowSelectionOnClick
      autoHeight
      loading={loading}
      slots={{
        toolbar: GridToolbar,
      }}
      slotProps={{
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