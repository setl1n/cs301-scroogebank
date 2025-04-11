import AgentDashboard from './components/AgentDashboard'

const AgentPage = () => {
  return (
    <div className="h-screen flex items-center justify-center bg-secondary-900 p-4">
      <div className="max-w-3xl w-full h-full bg-secondary-800 p-8 rounded-lg">
        <AgentDashboard />
      </div>
    </div>
  )
}

export default AgentPage
