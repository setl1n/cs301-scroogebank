import { useEffect } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { Box, CssBaseline } from '@mui/material';
import AppTheme from '../../components/ui/template/shared-theme/AppTheme';
import NavBar from '../../components/ui/navigation/navbar';
import DashboardTab from './components/DashboardTab';
import AccountsTab from './components/AccountsTab';
import TransactionsTab from './components/TransactionsTab';

export default function AdminPage() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Handle legacy routes
  useEffect(() => {
    const path = location.pathname;
    if (path.includes('/newadmin/accounts')) {
      navigate('/admin/accounts');
    } else if (path.includes('/newadmin/transactions')) {
      navigate('/admin/transactions');
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
          {location.pathname === '/admin' && <DashboardTab />}
          {location.pathname === '/admin/accounts' && <AccountsTab />}
          {location.pathname === '/admin/transactions' && <TransactionsTab />}
          {/* If no matching path, show the Outlet for nested routes */}
          {!['/admin', '/admin/accounts', '/admin/transactions'].includes(location.pathname) && <Outlet />}
        </div>
      </Box>
    </AppTheme>
  );
}