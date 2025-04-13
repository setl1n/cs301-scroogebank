import { useState } from 'react';
import { Box, Container, Paper } from '@mui/material';
import AdminGrid from '../../../components/ui/admin/AdminGrid';
import SearchBar from '../../../components/ui/navigation/SearchBar';
import { rows as adminData } from '../../../components/ui/admin/AdminData';

export default function AccountsTab() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredAccounts, setFilteredAccounts] = useState(adminData);
  
  // Handle search across multiple columns
  const handleSearch = (term: string) => {
    setSearchTerm(term);
    
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
    <Container maxWidth="lg">
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
          borderRadius: 2,
          overflow: 'hidden',
          height: 500, // Fixed height for the grid
          bgcolor: 'transparent'
        }}
      >
        <AdminGrid rows={filteredAccounts} />
      </Paper>
    </Container>
  );
} 