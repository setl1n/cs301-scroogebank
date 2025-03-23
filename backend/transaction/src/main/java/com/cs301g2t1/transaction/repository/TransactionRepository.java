package com.cs301g2t1.transaction.repository;

import com.cs301g2t1.transaction.model.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {
}