import AdminDashboard from './components/AdminDashboard'

const AdminPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A] p-4 dark">
      <div className="max-w-4xl w-full h-[800px] bg-[#111214] p-8 rounded-lg border border-[#1E2023] shadow-lg">
        <AdminDashboard />
      </div>
    </div>
  )
}

export default AdminPage
