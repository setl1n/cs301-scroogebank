import AgentDashboard from './components/AgentDashboard'

const AgentPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4 dark">
      <div className="max-w-4xl w-full h-[800px] bg-zinc-900 p-8 rounded-lg border border-zinc-800">
        <AgentDashboard />
      </div>
    </div>
  )
}

export default AgentPage
