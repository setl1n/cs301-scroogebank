import { api } from './api';

// Interface for the client data
interface Client {
  id?: number;
  name: string;
  email: string;
  // Add other client properties as needed
}

export const clientApi = {
  // Get all clients
  getAllClients: () => {
    return api.get('/clients');
  },
  
  // Get client by ID
  getClientById: (id: number) => {
    return api.get(`/clients/${id}`);
  },
  
  // Create a new client
  createClient: (client: Client) => {
    return api.post('/clients', client);
  },
  
  // Update an existing client
  updateClient: (id: number, client: Client) => {
    return api.put(`/clients/${id}`, client);
  },
  
  // Delete a client
  deleteClient: (id: number) => {
    return api.delete(`/clients/${id}`);
  },
  
  // Request image upload
  requestImageUpload: (id: number) => {
    return api.post(`/clients/${id}/request-image-upload`, {});
  }
};