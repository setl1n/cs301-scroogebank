import { AuthContextProps } from 'react-oidc-context';
import { transactionApi, TransactionPayload } from './transactionApi';
import { Transaction, TransactionStatus } from '../types/Transaction';
import { clientService } from './clientService';


// Enhanced service that adds business logic on top of API calls
export const transactionService = {
  // Trigger daily fetch of transactions from SFTP server
  dailyFetch: async (auth: AuthContextProps | undefined = undefined) => {
    try {
      const response = await transactionApi.dailyFetch(auth);
      
      // If we have valid response with data, enrich the transactions with client names
      if (response?.result && Array.isArray(response.data) && response.data.length > 0 && auth) {
        try {
          const enrichedTransactions = await enrichTransactionsWithClientNames(response.data);
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
          filteredResponse.data = await enrichTransactionsWithClientNames(filteredData);
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
          filteredResponse.data = await enrichTransactionsWithClientNames(filteredData);
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
  transactions: Transaction[]
): Promise<Transaction[]> {
  // Simply return the original transactions without enrichment
  return transactions;
}