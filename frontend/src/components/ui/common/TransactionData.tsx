import { GridColDef, GridRowsProp } from '@mui/x-data-grid';

// Define column structure
export const columns: GridColDef[] = [
  { 
    field: 'id', 
    headerName: 'Transaction ID', 
    width: 180 
  },
  { 
    field: 'amount', 
    headerName: 'Amount', 
    width: 150,
    type: 'number',
  },
  { 
    field: 'type', 
    headerName: 'Type', 
    width: 150 
  },
  { 
    field: 'status', 
    headerName: 'Status', 
    width: 150 
  },
  { 
    field: 'date', 
    headerName: 'Date', 
    width: 180,
    type: 'dateTime'
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
  },
  { 
    field: 'agentId', 
    headerName: 'Agent ID', 
    width: 120
  }
];

// Sample transaction data with added agentId field
export const rows: GridRowsProp = [
  { 
    id: 'TRX-10025',
    amount: 5000.00,
    type: 'Deposit',
    status: 'Completed',
    date: new Date('2025-04-12T09:30:00'),
    clientName: 'John Smith',
    clientId: 'C001',
    agentId: 'G001'
  },
  { 
    id: 'TRX-10026',
    amount: 1200.50,
    type: 'Withdrawal',
    status: 'Completed',
    date: new Date('2025-04-12T10:15:00'),
    clientName: 'Sarah Johnson',
    clientId: 'C002',
    agentId: 'G001'
  },
  { 
    id: 'TRX-10027',
    amount: 3500.00,
    type: 'Deposit',
    status: 'Pending',
    date: new Date('2025-04-12T11:45:00'),
    clientName: 'Michael Chen',
    clientId: 'C003',
    agentId: 'G002'
  },
  { 
    id: 'TRX-10028',
    amount: 750.25,
    type: 'Withdrawal',
    status: 'Completed',
    date: new Date('2025-04-11T15:20:00'),
    clientName: 'Emma Davis',
    clientId: 'C004',
    agentId: 'G002'
  },
  { 
    id: 'TRX-10029',
    amount: 10000.00,
    type: 'Deposit',
    status: 'Completed',
    date: new Date('2025-04-11T16:05:00'),
    clientName: 'David Wilson',
    clientId: 'C005',
    agentId: 'G003'
  },
  { 
    id: 'TRX-10030',
    amount: 4500.00,
    type: 'Withdrawal',
    status: 'Rejected',
    date: new Date('2025-04-11T14:30:00'),
    clientName: 'Thomas Anderson',
    clientId: 'C006',
    agentId: 'G003'
  },
  { 
    id: 'TRX-10031',
    amount: 8750.00,
    type: 'Deposit',
    status: 'Pending',
    date: new Date('2025-04-10T10:00:00'),
    clientName: 'Lisa Garcia',
    clientId: 'C007',
    agentId: 'G004'
  },
  { 
    id: 'TRX-10032',
    amount: 1800.75,
    type: 'Withdrawal',
    status: 'Completed',
    date: new Date('2025-04-10T11:25:00'),
    clientName: 'Robert Brown',
    clientId: 'C008',
    agentId: 'G004'
  },
  { 
    id: 'TRX-10033',
    amount: 3250.50,
    type: 'Deposit',
    status: 'Completed',
    date: new Date('2025-04-09T13:40:00'),
    clientName: 'Jennifer Taylor',
    clientId: 'C009',
    agentId: 'G005'
  },
  { 
    id: 'TRX-10034',
    amount: 920.00,
    type: 'Withdrawal',
    status: 'Rejected',
    date: new Date('2025-04-09T15:15:00'),
    clientName: 'William Lee',
    clientId: 'C010',
    agentId: 'G005'
  },
  { 
    id: 'TRX-10035',
    amount: 6500.00,
    type: 'Deposit',
    status: 'Pending',
    date: new Date('2025-04-08T09:50:00'),
    clientName: 'Patricia Martinez',
    clientId: 'C011',
    agentId: 'G006'
  }
];