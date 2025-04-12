import { GridColDef, GridRowsProp } from '@mui/x-data-grid';

// Define the columns
export const columns: GridColDef[] = [
  { 
    field: 'id', 
    headerName: 'ID', 
    width: 100 
  },
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
    field: 'agentId',
    headerName: 'Agent ID',
    width: 120,
    // Hide this column by default, mainly used for filtering
    hide: true,
  },
  { 
    field: 'timestamp', 
    headerName: 'Time', 
    width: 160,
    type: 'dateTime',
  }
];

// Sample activity data with agentId added
export const rows: GridRowsProp = [
  { 
    id: '1',
    activityType: 'Account Created',
    description: 'New client account was created',
    clientId: 'C001',
    clientName: 'John Smith',
    agentId: 'G001',
    timestamp: new Date('2025-04-12T14:32:00')
  },
  { 
    id: '2',
    activityType: 'Profile Updated',
    description: 'Client details were updated',
    clientId: 'C003',
    clientName: 'Michael Chen',
    agentId: 'G002',
    timestamp: new Date('2025-04-12T11:27:00')
  },
  { 
    id: '3',
    activityType: 'Transaction Processed',
    description: 'New transaction was processed',
    clientId: 'C005',
    clientName: 'Emma Davis',
    agentId: 'G001',
    timestamp: new Date('2025-04-11T16:45:00')
  },
  { 
    id: '4',
    activityType: 'Account Created',
    description: 'New client account was created',
    clientId: 'C008',
    clientName: 'Thomas Anderson',
    agentId: 'G003',
    timestamp: new Date('2025-04-11T10:11:00')
  },
  { 
    id: '5',
    activityType: 'Document Uploaded',
    description: 'New document was uploaded',
    clientId: 'C002',
    clientName: 'Sarah Johnson',
    agentId: 'G002',
    timestamp: new Date('2025-04-10T15:38:00')
  },
  { 
    id: '6',
    activityType: 'Status Change',
    description: 'Account status was changed to active',
    clientId: 'C004',
    clientName: 'David Wilson',
    agentId: 'G003',
    timestamp: new Date('2025-04-10T09:22:00')
  },
  { 
    id: '7',
    activityType: 'Profile Updated',
    description: 'Client contact information was updated',
    clientId: 'C007',
    clientName: 'Lisa Garcia',
    agentId: 'G001',
    timestamp: new Date('2025-04-09T14:17:00')
  },
  { 
    id: '8',
    activityType: 'Transaction Processed',
    description: 'Deposit transaction was processed',
    clientId: 'C006',
    clientName: 'Robert Brown',
    agentId: 'G002',
    timestamp: new Date('2025-04-09T11:05:00')
  }
];