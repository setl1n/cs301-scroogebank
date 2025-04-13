import { useState, useEffect } from 'react';
import { Box, Typography, Alert, Snackbar, Paper, useTheme } from '@mui/material';
import ClientGrid from '../../../components/ui/client/ClientGrid';
import SearchBar from '../../../components/ui/navigation/SearchBar';
import { clientService } from '../../../services/clientService';
import { Client } from '../../../types/Client';
import { useAuth } from 'react-oidc-context';

export default function ClientsTab() {
  const [clients, setClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const auth = useAuth();
  const theme = useTheme();
  
  // Fetch clients on component mount
  useEffect(() => {
    fetchClients();
  }, []);

  // Fetch clients from the API
  const fetchClients = async () => {
    setLoading(true);
    try {
      if (auth.isAuthenticated) {
        const fetchedClients = await clientService.getAllClients(auth);
        console.log("fetchedClients", fetchedClients);
        setClients(fetchedClients);
        setFilteredClients(fetchedClients);
        setError(null);
      } else {
        setError('Authentication required. Please log in.');
        setClients([]);
        setFilteredClients([]);
      }
    } catch (err) {
      console.error('Error fetching clients:', err);
      setError('Failed to load clients. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle search across multiple columns
  const handleSearch = (term: string) => {
    if (!term.trim()) {
      // If search is empty, show all clients
      setFilteredClients(clients);
      return;
    }
    
    // Search across multiple fields
    const lowercasedTerm = term.toLowerCase();
    const filtered = clients.filter(client => {
      return (
        // Search by ID
        client.clientId.toString().toLowerCase().includes(lowercasedTerm) ||
        // Search by name
        client.firstName.toLowerCase().includes(lowercasedTerm) ||
        client.lastName.toLowerCase().includes(lowercasedTerm) ||
        // Search by email
        client.emailAddress.toLowerCase().includes(lowercasedTerm) ||
        // Search by phone
        client.phoneNumber.toLowerCase().includes(lowercasedTerm) ||
        // Search by address
        client.address.toLowerCase().includes(lowercasedTerm) ||
        client.city.toLowerCase().includes(lowercasedTerm) ||
        client.state.toLowerCase().includes(lowercasedTerm) ||
        client.country.toLowerCase().includes(lowercasedTerm) ||
        client.postalCode.toLowerCase().includes(lowercasedTerm)
      );
    });
    
    setFilteredClients(filtered);
  };
  
  const handleCreateClient = () => {
    console.log('Create client clicked');
    // Implement client creation logic - typically would show a modal or navigate to a form
  };

  const handleEditClient = (client: Client) => {
    console.log('Edit client:', client);
    // Implement edit logic - typically would show a modal with form
  };

  const handleDeleteClient = async (clientId: number) => {
    if (window.confirm('Are you sure you want to delete this client?')) {
      try {
        if (auth.isAuthenticated) {
          await clientService.deleteClient(clientId, auth);
          setClients(clients.filter(client => client.clientId !== clientId));
          setFilteredClients(filteredClients.filter(client => client.clientId !== clientId));
          setSuccessMessage('Client deleted successfully');
        } else {
          setError('Authentication required to delete clients.');
        }
      } catch (err) {
        console.error('Error deleting client:', err);
        setError('Failed to delete client. Please try again.');
      }
    }
  };

  const handleRequestImageUpload = async (clientId: number) => {
    try {
      if (auth.isAuthenticated) {
        await clientService.requestImageUpload(clientId, auth);
        setSuccessMessage('Image upload link sent to client email');
      } else {
        setError('Authentication required to request image uploads.');
      }
    } catch (err) {
      console.error('Error requesting image upload:', err);
      setError('Failed to request image upload. Please try again.');
    }
  };
  
  return (
    <Box>
      {/* Page header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
          Client Management
        </Typography>
        <Typography variant="body1" color="text.secondary">
          View and manage your assigned clients
        </Typography>
      </Box>

      {/* Search Bar */}
      <SearchBar 
        onSearch={handleSearch}
        onCreateAction={handleCreateClient}
        totalItems={filteredClients.length}
        createButtonText="Add Client"
        searchPlaceholder="Search clients by name, email, phone..."
        title="Clients"
        showCount={true}
      />
      
      {/* Error message */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
      )}
      
      {/* Client Grid */}
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
        <ClientGrid 
          rows={filteredClients}
          onEdit={handleEditClient}
          onDelete={handleDeleteClient}
          onRequestImageUpload={handleRequestImageUpload}
          loading={loading}
        />
      </Paper>

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