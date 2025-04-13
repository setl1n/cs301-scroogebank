import { useState } from 'react';
import { Box, Container, Paper, Typography } from '@mui/material';
import ActivityGrid from '../../../components/ui/common/ActivityGrid';
import SearchBar from '../../../components/ui/navigation/SearchBar';
import { rows as activityData } from '../../../components/ui/common/ActivityData';

export default function DashboardTab() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredActivities, setFilteredActivities] = useState(activityData);
  
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
    <Container maxWidth="lg">
      {/* Dashboard Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
          Admin Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Welcome back! Here's an overview of recent activity.
        </Typography>
      </Box>
      
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
      <Paper
        elevation={0}
        sx={{ 
          borderRadius: 2,
          overflow: 'hidden',
          height: 500,
          bgcolor: 'transparent',
        }}
      >
        <ActivityGrid rows={filteredActivities} />
      </Paper>
    </Container>
  );
} 