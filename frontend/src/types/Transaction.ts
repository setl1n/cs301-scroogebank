export type TransactionType = 'D' | 'W';
export type TransactionStatus = 'COMPLETED' | 'PENDING' | 'FAILED';

export interface Transaction {
  id: number;
  clientId: number;
  transactionType: TransactionType;
  amount: number;
  date: string; // ISO date string
  status: TransactionStatus;
  // Client-side derived property
  clientName?: string;
}

// Helper function to format transaction type for display
export const formatTransactionType = (type: TransactionType): string => {
  const typeMap: Record<TransactionType, string> = {
    'D': 'Deposit',
    'W': 'Withdrawal'
  };
  return typeMap[type] || type;
};

// Helper function to format transaction status for display
export const formatTransactionStatus = (status: TransactionStatus): string => {
  return status.charAt(0) + status.slice(1).toLowerCase();
};

// Helper function to format transaction amount with currency symbol
export const formatTransactionAmount = (amount: number, currency: string = '$'): string => {
  return `${currency}${amount.toFixed(2)}`;
};

// Helper to determine if a transaction object is valid
export const isValidTransaction = (transaction: Transaction): boolean => {
  return Boolean(
    transaction.clientId &&
    transaction.transactionType &&
    transaction.amount &&
    transaction.date &&
    transaction.status
  );
}; 