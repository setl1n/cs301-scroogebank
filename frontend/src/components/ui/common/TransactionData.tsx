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
    width: 200,
    flex: 1
  }
];

// Sample transaction data
export const rows: GridRowsProp = [
  { 
    id: 'TRX-10025',
    amount: 5000.00,
    type: 'Deposit',
    status: 'Completed',
    date: new Date('2025-04-12T09:30:00'),
    clientName: 'John Smith'
  },
  { 
    id: 'TRX-10026',
    amount: 1200.50,
    type: 'Withdrawal',
    status: 'Completed',
    date: new Date('2025-04-12T10:15:00'),
    clientName: 'Sarah Johnson'
  },
  { 
    id: 'TRX-10027',
    amount: 3500.00,
    type: 'Deposit',
    status: 'Pending',
    date: new Date('2025-04-12T11:45:00'),
    clientName: 'Michael Chen'
  },
  { 
    id: 'TRX-10028',
    amount: 750.25,
    type: 'Withdrawal',
    status: 'Completed',
    date: new Date('2025-04-11T15:20:00'),
    clientName: 'Emma Davis'
  },
  { 
    id: 'TRX-10029',
    amount: 10000.00,
    type: 'Deposit',
    status: 'Completed',
    date: new Date('2025-04-11T16:05:00'),
    clientName: 'David Wilson'
  },
  { 
    id: 'TRX-10030',
    amount: 4500.00,
    type: 'Withdrawal',
    status: 'Rejected',
    date: new Date('2025-04-11T14:30:00'),
    clientName: 'Thomas Anderson'
  },
  { 
    id: 'TRX-10031',
    amount: 8750.00,
    type: 'Deposit',
    status: 'Pending',
    date: new Date('2025-04-10T10:00:00'),
    clientName: 'Lisa Garcia'
  },
  { 
    id: 'TRX-10032',
    amount: 1800.75,
    type: 'Withdrawal',
    status: 'Completed',
    date: new Date('2025-04-10T11:25:00'),
    clientName: 'Robert Brown'
  },
  { 
    id: 'TRX-10033',
    amount: 3250.50,
    type: 'Deposit',
    status: 'Completed',
    date: new Date('2025-04-09T13:40:00'),
    clientName: 'Jennifer Taylor'
  },
  { 
    id: 'TRX-10034',
    amount: 920.00,
    type: 'Withdrawal',
    status: 'Rejected',
    date: new Date('2025-04-09T15:15:00'),
    clientName: 'William Lee'
  },
  { 
    id: 'TRX-10035',
    amount: 6500.00,
    type: 'Deposit',
    status: 'Pending',
    date: new Date('2025-04-08T09:50:00'),
    clientName: 'Patricia Martinez'
  }
];