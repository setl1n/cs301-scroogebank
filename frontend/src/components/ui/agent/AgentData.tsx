import { GridRowsProp, GridColDef } from '@mui/x-data-grid';
// Define column structure - only ID and Agent Name
export const columns: GridColDef[] = [
  { 
    field: 'id', 
    headerName: 'ID', 
    width: 100,
  },
  { 
    field: 'agentName', 
    headerName: 'Agent Name', 
    width: 250,
    flex: 1,
  }
];

// Sample data with only id and agentName fields
export const rows: GridRowsProp = [
  { id: '1001', agentName: 'John Smith' },
  { id: '1002', agentName: 'Sarah Johnson' },
  { id: '1003', agentName: 'Michael Chen' },
  { id: '1004', agentName: 'David Wilson' },
  { id: '1005', agentName: 'Emma Davis' },
  { id: '1006', agentName: 'Robert Brown' },
  { id: '1007', agentName: 'Lisa Garcia' },
  { id: '1008', agentName: 'Thomas Anderson' },
  { id: '1009', agentName: 'Patricia Martinez' },
  { id: '1010', agentName: 'James Rodriguez' },
  { id: '1011', agentName: 'Jennifer Taylor' },
  { id: '1012', agentName: 'William Lee' },
  { id: '1013', agentName: 'Elizabeth Clark' },
  { id: '1014', agentName: 'Daniel White' },
  { id: '1015', agentName: 'Mary Harris' },
  { id: '1016', agentName: 'Matthew Young' },
  { id: '1017', agentName: 'Nancy King' },
  { id: '1018', agentName: 'Steven Baker' },
  { id: '1019', agentName: 'Karen Scott' },
  { id: '1020', agentName: 'Edward Adams' },
  { id: '1021', agentName: 'Helen Campbell' },
  { id: '1022', agentName: 'Brian Mitchell' },
  { id: '1023', agentName: 'Susan Parker' },
  { id: '1024', agentName: 'George Evans' },
  { id: '1025', agentName: 'Amanda Stewart' },
];