package com.cs301g2t1.account.model;

import java.time.LocalDate;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Size;

import lombok.Data;
import java.io.Serializable;

@Entity
@Data
public class Account implements Serializable {
    // Add a serialVersionUID
    private static final long serialVersionUID = 1L;
    
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "Account ID")
    private Long accountId;

    @NotNull(message = "Client ID is required")
    @Column(name="Client ID")
    private Long clientId;

    // example: "Savings", "Checking", "Business"
    @NotBlank(message = "Account type is required")
    @Size(min = 2, max = 30)
    @Column(name="Account Type")
    private String accountType;

    // example: "Active", "Inactive", "Pending"
    @NotBlank(message = "Account status is required")
    @Size(min = 2, max = 30)
    @Column(name="Account Status")
    private String accountStatus;

    @NotNull(message = "Account opening date is required")
    @PastOrPresent(message = "Account opening date must be in the past or present")
    @Column(name="Opening Date")
    private LocalDate openingDate;

    @NotNull(message = "Account initial deposit is required")
    @Column(name="Initial Deposit")
    private Double initialDeposit;

    @NotBlank(message = "Currency is required")
    @Column(name="Currency")
    private String currency;

    @NotBlank(message = "Branch ID is required")
    @Size(min = 2, max = 30)
    @Column(name="Branch ID")
    private String branchId; 
}
