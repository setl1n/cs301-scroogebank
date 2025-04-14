import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LoginPage from './pages/login/LoginPage'
import AdminPage from './pages/admin/AdminPage'
import AgentPage from './pages/agent/AgentPage'
import UnauthorizedPage from './pages/unauthorized/UnauthorizedPage'
import HomePage from './pages/HomePage'
import OAuthRedirectHandler from './pages/login/OAuthRedirectHandler'
import ProtectedRoute from './components/ProtectedRoute'
import ClientsTab from './pages/agent/components/ClientsTab'
import TransactionsTab from './pages/agent/components/TransactionsTab'
import AccountsTab from './pages/admin/components/AccountsTab'
import TransactionsTabAdmin from './pages/admin/components/TransactionsTab'
import VerificationPage from './pages/verification/VerificationPage'

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen">

        <main className="p-4">
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/login/oauth2/code/cognito" element={<OAuthRedirectHandler />} />
            <Route path="/unauthorized" element={<UnauthorizedPage />} />
            <Route path="/verification" element={<VerificationPage />} />
            
            {/* Admin routes */}
            <Route path="/admin" element={
              <ProtectedRoute requiredRoles={['ADMIN']}>
                <AdminPage />
              </ProtectedRoute>
            }>
              <Route path="accounts" element={<AccountsTab />} />
              <Route path="transactions" element={<TransactionsTabAdmin />} />
            </Route>
            
            {/* Agent routes */}
            <Route path="/agent/*" element={
              <ProtectedRoute requiredRoles={['AGENT']}>
                <AgentPage />
              </ProtectedRoute>
            }>
              <Route path="clients" element={<ClientsTab />} />
              <Route path="transactions" element={<TransactionsTab />} />
            </Route>
            
            <Route path="/" element={<HomePage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App
