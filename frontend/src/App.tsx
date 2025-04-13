import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import { useAuth } from 'react-oidc-context'
import LoginPage from './pages/login/LoginPage'
import AdminPage from './pages/admin/AdminPage'
import AgentPage from './pages/agent/AgentPage'
import UnauthorizedPage from './pages/unauthorized/UnauthorizedPage'
import HomePage from './pages/HomePage'
import OAuthRedirectHandler from './pages/login/OAuthRedirectHandler'
import ProtectedRoute from './components/ProtectedRoute'
import { hasGroupAccess } from './utils/auth'
import ClientsTab from './pages/agent/components/ClientsTab'
import TransactionsTab from './pages/agent/components/TransactionsTab'
import NewAdmin from './pages/other/NewAdmin'
import NewAdminAccounts from './pages/other/NewAdminAccounts'
import NewAdminTransactions from './pages/other/NewAdminTransactions'

function App() {
  const auth = useAuth();
  const isAuthenticated = auth.isAuthenticated;
  const isAdmin = isAuthenticated && hasGroupAccess(auth, ['ADMIN']);
  const isAgent = isAuthenticated && hasGroupAccess(auth, ['AGENT']);

  return (
    <BrowserRouter>
      <div className="min-h-screen">
        <nav className="bg-gray-100 p-4 flex justify-center">
          <ul className="flex space-x-8 items-center">
            <li>
              <Link to="/" className="text-blue-500 hover:text-blue-700">Home</Link>
            </li>
            <li>
              <Link to="/login" className="text-blue-500 hover:text-blue-700">Login</Link>
            </li>
            {(isAdmin || isAgent) && (
              <>
                {isAdmin && (
                  <li>
                    <Link to="/admin" className="text-blue-500 hover:text-blue-700">Admin</Link>
                  </li>
                )}
                {isAgent && (
                  <li>
                    <Link to="/agent" className="text-blue-500 hover:text-blue-700">Agent</Link>
                  </li>
                )}
              </>
            )}
          </ul>
        </nav>

        <main className="p-4">
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/login/oauth2/code/cognito" element={<OAuthRedirectHandler />} />
            <Route path="/unauthorized" element={<UnauthorizedPage />} />
            <Route path="/admin" element={
              <ProtectedRoute requiredRoles={['ADMIN']}>
                <AdminPage />
              </ProtectedRoute>
            } />
            <Route path="/agent/*" element={
              <ProtectedRoute requiredRoles={['AGENT']}>
                <AgentPage />
              </ProtectedRoute>
            }>
              <Route path="clients" element={<ClientsTab />} />
              <Route path="transactions" element={<TransactionsTab />} />
            </Route>
            <Route path="/" element={<HomePage />} />
            
            {/* Legacy routes */}
            <Route path="/newagent/accounts" element={<ClientsTab/>} />
            <Route path="/newagent/transactions" element={<TransactionsTab/>} />

            <Route path="/newadmin" element={<NewAdmin/>} />
            <Route path="/newadmin/accounts" element={<NewAdminAccounts/>} />
            <Route path="/newadmin/transactions" element={<NewAdminTransactions/>} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App
