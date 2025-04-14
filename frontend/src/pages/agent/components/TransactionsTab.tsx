import { useState, useEffect } from 'react';
import { 
  Box, 
  Paper, 
  Alert, 
  CircularProgress, 
  Typography, 
  Snackbar, 
  useTheme, 
  Button, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Divider,
  List,
  ListItem,
  ListItemText
} from '@mui/material';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import TransactionGrid from '../../../components/ui/common/TransactionGrid';
import SearchBar from '../../../components/ui/navigation/SearchBar';
import { transactionService } from '../../../services/transactionService';
import { clientService } from '../../../services/clientService';
import { Transaction } from '../../../types/Transaction';
import { useAuth } from 'react-oidc-context';

// Helper function to enrich transactions with client names
const enrichTransactionsWithClientNames = async (
  transactions: Transaction[], 
  auth: AuthContextProps
): Promise<Transaction[]> => {
  // Create a Set of unique client IDs to minimize API calls
  const clientIds = new Set(transactions.map(t => t.clientId));
  const clientMap = new Map();
  
  // Create a client data cache
  const clientDataCache: Record<number, any> = {};
  
  // Fetch client information for each unique client ID
  for (const clientId of clientIds) {
    try {
      const clientData = await clientService.getClientById(clientId, auth);
      
      // Store in cache
      clientDataCache[clientId] = clientData;
      
      if (clientData && clientData.firstName && clientData.lastName) {
        // Format the client name
        clientMap.set(clientId, `${clientData.firstName} ${clientData.lastName}`);
      } else {
        // Fallback to client ID if name not available
        clientMap.set(clientId, `Client #${clientId}`);
      }
    } catch (error) {
      console.error(`Error fetching client information for client ID ${clientId}:`, error);
      clientMap.set(clientId, `Client #${clientId}`);
    }
  }
  
  // Enrich transactions with client names
  return transactions.map(transaction => ({
    ...transaction,
    clientName: clientMap.get(transaction.clientId) || `Client #${transaction.clientId}`
  }));
};

