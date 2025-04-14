import { api } from './api';
import { Client } from '../types/Client';
import { AuthContextProps } from 'react-oidc-context';

const CLIENTS_ENDPOINT = '/clients';

export const clientService = {
  /**
   * Fetch all clients from the API
   * @param auth Auth context from useAuth() hook
   * @returns Promise with array of clients
   */
  async getAllClients(auth: AuthContextProps): Promise<Client[]> {
    return api.get(CLIENTS_ENDPOINT, auth);
  },

  /**
   * Fetch a specific client by ID
   * @param id Client ID to fetch
   * @param auth Auth context from useAuth() hook
   * @returns Promise with client data
   */
  async getClientById(id: number, auth: AuthContextProps): Promise<Client> {
    return api.get(`${CLIENTS_ENDPOINT}/${id}`, auth);
  },

  /**
   * Create a new client
   * @param client Client data to create
   * @param auth Auth context from useAuth() hook
   * @returns Promise with created client data
   */
  async createClient(client: Omit<Client, 'clientId'>, auth: AuthContextProps): Promise<Client> {
    return api.post(CLIENTS_ENDPOINT, client, auth);
  },

  /**
   * Update an existing client
   * @param id Client ID to update
   * @param client Updated client data
   * @param auth Auth context from useAuth() hook
   * @returns Promise with updated client data
   */
  async updateClient(id: number, client: Partial<Client>, auth: AuthContextProps): Promise<Client> {
    return api.put(`${CLIENTS_ENDPOINT}/${id}`, client, auth);
  },

  /**
   * Delete a client
   * @param id Client ID to delete
   * @param auth Auth context from useAuth() hook
   */
  async deleteClient(id: number, auth: AuthContextProps): Promise<void | null> {
    return api.delete(`${CLIENTS_ENDPOINT}/${id}`, auth);
  },

  /**
   * Request an image upload link for a client
   * @param id Client ID to request upload for
   * @param auth Auth context from useAuth() hook
   * @returns Promise with confirmation message
   */
  async requestImageUpload(id: number, auth: AuthContextProps): Promise<string> {
    try {
      const response = await api.post(`${CLIENTS_ENDPOINT}/${id}/request-image-upload`, {}, auth);
      console.log("Image upload response:", response);
      return response;
    } catch (error) {
      console.error("Error in requestImageUpload:", error);
      throw error;
    }
  }
};