import { useState, useEffect } from 'react';
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
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Handle tab selection based on current path
  useEffect(() => {
    const path = location.pathname;
    if (path.includes('/admin/accounts')) {
      setActiveTab('accounts');
    } else if (path.includes('/admin/transactions')) {
      setActiveTab('transactions');
    } else {
      setActiveTab('dashboard');
    }
  }, [location.pathname]);

  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
    if (tab === 'dashboard') {
      navigate('/admin');
    } else {
      navigate(`/admin/${tab}`);
    }
  };

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
        <div className="flex border-b border-gray-200 mb-4">
          <button
            className={`py-2 px-4 ${
              activeTab === 'dashboard' 
                ? 'text-blue-600 border-b-2 border-blue-600 font-medium' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => handleTabClick('dashboard')}
          >
            Dashboard
          </button>
          <button
            className={`py-2 px-4 ${
              activeTab === 'accounts' 
                ? 'text-blue-600 border-b-2 border-blue-600 font-medium' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => handleTabClick('accounts')}
          >
            Accounts
          </button>
          <button
            className={`py-2 px-4 ${
              activeTab === 'transactions' 
                ? 'text-blue-600 border-b-2 border-blue-600 font-medium' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => handleTabClick('transactions')}
          >
            Transactions
          </button>
        </div>

        {/* Render the active tab content */}
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