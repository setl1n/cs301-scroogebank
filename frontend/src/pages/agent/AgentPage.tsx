import { useEffect } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { Box, CssBaseline } from '@mui/material';
import AppTheme from '../../components/ui/template/shared-theme/AppTheme';
import NavBar from '../../components/ui/navigation/NavBar';
import { Dashboard } from './components/Dashboard';

const AgentPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Handle legacy routes
  useEffect(() => {
    const path = location.pathname;
    if (path.includes('/newagent/accounts')) {
      navigate('/agent/clients');
    } else if (path.includes('/newagent/transactions')) {
      navigate('/agent/transactions');
    }
  }, [location.pathname, navigate]);

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
        {/* Render content based on route */}
        <div className="mt-4">
          {location.pathname === '/agent' && <Dashboard />}
          {/* All other routes are handled by Outlet */}
          {location.pathname !== '/agent' && <Outlet />}
        </div>
      </Box>
    </AppTheme>
  );
};

export default AgentPage;