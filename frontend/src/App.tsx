import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import LoginPage from './pages/login/LoginPage'
import AdminPage from './pages/admin/AdminPage'
import AgentPage from './pages/agent/AgentPage'
import SignInSide from './pages/other/SignInSide'
import NewAgent from './pages/other/NewAgent'

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen">
        <nav className="bg-gray-100 p-4 flex justify-center">
          <ul className="flex space-x-8 items-center">
            <li>
              <Link to="/login" className="text-blue-500 hover:text-blue-700">Login</Link>
            </li>
            <li>
              <Link to="/admin" className="text-blue-500 hover:text-blue-700">Admin</Link>
            </li>
            <li>
              <Link to="/agent" className="text-blue-500 hover:text-blue-700">Agent</Link>
            </li>
          </ul>
        </nav>

        <main className="p-4">
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/agent" element={<AgentPage />} />
            <Route path="/" element={<LoginPage />} />
            {/* cooking */}
            <Route path="/other" element={<SignInSide />} />
            <Route path="/newagent" element={<NewAgent/>} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App
