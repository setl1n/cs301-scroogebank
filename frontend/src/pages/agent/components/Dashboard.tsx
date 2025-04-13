import { useState, useEffect } from 'react';
import { Box, Container, Paper, Typography, Stack } from '@mui/material';
import AppTheme from '../../../components/ui/template/shared-theme/AppTheme';
import CssBaseline from '@mui/material/CssBaseline';
import ActivityGrid from '../../../components/ui/common/ActivityGrid';
import SearchBar from '../../../components/ui/navigation/SearchBar';
import { rows as activityData } from '../../../components/ui/common/ActivityData';
import { clientService } from '../../../services/clientService';
import { Client } from '../../../types/Client';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import ScheduleIcon from '@mui/icons-material/Schedule';
import StatCard from '../../../components/ui/client/StatCard';
import ClientCard from '../../../components/ui/client/ClientCard';
import { useAuth } from 'react-oidc-context';

export function Dashboard() {
  const [, setSearchTerm] = useState('');
  const [filteredActivities, setFilteredActivities] = useState(activityData);
  const [clients, setClients] = useState<Client[]>([]);
  const [loadingClients, setLoadingClients] = useState(true);
  const auth = useAuth();
  
  // Fetch clients on component mount
  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      setLoadingClients(true);
      if (auth.isAuthenticated) {
        const response = await clientService.getAllClients(auth);
        setClients(response);
      } else {
        // Handle unauthenticated state or wait for auth
        console.log('User not authenticated yet');
        // Consider redirecting to login
        setClients([]);
      }
    } catch (error) {
      console.error('Error fetching clients:', error);
    } finally {
      setLoadingClients(false);
    }
  };
  
  // Handle search across multiple columns
  const handleSearch = (term: string) => {
    setSearchTerm(term);
    
    if (!term.trim()) {
      // If search is empty, show all activities
      setFilteredActivities(activityData);
      return;
    }
    
    // Search across multiple fields
    const lowercasedTerm = term.toLowerCase();
    const filtered = activityData.filter(activity => {
      return (
        // Search by ID
        activity.id.toString().toLowerCase().includes(lowercasedTerm) ||
        // Search by activity type
        activity.activityType.toLowerCase().includes(lowercasedTerm) ||
        // Search by description
        activity.description.toLowerCase().includes(lowercasedTerm) ||
        // Search by client ID
        activity.clientId.toString().toLowerCase().includes(lowercasedTerm) ||
        // Search by client name
        activity.clientName.toLowerCase().includes(lowercasedTerm) ||
        // Search by date (using timestamp if available)
        (activity.timestamp && 
          activity.timestamp.toLocaleDateString().includes(lowercasedTerm))
      );
    });
    
    setFilteredActivities(filtered);
  };
  
  return (
    <AppTheme>
      <CssBaseline enableColorScheme />
      
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 8,
          px: 2,
        }}
      >
        <Container maxWidth="lg">
          {/* Dashboard Header */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
              Agent Dashboard
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Welcome back! Here's an overview of your clients and recent activity.
            </Typography>
          </Box>
          
          {/* Stats summary section */}
          <Stack 
            direction={{ xs: 'column', md: 'row' }} 
            spacing={3} 
            sx={{ mb: 4 }}
          >
            <Box sx={{ flex: 1 }}>
              <StatCard 
                title="Total Clients" 
                value={loadingClients ? "..." : clients.length}
                icon={<PeopleAltIcon color="primary" />}
                loading={loadingClients}
              />
            </Box>
            <Box sx={{ flex: 1 }}>
              <StatCard 
                title="New This Month" 
                value={loadingClients ? "..." : "5"}
                icon={<PersonAddIcon color="success" />}
                loading={loadingClients}
              />
            </Box>
            <Box sx={{ flex: 1 }}>
              <StatCard 
                title="Pending Documents" 
                value={loadingClients ? "..." : "3"}
                icon={<ScheduleIcon color="warning" />}
                loading={loadingClients}
              />
            </Box>
          </Stack>
          
          {/* Content section */}
          <Stack 
            direction={{ xs: 'column', md: 'row' }} 
            spacing={3}
          >
            {/* Recent Clients Card */}
            <Box sx={{ flex: 1 }}>
              <ClientCard 
                clients={clients}
                loading={loadingClients}
                title="Recent Clients"
                viewAllLink="/agent/clients"
              />
            </Box>
            
            {/* Activity section */}
            <Box sx={{ flex: 2 }}>
              <Paper
                elevation={0}
                sx={{ 
                  borderRadius: 2,
                  overflow: 'hidden',
                  height: '100%',
                  p: 3,
                  boxShadow: 'rgba(0, 0, 0, 0.04) 0px 5px 22px, rgba(0, 0, 0, 0.03) 0px 0px 0px 0.5px',
                }}
              >
                {/* Search Bar */}
                <SearchBar 
                  onSearch={handleSearch}
                  totalItems={filteredActivities.length}
                  showCreateButton={false}
                  searchPlaceholder="Search activities by type, client..."
                  title="Recent Activity"
                  showCount={true}
                />
                
                {/* Activity Grid */}
                <ActivityGrid 
                  agentId="G001"
                  rows={filteredActivities} 
                />
              </Paper>
            </Box>
          </Stack>
        </Container>
      </Box>
    </AppTheme>
  );
}

export default Dashboard;
