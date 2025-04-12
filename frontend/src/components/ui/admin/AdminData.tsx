import { GridColDef, GridRowsProp } from '@mui/x-data-grid';

// Define the columns
export const columns: GridColDef[] = [
  { 
    field: 'id', 
    headerName: 'ID', 
    width: 100 
  },
  { 
    field: 'name', 
    headerName: 'Name', 
    width: 200,
    flex: 1
  },
  { 
    field: 'accountType', 
    headerName: 'Account Type', 
    width: 150 
  },
  { 
    field: 'dateCreated', 
    headerName: 'Created On', 
    width: 180,
    type: 'dateTime'
  },
  { 
    field: 'status', 
    headerName: 'Status', 
    width: 120 
  }
];

// Sample admin data
export const rows: GridRowsProp = [
  { 
    id: 'A001',
    name: 'John Adams',
    accountType: 'Admin',
    dateCreated: new Date('2025-01-15'),
    status: 'Active'
  },
  { 
    id: 'A002',
    name: 'Sarah Miller',
    accountType: 'Admin',
    dateCreated: new Date('2025-02-03'),
    status: 'Active'
  },
  { 
    id: 'G001',
    name: 'Michael Chen',
    accountType: 'Agent',
    dateCreated: new Date('2025-02-18'),
    status: 'Active'
  },
  { 
    id: 'G002',
    name: 'Emily Wilson',
    accountType: 'Agent',
    dateCreated: new Date('2025-03-05'),
    status: 'Active'
  },
  { 
    id: 'G003',
    name: 'Robert Brown',
    accountType: 'Agent',
    dateCreated: new Date('2025-03-22'),
    status: 'Inactive'
  },
  { 
    id: 'C001',
    name: 'David Thompson',
    accountType: 'Client',
    dateCreated: new Date('2025-03-10'),
    status: 'Active'
  },
  { 
    id: 'C002',
    name: 'Lisa Garcia',
    accountType: 'Client',
    dateCreated: new Date('2025-03-15'),
    status: 'Active'
  },
  { 
    id: 'C003',
    name: 'James Wilson',
    accountType: 'Client',
    dateCreated: new Date('2025-04-01'),
    status: 'Pending'
  },
  { 
    id: 'C004',
    name: 'Jennifer Taylor',
    accountType: 'Client',
    dateCreated: new Date('2025-04-05'),
    status: 'Active'
  },
  { 
    id: 'C005',
    name: 'Thomas Anderson',
    accountType: 'Client',
    dateCreated: new Date('2025-04-10'),
    status: 'Inactive'
  }
];