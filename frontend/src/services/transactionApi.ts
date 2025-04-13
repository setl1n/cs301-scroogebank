import { api } from './api';
import { AuthContextProps } from 'react-oidc-context';
import { Transaction, TransactionType, TransactionStatus } from '../types/Transaction';

// Base endpoint for transaction API
const TRANSACTION_ENDPOINT = '/transactions';

export interface TransactionPayload {
  clientId: number;
  transactionType: TransactionType;
  amount: number;
  date: string;
  status?: TransactionStatus;
}

export const transactionApi = {
  // Get all transactions
  getAllTransactions: (auth: AuthContextProps | undefined = undefined) => {
    return api.get(TRANSACTION_ENDPOINT, auth);
  },
  
  // Get transactions for a specific client
  getTransactionsByClientId: (clientId: number, auth: AuthContextProps | undefined = undefined) => {
    return api.get(`${TRANSACTION_ENDPOINT}/client/${clientId}`, auth);
  },
  
  // Get transaction by ID
  getTransactionById: (id: number, auth: AuthContextProps | undefined = undefined) => {
    return api.get(`${TRANSACTION_ENDPOINT}/${id}`, auth);
  },
  
  // Create a new transaction
  createTransaction: (transaction: TransactionPayload, auth: AuthContextProps | undefined = undefined) => {
    // Default status to PENDING if not provided
    const transactionData = {
      ...transaction,
      status: transaction.status || 'PENDING'
    };
    return api.post(TRANSACTION_ENDPOINT, transactionData, auth);
  },
  
  // Update an existing transaction
  updateTransaction: (id: number, transaction: Partial<Transaction>, auth: AuthContextProps | undefined = undefined) => {
    return api.put(`${TRANSACTION_ENDPOINT}/${id}`, transaction, auth);
  },
  
  // Delete a transaction
  deleteTransaction: (id: number, auth: AuthContextProps | undefined = undefined) => {
    return api.delete(`${TRANSACTION_ENDPOINT}/${id}`, auth);
  },
  
  // Get transactions by date range
  getTransactionsByDateRange: (startDate: string, endDate: string, auth: AuthContextProps | undefined = undefined) => {
    return api.get(
      `${TRANSACTION_ENDPOINT}/daterange?start=${startDate}&end=${endDate}`, 
      auth
    );
  },
  
  // Get transactions by status
  getTransactionsByStatus: (status: TransactionStatus, auth: AuthContextProps | undefined = undefined) => {
    return api.get(`${TRANSACTION_ENDPOINT}/status/${status}`, auth);
  }
}; 