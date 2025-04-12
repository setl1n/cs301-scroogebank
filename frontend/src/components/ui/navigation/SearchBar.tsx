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
import AddIcon from '@mui/icons-material/Add';
import FilterListIcon from '@mui/icons-material/FilterList';
import ClearIcon from '@mui/icons-material/Clear';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';

interface SearchBarProps {
  onSearch: (searchTerm: string) => void;
  onCreateAction?: () => void;
  totalItems?: number;
  showCreateButton?: boolean;
  createButtonText?: string;
  createButtonMobileText?: string;
  searchPlaceholder?: string;
  title?: string;
  showCount?: boolean;
}

export default function SearchBar({ 
  onSearch, 
  onCreateAction, 
  totalItems = 0, 
  showCreateButton = true,
  createButtonText = 'Create Account',
  createButtonMobileText = 'Create',
  searchPlaceholder = 'Search by name...',
  title = 'Items',
  showCount = true
}: SearchBarProps) {
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
    <Box sx={{ mb: 3 }}>
      
      {/* Search and button row - THIS IS THE MAIN CONTAINER */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: 'center',
          gap: 2,
          width: '100%',
        }}
      >
        {/* Search bar */}
        <Paper
          component="form"
          sx={{
            p: '2px 4px',
            display: 'flex',
            alignItems: 'center',
            width: '100%', 
            flex: 1,
            bgcolor: 'background.paper',
            borderRadius: 2,
          }}
          elevation={1}
        >
          <InputBase
            sx={{ ml: 2, flex: 1 }}
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            inputProps={{ 'aria-label': 'search' }}
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

        {/* Create button - NOW INSIDE THE SAME BOX AS THE SEARCH BAR */}
        {showCreateButton && onCreateAction && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={onCreateAction}
            sx={{ 
              whiteSpace: 'nowrap',
              height: 40, // Fixed height to match search bar
              minWidth: { xs: '100%', sm: 'auto' } // Full width on mobile, auto on desktop
            }}
          >
            {isMobile ? createButtonMobileText : createButtonText}
          </Button>
        )}
      </Box>
    </Box>
  );
}