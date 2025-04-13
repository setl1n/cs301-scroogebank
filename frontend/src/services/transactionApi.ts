import { api } from './api';
import { AuthContextProps } from 'react-oidc-context';
import { Transaction, TransactionType, TransactionStatus } from '../types/Transaction';

// Base endpoint for transaction API
const TRANSACTION_ENDPOINT = '/transaction';

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
    return api.post(TRANSACTION_ENDPOINT, {
      operation: "READ_ALL"
    }, auth);
  },
  
  // Get transactions for a specific client
  getTransactionsByClientId: (clientId: number, auth: AuthContextProps | undefined = undefined) => {
    return api.post(TRANSACTION_ENDPOINT, {
      operation: "READ_BY_CLIENT",
      transactionId: clientId
    }, auth);
  },
  
  // Get transaction by ID
  getTransactionById: (id: number, auth: AuthContextProps | undefined = undefined) => {
    return api.post(TRANSACTION_ENDPOINT, {
      operation: "READ",
      transactionId: id
    }, auth);
  },
  
  // Create a new transaction
  createTransaction: (transaction: TransactionPayload, auth: AuthContextProps | undefined = undefined) => {
    // Default status to PENDING if not provided
    const transactionData = {
      ...transaction,
      status: transaction.status || 'PENDING'
    };
    
    return api.post(TRANSACTION_ENDPOINT, {
      operation: "CREATE",
      transaction: transactionData
    }, auth);
  },
  
  // Update an existing transaction
  updateTransaction: (id: number, transaction: Partial<Transaction>, auth: AuthContextProps | undefined = undefined) => {
    return api.post(TRANSACTION_ENDPOINT, {
      operation: "UPDATE",
      transactionId: id,
      transaction: transaction
    }, auth);
  },
  
  // Delete a transaction
  deleteTransaction: (id: number, auth: AuthContextProps | undefined = undefined) => {
    return api.post(TRANSACTION_ENDPOINT, {
      operation: "DELETE",
      transactionId: id
    }, auth);
  },
  
  // Get transactions by date range
  getTransactionsByDateRange: (startDate: string, endDate: string, auth: AuthContextProps | undefined = undefined) => {
    return api.post(TRANSACTION_ENDPOINT, {
      operation: "READ_ALL"
    }, auth).then(transactions => {
      return transactions.filter((t: Transaction) => {
        const transactionDate = new Date(t.date);
        const start = new Date(startDate);
        const end = new Date(endDate);
        return transactionDate >= start && transactionDate <= end;
      });
    });
  },
  
  // Get transactions by status
  getTransactionsByStatus: (status: TransactionStatus, auth: AuthContextProps | undefined = undefined) => {
    return api.post(TRANSACTION_ENDPOINT, {
      operation: "READ_ALL"
    }, auth).then(transactions => {
      return transactions.filter((t: Transaction) => t.status === status);
    });
  }
};