// Helper function to format a date to a more readable form
const formatDate = (dateString: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export default function TransactionsTab() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isFetchingDaily, setIsFetchingDaily] = useState(false);
  const [fetchedTransactions, setFetchedTransactions] = useState<Transaction[]>([]);
  const [showFetchedDialog, setShowFetchedDialog] = useState(false);
  const auth = useAuth();
  const theme = useTheme();

  // Fetch transactions on component mount
  useEffect(() => {
    fetchTransactions();
  }, []);

  // Fetch transactions from the API
  const fetchTransactions = async () => {
    setLoading(true);
    try {
      if (auth.isAuthenticated) {
        const response = await transactionService.getAllTransactions(auth);
        console.log('API Response:', response);
        
        // Check if we got a valid response with the expected structure
        if (response && response.result === true && Array.isArray(response.data)) {
          // Extract the transaction data array from the response
          const fetchedTransactions = response.data;
          const enrichedTransactions = await enrichTransactionsWithClientNames(fetchedTransactions, auth);
          console.log('Enriched transactions:', enrichedTransactions);
          setTransactions(enrichedTransactions);
          setFilteredTransactions(enrichedTransactions);
          setError(null);
          
          // Show success message if provided
          if (response.errorMessage) {
            setSuccessMessage(response.errorMessage);
          }
        } else {
          // Handle unexpected response format
          console.error('Unexpected response format:', response);
          setError('Received an invalid response format from the server.');
          setTransactions([]);
          setFilteredTransactions([]);
        }
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

  // Handle daily fetch of transactions
  const handleDailyFetch = async () => {
    setIsFetchingDaily(true);
    setError(null);
    
    try {
      if (auth.isAuthenticated) {
        const response = await transactionService.dailyFetch(auth);
        console.log('Daily Fetch Response:', response);
        
        if (response && response.result === true) {
          // Get the newly fetched transactions
          const newTransactions = Array.isArray(response.data) ? response.data : [];
          
          if (newTransactions.length > 0) {
            // Store the fetched transactions for display in the dialog
            setFetchedTransactions(newTransactions);
            setShowFetchedDialog(true);
            
            // Update the main transactions list with the new transactions
            setTransactions(prevTransactions => {
              // Combine existing and new transactions, avoiding duplicates by ID
              const allTransactionsMap = new Map();
              
              // Add existing transactions to the map
              prevTransactions.forEach(transaction => {
                allTransactionsMap.set(transaction.id, transaction);
              });
              
              // Add or update with new transactions
              newTransactions.forEach(transaction => {
                allTransactionsMap.set(transaction.id, transaction);
              });
              
              // Convert map back to array
              return Array.from(allTransactionsMap.values());
            });
            
            // Update filtered transactions as well
            setFilteredTransactions(prevFiltered => {
              const allTransactionsMap = new Map();
              
              // Add existing filtered transactions
              prevFiltered.forEach(transaction => {
                allTransactionsMap.set(transaction.id, transaction);
              });
              
              // Add new transactions
              newTransactions.forEach(transaction => {
                allTransactionsMap.set(transaction.id, transaction);
              });
              
              return Array.from(allTransactionsMap.values());
            });
            
            setSuccessMessage(`Successfully fetched ${newTransactions.length} new transactions.`);
          } else {
            setSuccessMessage('No new transactions found.');
          }
        } else {
          // Handle error response
          setError(response?.errorMessage || 'Failed to fetch transactions.');
        }
      } else {
        setError('Authentication required. Please log in.');
      }
    } catch (err) {
      console.error('Error during daily fetch:', err);
      setError('Failed to fetch transactions. Please try again later.');
    } finally {
      setIsFetchingDaily(false);
    }
  };
  
  // Handle closing the fetched transactions dialog
  const handleCloseFetchedDialog = () => {
    setShowFetchedDialog(false);
  };
  
  return (
    <Box>
      {/* Page header with Daily Fetch button */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
            Transaction Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            View and manage all client transactions
          </Typography>
        </Box>
        
        <Button
          variant="contained"
          color="primary"
          onClick={handleDailyFetch}
          disabled={isFetchingDaily}
          sx={{ 
            height: 42, 
            px: 3,
            borderRadius: 2,
            boxShadow: theme.shadows[2]
          }}
        >
          {isFetchingDaily ? 'Fetching...' : 'Daily Fetch'}
        </Button>
      </Box>
      
      {/* Search Bar */}
      <SearchBar 
        onSearch={handleSearch}
        totalItems={filteredTransactions.length}
        showCreateButton={false}
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
            height: 'auto',
            minHeight: 500,
            bgcolor: 'transparent',
            border: `1px solid ${theme.palette.divider}`,
            boxShadow: theme.shadows[1]
          }}
        >
          <TransactionGrid
            rows={filteredTransactions.map(transaction => ({
              id: transaction.id.toString(),
              amount: `$${transaction.amount.toFixed(2)}`,
              type: transaction.transactionType === 'D' ? 'Deposit' : 'Withdrawal',
              status: transaction.status.charAt(0) + transaction.status.slice(1).toLowerCase(),
              date: formatDate(transaction.date),
              clientName: transaction.clientName || '',
              clientId: transaction.clientId.toString()
            }))}
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
      
      {/* Fetched Transactions Dialog */}
      <Dialog
        open={showFetchedDialog}
        onClose={handleCloseFetchedDialog}
        fullWidth
        maxWidth="md"
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: theme.shadows[10]
          }
        }}
      >
        <DialogTitle sx={{ 
          bgcolor: theme.palette.primary.main, 
          color: '#fff',
          px: 3,
          py: 2
        }}>
          <Typography variant="h6" component="div">
            Daily Transaction Fetch Results
          </Typography>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 3 }}>
          {fetchedTransactions.length > 0 ? (
            <>
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                {fetchedTransactions.length} new transactions fetched:
              </Typography>
              <List sx={{ maxHeight: 400, overflow: 'auto' }}>
                {fetchedTransactions.map((transaction) => (
                  <Box key={transaction.id}>
                    <ListItem>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="body1" component="span" sx={{ fontWeight: 'bold' }}>
                              {transaction.transactionType === 'D' ? 'Deposit' : 'Withdrawal'} - ${transaction.amount.toFixed(2)}
                            </Typography>
                            <Typography variant="body2" component="span">
                              ID: {transaction.id}
                            </Typography>
                          </Box>
                        }
                        secondary={
                          <Box sx={{ mt: 1 }}>
                            <Typography variant="body2" component="div">
                              Client ID: {transaction.clientId}
                              {transaction.clientName && ` - ${transaction.clientName}`}
                            </Typography>
                            <Typography variant="body2" component="div">
                              Date: {formatDate(transaction.date)} | Status: {transaction.status}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                    <Divider variant="fullWidth" component="li" />
                  </Box>
                ))}
              </List>
            </>
          ) : (
            <Typography variant="body1">No new transactions were fetched.</Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={handleCloseFetchedDialog} 
            variant="contained"
            color="primary"
            sx={{ borderRadius: 2 }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}