package com.cs301g2t1.transaction.repository;

import com.cs301g2t1.transaction.model.Transaction;
import java.util.List;
import java.util.Optional;

public interface TransactionRepository {
    List<Transaction> findAll();
    Optional<Transaction> findById(Long id);
    List<Transaction> findAllByClientId(Long clientId);
    Transaction save(Transaction transaction);
    void deleteById(Long id);
    boolean existsById(Long id);
}