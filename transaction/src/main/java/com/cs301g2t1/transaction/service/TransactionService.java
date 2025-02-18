package com.cs301g2t1.transaction.service;

import com.cs301g2t1.transaction.model.Transaction;
import java.util.List;

public interface TransactionService {
    List<Transaction> getAllTransactions();
    Transaction getTransactionById(Long id);
    Transaction createTransaction(Transaction transaction);
    Transaction updateTransaction(Long id, Transaction transaction);
    void deleteTransaction(Long id);
}