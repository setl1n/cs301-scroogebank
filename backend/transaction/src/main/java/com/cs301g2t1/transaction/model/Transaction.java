package com.cs301g2t1.transaction.model;

import java.time.LocalDate;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
@Entity
public class Transaction {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    @NotNull(message = "Client ID is required")
    private Long clientId;

    @NotBlank(message = "Transaction type is required")
    @Enumerated(EnumType.STRING)
    private TransactionType transactionType;

    @NotNull(message = "Amount is required")
    private double amount;

    @NotNull(message = "Transaction date is required")
    private LocalDate date;

    @NotBlank(message = "Status is required")
    @Enumerated(EnumType.STRING)
    private TransactionStatus status; // Expected values: Completed, Pending, Failed
}