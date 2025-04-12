import AdminDashboard from './components/AdminDashboard'

const AdminPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4 dark">
      <div className="max-w-4xl w-full h-full space-y-8 bg-zinc-900 p-8 rounded-lg border border-zinc-800">
        <AdminDashboard />
      </div>
    </div>
  )
}

export default AdminPage
