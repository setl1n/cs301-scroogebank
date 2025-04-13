import { AuthContextProps } from 'react-oidc-context';
import { transactionApi, TransactionPayload } from './transactionApi';
import { Transaction, TransactionStatus } from '../types/Transaction';
import { clientService } from './clientService';

// Enhanced service that adds business logic on top of API calls
export const transactionService = {
  // Get all transactions with associated client names
  getAllTransactions: async (auth: AuthContextProps | null = null): Promise<Transaction[]> => {
    const transactions = await transactionApi.getAllTransactions(auth);
    
    // If transactions are found, enrich them with client names
    if (transactions && transactions.length > 0) {
      return await enrichTransactionsWithClientNames(transactions, auth);
    }
    
    return transactions;
  },
  
  // Get transactions for a specific client
  getTransactionsByClientId: async (clientId: number, auth: AuthContextProps | null = null): Promise<Transaction[]> => {
    const transactions = await transactionApi.getTransactionsByClientId(clientId, auth);
    
    // If we have transactions and we have authentication, get client info
    if (transactions && transactions.length > 0 && auth) {
      try {
        const client = await clientService.getClientById(clientId, auth);
        return transactions.map(transaction => ({
          ...transaction,
          clientName: `${client.firstName} ${client.lastName}`
        }));
      } catch (error) {
        console.error('Error fetching client information:', error);
      }
    }
    
    return transactions;
  },
  
  // Get transaction by ID with client name
  getTransactionById: async (id: number, auth: AuthContextProps | null = null): Promise<Transaction> => {
    const transaction = await transactionApi.getTransactionById(id, auth);
    
    // If we have a transaction and we have authentication, get client info
    if (transaction && auth) {
      try {
        const client = await clientService.getClientById(transaction.clientId, auth);
        return {
          ...transaction,
          clientName: `${client.firstName} ${client.lastName}`
        };
      } catch (error) {
        console.error('Error fetching client information:', error);
      }
    }
    
    return transaction;
  },
  
  // Create a new transaction
  createTransaction: (transaction: TransactionPayload, auth: AuthContextProps | null = null) => {
    return transactionApi.createTransaction(transaction, auth);
  },
  
  // Update an existing transaction
  updateTransaction: (id: number, transaction: Partial<Transaction>, auth: AuthContextProps | null = null) => {
    return transactionApi.updateTransaction(id, transaction, auth);
  },
  
  // Delete a transaction
  deleteTransaction: (id: number, auth: AuthContextProps | null = null) => {
    return transactionApi.deleteTransaction(id, auth);
  },
  
  // Get transactions by date range with client names
  getTransactionsByDateRange: async (startDate: string, endDate: string, auth: AuthContextProps | null = null): Promise<Transaction[]> => {
    const transactions = await transactionApi.getTransactionsByDateRange(startDate, endDate, auth);
    
    if (transactions && transactions.length > 0) {
      return await enrichTransactionsWithClientNames(transactions, auth);
    }
    
    return transactions;
  },
  
  // Get transactions by status with client names
  getTransactionsByStatus: async (status: TransactionStatus, auth: AuthContextProps | null = null): Promise<Transaction[]> => {
    const transactions = await transactionApi.getTransactionsByStatus(status, auth);
    
    if (transactions && transactions.length > 0) {
      return await enrichTransactionsWithClientNames(transactions, auth);
    }
    
    return transactions;
  }
};

// Helper function to enrich transactions with client names
async function enrichTransactionsWithClientNames(
  transactions: Transaction[], 
  auth: AuthContextProps | null
): Promise<Transaction[]> {
  // If no auth, return transactions as-is
  if (!auth) return transactions;
  
  // Create a Set of unique client IDs to minimize API calls
  const clientIds = new Set(transactions.map(t => t.clientId));
  const clientMap = new Map();
  
  // Fetch client information for each unique client ID
  for (const clientId of clientIds) {
    try {
      const client = await clientService.getClientById(clientId, auth);
      clientMap.set(clientId, `${client.firstName} ${client.lastName}`);
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