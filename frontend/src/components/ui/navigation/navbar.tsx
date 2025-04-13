import * as React from 'react';
import { alpha, useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import Drawer from '@mui/material/Drawer';
import MenuIcon from '@mui/icons-material/Menu';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import PersonIcon from '@mui/icons-material/Person';
import { useNavigate, useLocation } from 'react-router-dom';
import ColorModeIconDropdown from '../template/shared-theme/ColorModeIconDropdown';
import { useAuth } from 'react-oidc-context';
import { hasGroupAccess } from '../../../utils/auth';
import { useMemo } from 'react';

export default function NavBar() {
  const [open, setOpen] = React.useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const auth = useAuth();
  const theme = useTheme();
  const isAdmin = auth.isAuthenticated && hasGroupAccess(auth, ['ADMIN']);
  const isAgent = auth.isAuthenticated && hasGroupAccess(auth, ['AGENT']);
  const username = "John Doe"; // Replace with actual username from auth context

  const isActive = (path: string) => {
    // For admin dashboard, active when exactly at /admin
    if (path === 'admin-dashboard') {
      return location.pathname === '/admin';
    }
    
    // For agent dashboard, active when exactly at /agent
    if (path === 'agent-dashboard') {
      return location.pathname === '/agent';
    }
    
    // For other routes, check if the path segment is present
    return location.pathname.includes(`/${path}`);
  };

  const toggleDrawer = (newOpen: boolean) => () => {
    setOpen(newOpen);
  };

  const handleLoginClick = () => {
    navigate('/login');
  };

  // Replace your getLogo function with this useMemo approach
  // This will keep the logo path reactive to theme changes
  const logoPath = useMemo(() => {
    const themePrefix = theme.palette.mode === 'dark' ? 'DarkMode' : 'LightMode';
    let roleType = 'default';
    
    if (isAdmin) {
      roleType = 'Admin';
    } else if (isAgent) {
      roleType = 'Agent';
    }
    
    console.log('Role detection:', { isAdmin, isAgent, roleType });
    console.log('Current theme mode:', theme.palette.mode);
    const path = `/${themePrefix}${roleType}.svg`;
    console.log('Logo path generated:', path);
    
    return path;
  }, [theme.palette.mode, isAdmin, isAgent]); // Re-compute when these change

  return (
    <AppBar
      position="fixed"
      enableColorOnDark
      sx={{
        boxShadow: 0,
        bgcolor: 'transparent',
        backgroundImage: 'none',
        mt: 'calc(var(--template-frame-height, 0px) + 28px)',
      }}
    >
      <Container maxWidth="lg">
        <Toolbar
          variant="dense"
          disableGutters
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
            borderRadius: `calc(${theme.shape.borderRadius}px + 8px)`,
            backdropFilter: 'blur(24px)',
            border: '1px solid',
            borderColor: theme.palette.divider,
            backgroundColor: alpha(theme.palette.background.default, 0.4),
            boxShadow: theme.shadows[1],
            padding: '8px 12px',
          }}
        >
          <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', px: 0 }}>
            {/* Button */}
            <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
                <img 
                    src={logoPath} 
                    alt={`${theme.palette.mode === 'dark' ? 'Dark Mode' : 'Light Mode'} ${isAdmin ? 'Admin' : isAgent ? 'Agent' : 'Default'}`} 
                    style={{ height: 36, width: 36, marginRight: 4 }} 
                    onError={(e) => {
                      console.error('Failed to load logo, falling back to default');
                      e.currentTarget.src = '/logo.svg'; // Fallback to a generic logo
                      e.currentTarget.onerror = null; // Prevent infinite error loop
                    }}
                />
              
              {/* Admin Navigation */}
              {isAdmin && (
                <>
                  <Button 
                    variant="text" 
                    size="small"
                    onClick={() => navigate('/admin')}
                    sx={{
                      borderRadius: 1,
                      pb: 0.5,
                      px: 1.5,
                      color: isActive('admin-dashboard') 
                        ? `${theme.palette.mode === 'dark' ? theme.palette.common.white : theme.palette.common.black} !important` 
                        : 'info.main',
                      bgcolor: isActive('admin-dashboard') 
                        ? theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'common.white' 
                        : 'transparent',
                      boxShadow: isActive('admin-dashboard') ? 1 : 0,
                      fontWeight: isActive('admin-dashboard') ? 'bold' : 'normal'
                    }}
                  >
                    Dashboard
                  </Button>
                  <Button 
                    variant="text" 
                    size="small"
                    onClick={() => navigate('/admin/accounts')}
                    sx={{
                      borderRadius: 1,
                      pb: 0.5,
                      px: 1.5,
                      color: isActive('admin/accounts') 
                        ? `${theme.palette.mode === 'dark' ? theme.palette.common.white : theme.palette.common.black} !important` 
                        : 'info.main',
                      bgcolor: isActive('admin/accounts') 
                        ? theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'common.white' 
                        : 'transparent',
                      boxShadow: isActive('admin/accounts') ? 1 : 0,
                      fontWeight: isActive('admin/accounts') ? 'bold' : 'normal'
                    }}
                  >
                    Accounts
                  </Button>
                  <Button 
                    variant="text" 
                    size="small"
                    onClick={() => navigate('/admin/transactions')}
                    sx={{
                      borderRadius: 1,
                      pb: 0.5,
                      px: 1.5,
                      color: isActive('admin/transactions') 
                        ? `${theme.palette.mode === 'dark' ? theme.palette.common.white : theme.palette.common.black} !important` 
                        : 'info.main',
                      bgcolor: isActive('admin/transactions') 
                        ? theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'common.white' 
                        : 'transparent',
                      boxShadow: isActive('admin/transactions') ? 1 : 0,
                      fontWeight: isActive('admin/transactions') ? 'bold' : 'normal'
                    }}
                  >
                    Transactions
                  </Button>
                </>
              )}

              {/* Agent Navigation */}
              {isAgent && (
                <>
                  <Button 
                    variant="text" 
                    size="small"
                    onClick={() => navigate('/agent')}
                    sx={{
                      borderRadius: 1,
                      pb: 0.5,
                      px: 1.5,
                      color: isActive('agent-dashboard') 
                        ? `${theme.palette.mode === 'dark' ? theme.palette.common.white : theme.palette.common.black} !important` 
                        : 'info.main',
                      bgcolor: isActive('agent-dashboard') 
                        ? theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'common.white' 
                        : 'transparent',
                      boxShadow: isActive('agent-dashboard') ? 1 : 0,
                      fontWeight: isActive('agent-dashboard') ? 'bold' : 'normal'
                    }}
                  >
                    Dashboard
                  </Button>
                  <Button 
                    variant="text" 
                    size="small"
                    onClick={() => navigate('/agent/clients')}
                    sx={{
                      borderRadius: 1,
                      pb: 0.5,
                      px: 1.5,
                      color: isActive('agent/clients') 
                        ? `${theme.palette.mode === 'dark' ? theme.palette.common.white : theme.palette.common.black} !important` 
                        : 'info.main',
                      bgcolor: isActive('agent/clients') 
                        ? theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'common.white' 
                        : 'transparent',
                      boxShadow: isActive('agent/clients') ? 1 : 0,
                      fontWeight: isActive('agent/clients') ? 'bold' : 'normal'
                    }}
                  >
                    Clients
                  </Button>
                  <Button 
                    variant="text" 
                    size="small"
                    onClick={() => navigate('/agent/transactions')}
                    sx={{
                      borderRadius: 1,
                      pb: 0.5,
                      px: 1.5,
                      color: isActive('agent/transactions') 
                        ? `${theme.palette.mode === 'dark' ? theme.palette.common.white : theme.palette.common.black} !important` 
                        : 'info.main',
                      bgcolor: isActive('agent/transactions') 
                        ? theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'common.white' 
                        : 'transparent',
                      boxShadow: isActive('agent/transactions') ? 1 : 0,
                      fontWeight: isActive('agent/transactions') ? 'bold' : 'normal'
                    }}
                  >
                    Transactions
                  </Button>
                </>
              )}
            </Box>
          </Box>
          
          {/* Right side icons */}
          <Box
            sx={{
              display: { xs: 'none', md: 'flex' },
              gap: 1,
              alignItems: 'center',
            }}
          >
            <ColorModeIconDropdown />
            <IconButton 
              color="primary" 
              onClick={handleLoginClick}
              aria-label="Login"
              title="Login"
            >
              <PersonIcon />
            </IconButton>
          </Box>
          
          {/* Mobile menu - update MenuItem components too */}
          <Box sx={{ display: { xs: 'flex', md: 'none' }, gap: 1 }}>
            <ColorModeIconDropdown size="medium" />
            <IconButton 
              color="primary"
              onClick={handleLoginClick}
              aria-label="Login"
              sx={{ mr: 1 }}
            >
              <PersonIcon />
            </IconButton>
            <IconButton aria-label="Menu button" onClick={toggleDrawer(true)}>
              <MenuIcon />
            </IconButton>
            <Drawer
              anchor="top"
              open={open}
              onClose={toggleDrawer(false)}
              PaperProps={{
                sx: {
                  top: 'var(--template-frame-height, 0px)',
                },
              }}
            >
              <Box sx={{ p: 2, backgroundColor: 'background.default' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <img 
                      src={logoPath} 
                      alt="Logo" 
                      style={{ height: 24, width: 24, marginRight: 8 }} 
                    />
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                      {username}
                    </Typography>
                  </Box>
                  <IconButton onClick={toggleDrawer(false)}>
                    <CloseRoundedIcon />
                  </IconButton>
                </Box>

                {/* Admin Mobile Menu */}
                {isAdmin && (
                  <>
                    <MenuItem 
                      onClick={() => {
                        navigate('/admin');
                        toggleDrawer(false)();
                      }}
                      sx={{
                        backgroundColor: isActive('admin-dashboard') 
                          ? alpha(theme.palette.primary.main, 0.1) 
                          : 'transparent',
                        fontWeight: isActive('admin-dashboard') ? 'bold' : 'normal',
                        borderLeft: isActive('admin-dashboard') ? '4px solid' : 'none',
                        borderColor: 'primary.main',
                        pl: isActive('admin-dashboard') ? 1.5 : 2,
                      }}
                    >
                      Dashboard
                    </MenuItem>
                    <MenuItem 
                      onClick={() => {
                        navigate('/admin/accounts');
                        toggleDrawer(false)();
                      }}
                      sx={{
                        backgroundColor: isActive('admin/accounts') 
                          ? alpha(theme.palette.primary.main, 0.1) 
                          : 'transparent',
                        fontWeight: isActive('admin/accounts') ? 'bold' : 'normal',
                        borderLeft: isActive('admin/accounts') ? '4px solid' : 'none',
                        borderColor: 'primary.main',
                        pl: isActive('admin/accounts') ? 1.5 : 2,
                      }}
                    >
                      Accounts
                    </MenuItem>
                    <MenuItem 
                      onClick={() => {
                        navigate('/admin/transactions');
                        toggleDrawer(false)();
                      }}
                      sx={{
                        backgroundColor: isActive('admin/transactions') 
                          ? alpha(theme.palette.primary.main, 0.1) 
                          : 'transparent',
                        fontWeight: isActive('admin/transactions') ? 'bold' : 'normal',
                        borderLeft: isActive('admin/transactions') ? '4px solid' : 'none',
                        borderColor: 'primary.main',
                        pl: isActive('admin/transactions') ? 1.5 : 2,
                      }}
                    >
                      Transactions
                    </MenuItem>
                  </>
                )}

                {/* Agent Mobile Menu */}
                {isAgent && (
                  <>
                    <MenuItem 
                      onClick={() => {
                        navigate('/agent');
                        toggleDrawer(false)();
                      }}
                      sx={{
                        backgroundColor: isActive('agent-dashboard') 
                          ? alpha(theme.palette.primary.main, 0.1) 
                          : 'transparent',
                        fontWeight: isActive('agent-dashboard') ? 'bold' : 'normal',
                        borderLeft: isActive('agent-dashboard') ? '4px solid' : 'none',
                        borderColor: 'primary.main',
                        pl: isActive('agent-dashboard') ? 1.5 : 2,
                      }}
                    >
                      Dashboard
                    </MenuItem>
                    <MenuItem 
                      onClick={() => {
                        navigate('/agent/clients');
                        toggleDrawer(false)();
                      }}
                      sx={{
                        backgroundColor: isActive('agent/clients') 
                          ? alpha(theme.palette.primary.main, 0.1) 
                          : 'transparent',
                        fontWeight: isActive('agent/clients') ? 'bold' : 'normal',
                        borderLeft: isActive('agent/clients') ? '4px solid' : 'none',
                        borderColor: 'primary.main',
                        pl: isActive('agent/clients') ? 1.5 : 2,
                      }}
                    >
                      Clients
                    </MenuItem>
                    <MenuItem 
                      onClick={() => {
                        navigate('/agent/transactions');
                        toggleDrawer(false)();
                      }}
                      sx={{
                        backgroundColor: isActive('agent/transactions') 
                          ? alpha(theme.palette.primary.main, 0.1) 
                          : 'transparent',
                        fontWeight: isActive('agent/transactions') ? 'bold' : 'normal',
                        borderLeft: isActive('agent/transactions') ? '4px solid' : 'none',
                        borderColor: 'primary.main',
                        pl: isActive('agent/transactions') ? 1.5 : 2,
                      }}
                    >
                      Transactions
                    </MenuItem>
                  </>
                )}

                <Divider sx={{ my: 2 }} />
                <MenuItem>
                  <Button color="primary" variant="contained" fullWidth onClick={handleLoginClick}>
                    Login / Sign up
                  </Button>
                </MenuItem>
              </Box>
            </Drawer>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}