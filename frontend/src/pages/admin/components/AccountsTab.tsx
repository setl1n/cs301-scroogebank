import { useState } from 'react';
import { Paper, useTheme, Box } from '@mui/material';
import AdminGrid from '../../../components/ui/admin/AdminGrid';
import SearchBar from '../../../components/ui/navigation/SearchBar';
import { rows as adminData } from '../../../components/ui/admin/AdminData';

export default function AccountsTab() {
  const [filteredAccounts, setFilteredAccounts] = useState(adminData);
  const theme = useTheme();
  
  // Handle search across multiple columns
  const handleSearch = (term: string) => {
    if (!term.trim()) {
      // If search is empty, show all accounts
      setFilteredAccounts(adminData);
      return;
    }
    
    // Search across multiple fields
    const lowercasedTerm = term.toLowerCase();
    const filtered = adminData.filter(account => {
      return (
        // Search by ID
        account.id.toString().toLowerCase().includes(lowercasedTerm) ||
        // Search by name
        account.name.toLowerCase().includes(lowercasedTerm) ||
        // Search by account type
        account.accountType.toLowerCase().includes(lowercasedTerm) ||
        // Search by status
        account.status.toLowerCase().includes(lowercasedTerm) ||
        // Search by date (convert to string)
        (account.dateCreated && 
          account.dateCreated.toLocaleDateString().includes(lowercasedTerm))
      );
    });
    
    setFilteredAccounts(filtered);
  };
  
  const handleCreateAccount = () => {
    console.log('Create account clicked');
    // Implement account creation logic here
  };
  
  return (
    <Box sx={{ width: '100%', px: { xs: 1, sm: 2, md: 3 } }}>
      {/* Search Bar */}
      <SearchBar 
        onSearch={handleSearch}
        onCreateAction={handleCreateAccount}
        totalItems={filteredAccounts.length}
        createButtonText="Create Account"
        searchPlaceholder="Search by name, ID, account type..."
        title="System Accounts"
        showCount={true}
      />
      
      {/* Admin Grid */}
      <Paper 
        elevation={0}
        sx={{ 
          borderRadius: 1, // Less rounded corners
          overflow: 'hidden',
          height: { xs: 450, sm: 500, md: 500 }, // Responsive height
          bgcolor: theme.palette.mode === 'dark' ? 'rgba(24, 24, 27, 0.9)' : 'transparent', // Match the dashboard dark bg
          border: theme.palette.mode === 'dark' ? '1px solid rgba(63, 63, 70, 0.9)' : '1px solid rgba(0, 0, 0, 0.1)',
          boxShadow: theme.palette.mode === 'dark' ? 'none' : theme.shadows[1],
          mt: 2, // Add margin top to match spacing
        }}
      >
        <AdminGrid rows={filteredAccounts} />
      </Paper>
    </Box>
  );
} 