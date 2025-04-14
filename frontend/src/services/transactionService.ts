import { AuthContextProps } from 'react-oidc-context';
import { transactionApi, TransactionPayload } from './transactionApi';
import { Transaction, TransactionStatus } from '../types/Transaction';
import { clientService } from './clientService';

// Response type from the backend API
interface ApiResponse<T> {
  result: boolean;
  errorMessage: string;
  data: T;
}

// Enhanced service that adds business logic on top of API calls
export const transactionService = {
  // Trigger daily fetch of transactions from SFTP server
  dailyFetch: async (auth: AuthContextProps | undefined = undefined) => {
    try {
      const response = await transactionApi.dailyFetch(auth);
      
      // If we have valid response with data, enrich the transactions with client names
      if (response?.result && Array.isArray(response.data) && response.data.length > 0 && auth) {
        try {
          const enrichedTransactions = await enrichTransactionsWithClientNames(response.data, auth);
          return {
            ...response,
            data: enrichedTransactions
          };
        } catch (error) {
          console.error('Error enriching transactions with client names:', error);
        }
      }
      
      return response;
    } catch (error) {
      console.error('Error during daily fetch:', error);
      return {
        result: false,
        errorMessage: error instanceof Error ? error.message : 'Unknown error during daily fetch',
        data: null
      };
    }
  },
  
  // Get all transactions with associated client names
  getAllTransactions: async (auth: AuthContextProps | undefined = undefined) => {
    const response = await transactionApi.getAllTransactions(auth);
    return response; // Return the full response for components to handle
  },
  
  // Get transactions for a specific client
  getTransactionsByClientId: async (clientId: number, auth: AuthContextProps | undefined = undefined) => {
    const response = await transactionApi.getTransactionsByClientId(clientId, auth);
    
    // If we have valid response with data and auth, enrich with client info
    if (response?.result && Array.isArray(response.data) && response.data.length > 0 && auth) {
      try {
        const client = await clientService.getClientById(clientId, auth);
        
        // Create a new response object with enriched data
        return {
          ...response,
          data: response.data.map((transaction: Transaction) => ({
            ...transaction,
            clientName: `${client.firstName} ${client.lastName}`
          }))
        };
      } catch (error) {
        console.error('Error fetching client information:', error);
      }
    }
    
    return response;
  },
  
  // Get transaction by ID with client name
  getTransactionById: async (id: number, auth: AuthContextProps | undefined = undefined) => {
    const response = await transactionApi.getTransactionById(id, auth);
    
    // If we have a valid response with data and auth, enrich with client info
    if (response?.result && response.data && auth) {
      try {
        const client = await clientService.getClientById(response.data.clientId, auth);
        
        // Create a new response object with enriched data
        return {
          ...response,
          data: {
            ...response.data,
            clientName: `${client.firstName} ${client.lastName}`
          }
        };
      } catch (error) {
        console.error('Error fetching client information:', error);
      }
    }
    
    return response;
  },
  
  // Create a new transaction
  createTransaction: (transaction: TransactionPayload, auth: AuthContextProps | undefined = undefined) => {
    return transactionApi.createTransaction(transaction, auth);
  },
  
  // Update an existing transaction
  updateTransaction: (id: number, transaction: Partial<Transaction>, auth: AuthContextProps | undefined = undefined) => {
    return transactionApi.updateTransaction(id, transaction, auth);
  },
  
  // Delete a transaction
  deleteTransaction: (id: number, auth: AuthContextProps | undefined = undefined) => {
    return transactionApi.deleteTransaction(id, auth);
  },
  
  // Get transactions by date range with client names
  getTransactionsByDateRange: async (startDate: string, endDate: string, auth: AuthContextProps | undefined = undefined) => {
    const response = await transactionApi.getTransactionsByDateRange(startDate, endDate, auth);
    
    // If we have valid response with data, filter based on date range
    if (response?.result && Array.isArray(response.data)) {
      const filteredData = response.data.filter((t: Transaction) => {
        const transactionDate = new Date(t.date);
        const start = new Date(startDate);
        const end = new Date(endDate);
        return transactionDate >= start && transactionDate <= end;
      });
      
      // Create a new response with filtered data
      const filteredResponse = {
        ...response,
        data: filteredData
      };
      
      // If we have auth, enrich the filtered data with client names
      if (auth && filteredData.length > 0) {
        try {
          filteredResponse.data = await enrichTransactionsWithClientNames(filteredData, auth);
        } catch (error) {
          console.error('Error enriching transactions with client names:', error);
        }
      }
      
      return filteredResponse;
    }
    
    return response;
  },
  
  // Get transactions by status with client names
  getTransactionsByStatus: async (status: TransactionStatus, auth: AuthContextProps | undefined = undefined) => {
    const response = await transactionApi.getTransactionsByStatus(status, auth);
    
    // If we have valid response with data, filter based on status
    if (response?.result && Array.isArray(response.data)) {
      const filteredData = response.data.filter((t: Transaction) => t.status === status);
      
      // Create a new response with filtered data
      const filteredResponse = {
        ...response,
        data: filteredData
      };
      
      // If we have auth, enrich the filtered data with client names
      if (auth && filteredData.length > 0) {
        try {
          filteredResponse.data = await enrichTransactionsWithClientNames(filteredData, auth);
        } catch (error) {
          console.error('Error enriching transactions with client names:', error);
        }
      }
      
      return filteredResponse;
    }
    
    return response;
  }
};

// Helper function to enrich transactions with client names
async function enrichTransactionsWithClientNames(
  transactions: Transaction[], 
  auth: AuthContextProps | undefined
): Promise<Transaction[]> {
  // If no auth, return transactions as-is
  if (!auth) return transactions;
  
  // Create a Set of unique client IDs to minimize API calls
  const clientIds = new Set(transactions.map(t => t.clientId));
  const clientMap = new Map();
  
  // Fetch client information for each unique client ID
  for (const clientId of clientIds) {
    try {
      const clientResponse = await clientService.getClientById(clientId, auth);
      if (clientResponse?.result && clientResponse.data) {
        const client = clientResponse.data;
        clientMap.set(clientId, `${client.firstName} ${client.lastName}`);
      } else {
        clientMap.set(clientId, 'Unknown Client');
      }
    } catch (error) {
      console.error(`Error fetching client information for client ID ${clientId}:`, error);
      clientMap.set(clientId, 'Unknown Client');
    }
  }
  
  // Enrich transactions with client names
  return transactions.map(transaction => ({
    ...transaction,
    clientName: clientMap.get(transaction.clientId) || 'Unknown Client'
  }));
}