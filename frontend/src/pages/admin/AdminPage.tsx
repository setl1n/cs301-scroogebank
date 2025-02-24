import AdminDashboard from './components/AdminDashboard'

const AdminPage = () => {
  return (
    <div className="h-screen flex items-center justify-center bg-secondary-900 p-4">
      <div className="max-w-3xl w-full h-full space-y-8 bg-secondary-800 p-8 rounded-lg">
        <AdminDashboard />
      </div>
    </div>
  )
}

export default AdminPage
