package com.cs301g2t1.transaction.service;

import com.cs301g2t1.transaction.model.Transaction;
import com.cs301g2t1.transaction.repository.TransactionRepository;
import com.cs301g2t1.transaction.repository.TransactionRepositoryImpl;

import java.util.List;

public class TransactionServiceImpl implements TransactionService {

    private TransactionRepository transactionRepository = TransactionRepositoryImpl.getInstance();

    @Override
    public List<Transaction> getAllTransactions() {
        return transactionRepository.findAll();
    }

    @Override
    public Transaction getTransactionById(Long id) {
        return transactionRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Transaction not found with ID: " + id));
    }

    @Override
    public Transaction createTransaction(Transaction transaction) {
        return transactionRepository.save(transaction);
    }

    @Override
    public Transaction updateTransaction(Long id, Transaction updatedTransaction) {
        Transaction existingTransaction = transactionRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Transaction not found with ID: " + id));
        existingTransaction.setClientId(updatedTransaction.getClientId());
        existingTransaction.setTransactionType(updatedTransaction.getTransactionType());
        existingTransaction.setAmount(updatedTransaction.getAmount());
        existingTransaction.setDate(updatedTransaction.getDate());
        existingTransaction.setStatus(updatedTransaction.getStatus());
        return transactionRepository.save(existingTransaction);
    }

    @Override
    public void deleteTransaction(Long id) {
        if (!transactionRepository.existsById(id)) {
            throw new IllegalArgumentException("Transaction not found with ID: " + id);
        }
        transactionRepository.deleteById(id);
    }
}