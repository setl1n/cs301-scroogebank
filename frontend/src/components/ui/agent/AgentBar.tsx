import { useState, useEffect } from 'react';
import { 
  Box,
  Button,
  IconButton,
  InputBase,
  Paper,
  Typography,
  Tooltip,
  Divider
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import FilterListIcon from '@mui/icons-material/FilterList';
import ClearIcon from '@mui/icons-material/Clear';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';

interface AgentBarProps {
  onSearch: (searchTerm: string) => void;
  onCreateAccount: () => void;
  totalClients?: number;
}

export default function AgentBar({ onSearch, onCreateAccount, totalClients = 0 }: AgentBarProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(searchTerm);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [searchTerm, onSearch]);
  
  const handleClearSearch = () => {
    setSearchTerm('');
    onSearch('');
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: { xs: 'stretch', sm: 'center' },
        justifyContent: 'space-between',
        mb: 3,
        gap: 2
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
        <Typography variant="h6" component="h2" sx={{ mb: 1, fontWeight: 'bold' }}>
          Clients {totalClients > 0 && `(${totalClients})`}
        </Typography>
        
        <Paper
          component="form"
          sx={{
            p: '2px 4px',
            display: 'flex',
            alignItems: 'center',
            width: '100%',
            maxWidth: { sm: 400, md: 500 },
            bgcolor: 'background.paper',
            borderRadius: 2
          }}
          elevation={1}
        >
          <IconButton sx={{ p: '10px' }} aria-label="search">
            <SearchIcon />
          </IconButton>
          <InputBase
            sx={{ ml: 1, flex: 1 }}
            placeholder="Search clients by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            inputProps={{ 'aria-label': 'search clients' }}
          />
          {searchTerm && (
            <IconButton 
              size="small" 
              onClick={handleClearSearch}
              aria-label="clear search"
            >
              <ClearIcon fontSize="small" />
            </IconButton>
          )}
          <Divider sx={{ height: 28, m: 0.5 }} orientation="vertical" />
          <Tooltip title="Filter options">
            <IconButton color="primary" sx={{ p: '10px' }} aria-label="filter">
              <FilterListIcon />
            </IconButton>
          </Tooltip>
        </Paper>
      </Box>

      <Button
        variant="contained"
        color="primary"
        startIcon={<AddIcon />}
        onClick={onCreateAccount}
        sx={{ 
          whiteSpace: 'nowrap',
          height: 'fit-content',
          alignSelf: { xs: 'flex-end', sm: 'center' }
        }}
      >
        {isMobile ? 'Create' : 'Create Account'}
      </Button>
    </Box>
  );
}