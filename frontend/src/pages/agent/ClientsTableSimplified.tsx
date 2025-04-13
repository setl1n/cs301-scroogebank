import { useState, useEffect } from 'react';
import { useApiAuth } from '../../hooks/useApiAuth';

interface Client {
  id: number;
  name: string;
  email: string;
}

export default function ClientsTableSimplified() {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const api = useApiAuth();

  useEffect(() => {
    // Only fetch data if the user is authenticated
    if (api.isAuthenticated) {
      fetchClients();
    }
  }, [api.isAuthenticated]);

  const fetchClients = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Using the useApiAuth hook - no need to pass auth manually
      const data = await api.get('/clients');
      setClients(data);
    } catch (err) {
      console.error('Error fetching clients:', err);
      setError('Failed to load clients. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this client?')) {
      try {
        await api.delete(`/clients/${id}`);
        // Refresh the client list after deletion
        fetchClients();
      } catch (err) {
        console.error('Error deleting client:', err);
        setError('Failed to delete client. Please try again.');
      }
    }
  };

  // If not authenticated, show login message
  if (!api.isAuthenticated) {
    return (
      <div className="p-4 border rounded shadow">
        <p>Please log in to view clients.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <h2 className="text-xl font-bold mb-4">Clients (Simplified)</h2>
      
      {isLoading && <p>Loading clients...</p>}
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
          <p>{error}</p>
        </div>
      )}
      
      {!isLoading && !error && (
        <table className="min-w-full bg-white border border-gray-300">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b">ID</th>
              <th className="py-2 px-4 border-b">Name</th>
              <th className="py-2 px-4 border-b">Email</th>
              <th className="py-2 px-4 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {clients.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-4 px-4 text-center">No clients found</td>
              </tr>
            ) : (
              clients.map((client) => (
                <tr key={client.id}>
                  <td className="py-2 px-4 border-b">{client.id}</td>
                  <td className="py-2 px-4 border-b">{client.name}</td>
                  <td className="py-2 px-4 border-b">{client.email}</td>
                  <td className="py-2 px-4 border-b">
                    <button 
                      className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded mr-2"
                      onClick={() => api.get(`/clients/${client.id}`)}
                    >
                      View
                    </button>
                    <button 
                      className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded"
                      onClick={() => handleDelete(client.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </div>
  );
} 