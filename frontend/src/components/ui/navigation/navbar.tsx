import * as React from 'react';
import { alpha, styled } from '@mui/material/styles';
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

const StyledToolbar = styled(Toolbar)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  flexShrink: 0,
  borderRadius: `calc(${theme.shape.borderRadius}px + 8px)`,
  backdropFilter: 'blur(24px)',
  border: '1px solid',
  borderColor: (theme.vars || theme).palette.divider,
  backgroundColor: theme.vars
    ? `rgba(${theme.vars.palette.background.defaultChannel} / 0.4)`
    : alpha(theme.palette.background.default, 0.4),
  boxShadow: (theme.vars || theme).shadows[1],
  padding: '8px 12px',
}));

export default function NavBar() {
  const [open, setOpen] = React.useState(false);
  const navigate = useNavigate();
  const username = "John Doe"; // Replace with actual username from auth context

  const isActive = (path: string) => {
    // For dashboard, only active when exactly at /newagent
    if (path === 'newagent') {
      return location.pathname === '/newagent';
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
        <StyledToolbar variant="dense" disableGutters>
          <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', px: 0 }}>
            {/* Button */}
            <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
                <img 
                    src="/react.svg" 
                    alt="Logo" 
                    style={{ height: 24, width: 24, marginRight: 6 }} 
                />
              <Button 
                variant="text" 
                size="small"
                onClick={() => navigate('/newagent')}
                sx={{
                  borderRadius: 1,
                  pb: 0.5,
                  px: 1.5,
                  color: isActive('newagent') ? '#000000 !important' : 'info.main',
                  bgcolor: isActive('newagent') ? 'common.white' : 'transparent',
                  boxShadow: isActive('newagent') ? 1 : 0,
                  fontWeight: isActive('newagent') ? 'bold' : 'normal'
                }}
              >
                Dashboard
              </Button>
              <Button 
                variant="text" 
                size="small"
                onClick={() => navigate('/newagent/accounts')}
                sx={{
                  borderRadius: 1,
                  pb: 0.5,
                  px: 1.5,
                  color: isActive('accounts') ? '#000000 !important' : 'info.main',
                  bgcolor: isActive('accounts') ? 'common.white' : 'transparent',
                  boxShadow: isActive('accounts') ? 1 : 0,
                  fontWeight: isActive('accounts') ? 'bold' : 'normal'
                }}
              >
                Accounts
              </Button>
              <Button 
                variant="text" 
                size="small"
                onClick={() => navigate('/newagent/transactions')}
                sx={{
                  borderRadius: 1,
                  pb: 0.5,
                  px: 1.5,
                  color: isActive('transactions') ? '#000000 !important' : 'info.main',
                  bgcolor: isActive('transactions') ? 'common.white' : 'transparent',
                  boxShadow: isActive('transactions') ? 1 : 0,
                  fontWeight: isActive('transactions') ? 'bold' : 'normal',
                }}
              >
                Transactions
              </Button>
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
                      src="/react.svg" 
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
                <MenuItem 
                  onClick={() => {
                    navigate('/newagent');
                    toggleDrawer(false)();
                  }}
                  sx={{
                    backgroundColor: isActive('newagent') ? alpha('#3f51b5', 0.1) : 'transparent',
                    fontWeight: isActive('newagent') ? 'bold' : 'normal',
                    borderLeft: isActive('newagent') ? '4px solid' : 'none',
                    borderColor: 'primary.main',
                    pl: isActive('newagent') ? 1.5 : 2,
                  }}
                >
                  Accounts
                </MenuItem>
                <MenuItem 
                  onClick={() => {
                    navigate('/newagentransactions');
                    toggleDrawer(false)();
                  }}
                  sx={{
                    backgroundColor: isActive('transactions') ? alpha('#3f51b5', 0.1) : 'transparent',
                    fontWeight: isActive('transactions') ? 'bold' : 'normal',
                    borderLeft: isActive('transactions') ? '4px solid' : 'none',
                    borderColor: 'primary.main',
                    pl: isActive('transactions') ? 1.5 : 2,
                  }}
                >
                  Transactions
                </MenuItem>
                <Divider sx={{ my: 2 }} />
                <MenuItem>
                  <Button color="primary" variant="contained" fullWidth onClick={handleLoginClick}>
                    Login / Sign up
                  </Button>
                </MenuItem>
              </Box>
            </Drawer>
          </Box>
        </StyledToolbar>
      </Container>
    </AppBar>
  );
}