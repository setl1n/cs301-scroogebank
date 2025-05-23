import { useState, useEffect, useCallback } from 'react';
import { 
  Box, 
  Typography, 
  Alert, 
  Snackbar, 
  Paper, 
  useTheme, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button,
  Card,
  CardMedia,
  CardContent,
  IconButton,
  CircularProgress,
  Divider
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DownloadIcon from '@mui/icons-material/Download';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ClientGrid from '../../../components/ui/client/ClientGrid';
import SearchBar from '../../../components/ui/navigation/SearchBar';
import { clientService } from '../../../services/clientService';
import verificationService from '../../../services/verificationService';
import type { VerificationDocument } from '../../../services/verificationService';
import { Client } from '../../../types/Client';
import { useAuth } from 'react-oidc-context';
import ClientForm from './ClientForm';

export default function ClientsTab() {
  const [clients, setClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [openClientForm, setOpenClientForm] = useState(false);
  const [openDocumentViewer, setOpenDocumentViewer] = useState(false);
  const [currentClientId, setCurrentClientId] = useState<number | null>(null);
  const [currentClientEmail, setCurrentClientEmail] = useState<string>('');
  const [verificationDocuments, setVerificationDocuments] = useState<VerificationDocument[]>([]);
  const [loadingDocuments, setLoadingDocuments] = useState(false);
  const [documentError, setDocumentError] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [approvingClient, setApprovingClient] = useState(false);
  const auth = useAuth();
  const theme = useTheme();
  
  // Fetch clients from the API
  const fetchClients = useCallback(async () => {
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
  }, [auth]);
  
  // Fetch clients on component mount
  useEffect(() => {
    fetchClients();
  }, [fetchClients]);
  
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
    setOpenClientForm(true);
  };

  const handleCloseClientForm = () => {
    setOpenClientForm(false);
  };

  const handleSaveClient = async (client: Omit<Client, 'clientId'>) => {
    try {
      if (auth.isAuthenticated) {
        const newClient = await clientService.createClient(client, auth);
        setClients([...clients, newClient]);
        setFilteredClients([...filteredClients, newClient]);
        setSuccessMessage('Client created successfully');
        setOpenClientForm(false);
      } else {
        setError('Authentication required to create clients.');
      }
    } catch (err) {
      console.error('Error creating client:', err);
      setError('Failed to create client. Please try again.');
    }
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
    // Clear any existing error messages before starting
    setError(null);
    
    try {
      if (auth.isAuthenticated) {
        console.log(`Requesting image upload for client ID: ${clientId}`);
        const response = await clientService.requestImageUpload(clientId, auth);
        console.log("Request successful:", response);
        
        // Set success message and ensure error is null
        setSuccessMessage('Image upload link sent to client email');
        setError(null);
      } else {
        setError('Authentication required to request image uploads.');
      }
    } catch (err) {
      console.error('Error requesting image upload:', err);
      setError('Failed to request image upload. Please try again.');
      // Clear any existing success message
      setSuccessMessage(null);
    }
  };

  // Handler for viewing verification documents
  const handleViewVerificationDocuments = async (clientId: number, clientEmail: string) => {
    setCurrentClientId(clientId);
    setCurrentClientEmail(clientEmail);
    setOpenDocumentViewer(true);
    setLoadingDocuments(true);
    setDocumentError(null);
    
    try {
      // Use our verification service to get documents instead of mock data
      const documents = await verificationService.getClientDocuments(clientEmail, auth);
      setVerificationDocuments(documents);
    } catch (err) {
      console.error('Error fetching verification documents:', err);
      setDocumentError('Failed to load verification documents. Please try again later.');
    } finally {
      setLoadingDocuments(false);
    }
  };

  const handleCloseDocumentViewer = () => {
    setOpenDocumentViewer(false);
    setCurrentClientId(null);
    setVerificationDocuments([]);
  };

  const handleDownloadDocument = (document: VerificationDocument) => {
    // Create a temporary anchor element to download the file
    const link = window.document.createElement('a');
    link.href = document.url;
    link.download = document.fileName;
    window.document.body.appendChild(link);
    link.click();
    window.document.body.removeChild(link);
  };

  // Find the client by ID
  const getCurrentClient = () => {
    return clients.find(client => client.clientId === currentClientId);
  };

  // Handler for approving a client
  const handleApproveClient = async () => {
    if (!currentClientId) return;
    
    setApprovingClient(true);
    try {
      if (auth.isAuthenticated) {
        // Update client with verification status
        await clientService.updateClient(
          currentClientId, 
          { verificationStatus: 'APPROVED' }, 
          auth
        );
        
        // Update the client in the local state
        const updatedClients = clients.map(client => 
          client.clientId === currentClientId 
            ? { ...client, verificationStatus: 'APPROVED' } 
            : client
        );
        
        setClients(updatedClients);
        setFilteredClients(updatedClients);
        setSuccessMessage(`Client ${getCurrentClient()?.firstName} ${getCurrentClient()?.lastName} has been approved`);
        setOpenDocumentViewer(false);
      } else {
        setError('Authentication required to approve clients.');
      }
    } catch (err) {
      console.error('Error approving client:', err);
      setError('Failed to approve client. Please try again.');
    } finally {
      setApprovingClient(false);
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
          onViewVerificationDocuments={handleViewVerificationDocuments}
          loading={loading}
        />
      </Paper>

      {/* Client Form Dialog */}
      <Dialog 
        open={openClientForm} 
        onClose={handleCloseClientForm}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Add New Client</DialogTitle>
        <DialogContent>
          <ClientForm onSubmit={handleSaveClient} />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseClientForm}>Cancel</Button>
        </DialogActions>
      </Dialog>

      {/* Verification Documents Dialog */}
      <Dialog
        open={openDocumentViewer}
        onClose={handleCloseDocumentViewer}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            overflow: 'hidden'
          }
        }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2 }}>
          <Box>
            <Typography variant="h6">
              Verification Documents
            </Typography>
            {getCurrentClient() && (
              <Typography variant="subtitle1" color="text.secondary">
                {getCurrentClient()?.firstName} {getCurrentClient()?.lastName} - {currentClientEmail}
              </Typography>
            )}
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Button
              variant="contained"
              color="success"
              startIcon={<CheckCircleIcon />}
              onClick={handleApproveClient}
              disabled={approvingClient || loadingDocuments || verificationDocuments.length === 0}
              sx={{ mr: 2 }}
            >
              {approvingClient ? 'Approving...' : 'Approve Client'}
            </Button>
            <IconButton onClick={handleCloseDocumentViewer} aria-label="close">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        
        <Divider />
        
        <DialogContent sx={{ p: 0 }}>
          {loadingDocuments ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
              <CircularProgress />
            </Box>
          ) : documentError ? (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Alert severity="error">{documentError}</Alert>
            </Box>
          ) : verificationDocuments.length === 0 ? (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="body1" color="text.secondary">
                No verification documents found for this client.
              </Typography>
            </Box>
          ) : (
            <Box sx={{ padding: 2, display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              {verificationDocuments
                .filter(doc => {
                  if (selectedFilter === 'all') return true;
                  if (selectedFilter === 'image') return doc.fileType.startsWith('image/');
                  if (selectedFilter === 'pdf') return doc.fileType === 'application/pdf';
                  return true;
                })
                .map((document) => (
                  <Box key={document.id} sx={{ width: { xs: '100%', sm: '50%', md: '33.33%' }, padding: 1 }}>
                    <Card sx={{ 
                      height: '100%', 
                      display: 'flex', 
                      flexDirection: 'column',
                      borderRadius: 2,
                      transition: 'all 0.2s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: theme.shadows[4],
                      }
                    }}>
                      {document.fileType.startsWith('image/') ? (
                        <CardMedia
                          component="img"
                          height="140"
                          image={document.url}
                          alt={document.fileName}
                          sx={{ objectFit: 'cover' }}
                        />
                      ) : (
                        <Box sx={{ 
                          height: 140, 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          bgcolor: 'grey.100' 
                        }}>
                          <Typography variant="body2" color="text.secondary">
                            PDF Document
                          </Typography>
                        </Box>
                      )}
                      <CardContent sx={{ 
                        flexGrow: 1,
                        display: 'flex', 
                        flexDirection: 'column',
                        justifyContent: 'space-between'
                      }}>
                        <Box>
                          <Typography variant="subtitle1" component="div" noWrap>
                            {document.fileName}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Uploaded: {new Date(document.uploadDate).toLocaleDateString()}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                          <Button 
                            size="small" 
                            variant="outlined"
                            href={document.url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            View
                          </Button>
                          <IconButton 
                            size="small" 
                            onClick={() => handleDownloadDocument(document)}
                            color="primary"
                          >
                            <DownloadIcon />
                          </IconButton>
                        </Box>
                      </CardContent>
                    </Card>
                  </Box>
                ))}
            </Box>
          )}
        </DialogContent>
      </Dialog>

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

      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Documents</Typography>
        <Box sx={{ ml: 'auto' }}>
          <Button
            variant="outlined"
            size="small"
            onClick={() => setSelectedFilter('all')}
            color={selectedFilter === 'all' ? 'primary' : 'inherit'}
            sx={{ mr: 1 }}
          >
            All
          </Button>
          <Button
            variant="outlined"
            size="small"
            onClick={() => setSelectedFilter('image')}
            color={selectedFilter === 'image' ? 'primary' : 'inherit'}
            sx={{ mr: 1 }}
          >
            Images
          </Button>
          <Button
            variant="outlined"
            size="small"
            onClick={() => setSelectedFilter('pdf')}
            color={selectedFilter === 'pdf' ? 'primary' : 'inherit'}
          >
            PDFs
          </Button>
        </Box>
      </Box>
    </Box>
  );
}