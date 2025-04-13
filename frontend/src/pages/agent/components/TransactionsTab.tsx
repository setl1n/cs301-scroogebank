import { useState, useEffect } from 'react';
import { Box, Container, Paper, Alert, CircularProgress, Typography, Snackbar } from '@mui/material';
import TransactionGrid from '../../../components/ui/common/TransactionGrid';
import SearchBar from '../../../components/ui/navigation/SearchBar';
import { transactionService } from '../../../services/transactionService';
import { Transaction } from '../../../types/Transaction';
import { useAuth } from 'react-oidc-context';

export default function TransactionsTab() {
  const [searchTerm, setSearchTerm] = useState('');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const auth = useAuth();

  // Fetch transactions on component mount
  useEffect(() => {
    fetchTransactions();
  }, []);

  // Fetch transactions from the API
  const fetchTransactions = async () => {
    setLoading(true);
    try {
      if (auth.isAuthenticated) {
        const fetchedTransactions = await transactionService.getAllTransactions(auth);
        setTransactions(fetchedTransactions);
        setFilteredTransactions(fetchedTransactions);
        setError(null);
      } else {
        setError('Authentication required. Please log in.');
        setTransactions([]);
        setFilteredTransactions([]);
      }
    } catch (err) {
      console.error('Error fetching transactions:', err);
      setError('Failed to load transactions. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle search across multiple columns
  const handleSearch = (term: string) => {
    setSearchTerm(term);
    
    if (!term.trim()) {
      // If search is empty, show all transactions
      setFilteredTransactions(transactions);
      return;
    }
    
    // Search across multiple fields
    const lowercasedTerm = term.toLowerCase();
    const filtered = transactions.filter(transaction => {
      return (
        // Search by ID
        transaction.id.toString().toLowerCase().includes(lowercasedTerm) ||
        // Search by amount (convert to string first)
        transaction.amount.toString().includes(lowercasedTerm) ||
        // Search by type
        transaction.transactionType.toLowerCase().includes(lowercasedTerm) ||
        // Search by status
        transaction.status.toLowerCase().includes(lowercasedTerm) ||
        // Search by client name (if available)
        (transaction.clientName && 
         transaction.clientName.toLowerCase().includes(lowercasedTerm)) ||
        // Search by client ID
        transaction.clientId.toString().toLowerCase().includes(lowercasedTerm) ||
        // Search by date
        transaction.date.includes(lowercasedTerm)
      );
    });
    
    setFilteredTransactions(filtered);
  };
  
  return (
    <Box>
      {/* Page header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
          Transaction Management
        </Typography>
        <Typography variant="body1" color="text.secondary">
          View and manage all client transactions
        </Typography>
      </Box>
      
      {/* Search Bar */}
      <SearchBar 
        onSearch={handleSearch}
        totalItems={filteredTransactions.length}
        showCreateButton={false} // No create button needed for transactions view
        searchPlaceholder="Search transactions by ID, amount, status..."
        title="Transactions"
        showCount={true}
      />
      
      {/* Error message */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
      )}
      
      {/* Loading indicator */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      )}
      
      {/* No transactions message */}
      {!loading && filteredTransactions.length === 0 && !error && (
        <Alert severity="info" sx={{ mb: 2 }}>
          No transactions found.
        </Alert>
      )}
      
      {/* Transactions Grid */}
      {!loading && filteredTransactions.length > 0 && (
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
            agentId={auth.user?.profile.sub || "unknown"}
            rows={filteredTransactions}
          />
        </Paper>
      )}

      {/* Success message snackbar */}
      <Snackbar 
        open={!!successMessage} 
        autoHideDuration={6000} 
        onClose={() => setSuccessMessage(null)}
      >
        <Alert severity="success" sx={{ width: '100%' }}>
          {successMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}