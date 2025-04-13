import { useState } from 'react';
import { Container, Paper } from '@mui/material';
import TransactionGrid from '../../../components/ui/common/TransactionGrid';
import SearchBar from '../../../components/ui/navigation/SearchBar';
import { rows as transactionData } from '../../../components/ui/common/TransactionData';

// Define the transaction type that matches our API data
interface ApiTransaction {
  id: string;
  amount: number;
  type: string;
  status: string;
  date: string;
  clientName: string;
  clientId: string;
}

export default function TransactionsTab() {
  const [filteredTransactions, setFilteredTransactions] = useState<ApiTransaction[]>(transactionData as ApiTransaction[]);
  
  // Handle search across multiple columns
  const handleSearch = (term: string) => {
    if (!term.trim()) {
      // If search is empty, show all transactions
      setFilteredTransactions(transactionData as ApiTransaction[]);
      return;
    }
    
    // Search across multiple fields
    const lowercasedTerm = term.toLowerCase();
    const filtered = (transactionData as ApiTransaction[]).filter(transaction => {
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
        new Date(transaction.date).toLocaleDateString().includes(lowercasedTerm)
      );
    });
    setFilteredTransactions(filtered);
  };
  
  return (
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
  );
} 