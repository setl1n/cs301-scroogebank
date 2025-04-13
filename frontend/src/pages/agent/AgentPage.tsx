import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { Dashboard } from './components/Dashboard';

const AgentPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Handle tab selection based on current path
  useEffect(() => {
    const path = location.pathname;
    if (path.includes('/agent/clients')) {
      setActiveTab('clients');
    } else if (path.includes('/agent/transactions')) {
      setActiveTab('transactions');
    } else {
      setActiveTab('dashboard');
    }
  }, [location.pathname]);

  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
    if (tab === 'dashboard') {
      navigate('/agent');
    } else {
      navigate(`/agent/${tab}`);
    }
  };

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
    <div className="container mx-auto p-4">
      
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
            activeTab === 'clients' 
              ? 'text-blue-600 border-b-2 border-blue-600 font-medium' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => handleTabClick('clients')}
        >
          Clients
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

      <div className="mt-4">
        {activeTab === 'dashboard' ? <Dashboard /> : <Outlet />}
      </div>
    </div>
  );
};

export default AgentPage;