import { useState } from 'react';
import { Box, Container, Paper } from '@mui/material';
import NavBar from '../../components/ui/navigation/NavBar';
import AppTheme from '../../components/ui/template/shared-theme/AppTheme';
import CssBaseline from '@mui/material/CssBaseline';
import AgentGrid from '../../components/ui/agent/AgentGrid';
import SearchBar from '../../components/ui/navigation/SearchBar';
import { rows as agentData } from '../../components/ui/agent/AgentData';

export default function NewAgentAccounts() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredAgents, setFilteredAgents] = useState(agentData);
  
  // Handle search across multiple columns
  const handleSearch = (term: string) => {
    setSearchTerm(term);
    
    if (!term.trim()) {
      // If search is empty, show all agents
      setFilteredAgents(agentData);
      return;
    }
    
    // Search across multiple fields
    const lowercasedTerm = term.toLowerCase();
    const filtered = agentData.filter(agent => {
      return (
        // Search by ID
        agent.id.toString().toLowerCase().includes(lowercasedTerm) ||
        // Search by name
        agent.agentName.toLowerCase().includes(lowercasedTerm) ||
        // Add other searchable fields here as needed
        // For example, if you have email, phone, etc.
        (agent.email && agent.email.toLowerCase().includes(lowercasedTerm)) ||
        (agent.phone && agent.phone.toLowerCase().includes(lowercasedTerm))
      );
    });
    
    setFilteredAgents(filtered);
  };
  
  const handleCreateAccount = () => {
    console.log('Create account clicked');
    // Implement account creation logic
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
            onCreateAction={handleCreateAccount}
            totalItems={filteredAgents.length}
            createButtonText="Create Account"
            searchPlaceholder="Search agents by name, ID..."
            title="Accounts"
            showCount={true}
          />
          
          {/* Agent Grid */}
          <Paper 
            elevation={0}
            sx={{ 
              borderRadius: 2,
              overflow: 'hidden',
              height: 500, // Fixed height for the grid
              bgcolor: 'transparent'
            }}
          >
            <AgentGrid rows={filteredAgents} />
          </Paper>
        </Container>
      </Box>
    </AppTheme>
  );
}