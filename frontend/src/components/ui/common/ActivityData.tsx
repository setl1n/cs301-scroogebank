import { GridColDef, GridRowsProp } from '@mui/x-data-grid';

// Define the column structure
export const columns: GridColDef[] = [
  { 
    field: 'activityType', 
    headerName: 'Activity', 
    width: 180,
  },
  { 
    field: 'description', 
    headerName: 'Description', 
    width: 250,
    flex: 1,
  },
  { 
    field: 'clientId', 
    headerName: 'Client ID', 
    width: 120,
  },
  { 
    field: 'clientName', 
    headerName: 'Client Name', 
    width: 180,
  },
  { 
    field: 'timestamp', 
    headerName: 'Time', 
    width: 160,
    type: 'dateTime',
  }
];

// Sample activity data
export const rows: GridRowsProp = [
  { 
    id: '1',
    activityType: 'Account Created',
    description: 'New client account was created',
    clientId: '1001',
    clientName: 'John Smith',
    timestamp: new Date('2025-04-12T14:32:00')
  },
  { 
    id: '2',
    activityType: 'Profile Updated',
    description: 'Client details were updated',
    clientId: '1003',
    clientName: 'Michael Chen',
    timestamp: new Date('2025-04-12T11:27:00')
  },
  { 
    id: '3',
    activityType: 'Transaction Processed',
    description: 'New transaction was processed',
    clientId: '1005',
    clientName: 'Emma Davis',
    timestamp: new Date('2025-04-11T16:45:00')
  },
  { 
    id: '4',
    activityType: 'Account Created',
    description: 'New client account was created',
    clientId: '1008',
    clientName: 'Thomas Anderson',
    timestamp: new Date('2025-04-11T10:11:00')
  },
  { 
    id: '5',
    activityType: 'Document Uploaded',
    description: 'New document was uploaded',
    clientId: '1002',
    clientName: 'Sarah Johnson',
    timestamp: new Date('2025-04-10T15:38:00')
  },
  { 
    id: '6',
    activityType: 'Status Change',
    description: 'Account status was changed to active',
    clientId: '1004',
    clientName: 'David Wilson',
    timestamp: new Date('2025-04-10T09:22:00')
  },
  { 
    id: '7',
    activityType: 'Profile Updated',
    description: 'Client contact information was updated',
    clientId: '1007',
    clientName: 'Lisa Garcia',
    timestamp: new Date('2025-04-09T14:17:00')
  },
  { 
    id: '8',
    activityType: 'Transaction Processed',
    description: 'Deposit transaction was processed',
    clientId: '1006',
    clientName: 'Robert Brown',
    timestamp: new Date('2025-04-09T11:05:00')
  }
];