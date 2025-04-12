import { useState } from 'react';
import { Box, Container, Paper } from '@mui/material';
import NavBar from '../../components/ui/navigation/NavBar';
import AppTheme from '../../components/ui/template/shared-theme/AppTheme';
import CssBaseline from '@mui/material/CssBaseline';
import TransactionGrid from '../../components/ui/common/TransactionGrid';
import SearchBar from '../../components/ui/navigation/SearchBar';
import { rows as transactionData } from '../../components/ui/common/TransactionData';

export default function NewAgentTransactions() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredTransactions, setFilteredTransactions] = useState(transactionData);
  
  // Handle search across multiple columns
  const handleSearch = (term: string) => {
    setSearchTerm(term);
    
    if (!term.trim()) {
      // If search is empty, show all transactions
      setFilteredTransactions(transactionData);
      return;
    }
    
    // Search across multiple fields
    const lowercasedTerm = term.toLowerCase();
    const filtered = transactionData.filter(transaction => {
      return (
        // Search by ID
        transaction.id.toLowerCase().includes(lowercasedTerm) ||
        // Search by amount (convert to string first)
        transaction.amount.toString().includes(lowercasedTerm) ||
        // Search by type
        transaction.type.toLowerCase().includes(lowercasedTerm) ||
        // Search by status
        transaction.status.toLowerCase().includes(lowercasedTerm) ||
        // Search by client name
        transaction.clientName.toLowerCase().includes(lowercasedTerm) ||
        // Search by date (formatted as string)
        transaction.date.toLocaleDateString().includes(lowercasedTerm)
      );
    });
    
    setFilteredTransactions(filtered);
  };
  
  return (
    <AppTheme>
      <CssBaseline enableColorScheme />
      <NavBar />
      
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 8,
          px: 2,
          mt: 'calc(var(--template-frame-height, 0px) + 64px)',
        }}
      >
        <Container maxWidth="lg">
          {/* Search Bar */}
          <SearchBar 
            onSearch={handleSearch}
            totalItems={filteredTransactions.length}
            showCreateButton={false} // No create button needed for transactions view
            searchPlaceholder="Search transactions by ID, amount, status..."
            title="Transactions"
            showCount={true}
          />
          
          {/* Transactions Grid */}
          <Paper 
            elevation={0}
            sx={{ 
              borderRadius: 2,
              overflow: 'hidden',
              height: 600, // Taller than other grids to show more transactions
              bgcolor: 'transparent'
            }}
          >
            <TransactionGrid 
              rows={filteredTransactions}
            />
          </Paper>
        </Container>
      </Box>
    </AppTheme>
  );
}