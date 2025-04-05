package com.cs301g2t1.transaction;

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.RequestHandler;
import com.cs301g2t1.transaction.service.TransactionService;
import com.cs301g2t1.transaction.service.TransactionServiceImpl;
import com.cs301g2t1.transaction.utils.SSHBuilder;
import com.cs301g2t1.transaction.utils.SSHBuilderImpl;
import com.cs301g2t1.transaction.utils.TransactionUtils;

import java.io.InputStream;
import java.util.List;

import com.cs301g2t1.transaction.model.*;

/**
 * Lambda handler for processing transactions
 */
public class TransactionHandler implements RequestHandler<TransactionHandler.Request, Response> {

    private final TransactionService transactionService = new TransactionServiceImpl();

    public static class Request {
        public String operation;
        public Long transactionId;
        public Transaction transaction;
    }

    @Override
    public Response handleRequest(Request request, Context context) {
        try {
            switch (request.operation) {
                case "dailyFetch":
                    try {
                        String sftpTarget = System.getenv("SFTP_TARGET");
                        if (sftpTarget == null || sftpTarget.isEmpty()) {
                            throw new IllegalArgumentException("SFTP_TARGET environment variable is not set.");
                        }

                        String doneDirectory = sftpTarget + "/../.done";
                        String errorDirectory = sftpTarget + "/../.error";

                        // Establish SFTP connection
                        try (SSHBuilder sshBuilder = new SSHBuilderImpl()) {
                            sshBuilder.connect();
                            List<String> csvFiles = sshBuilder.listFiles(sftpTarget, "*.csv");

                            for (String csvFile : csvFiles) {
                                try (InputStream inputStream = sshBuilder.downloadFile(sftpTarget + "/" + csvFile)) {
                                    // Parse CSV file
                                    List<Transaction> transactions = TransactionUtils.parseCsvToTransactions(inputStream);

                                    // Insert transactions into the database
                                    for (Transaction transaction : transactions) {
                                        transactionService.createTransaction(transaction);
                                    }

                                    // Move file to .done directory
                                    sshBuilder.moveFile(sftpTarget + "/" + csvFile, doneDirectory + "/" + csvFile);
                                } catch (Exception e) {
                                    context.getLogger().log("Error processing file " + csvFile + ": " + e.getMessage());
                                    // Move file to .error directory
                                    sshBuilder.moveFile(sftpTarget + "/" + csvFile, errorDirectory + "/" + csvFile);
                                }
                            }
                        }

                        return new Response(true, "Daily fetch completed successfully.", null);
                    } catch (Exception e) {
                        context.getLogger().log("Error during dailyFetch: " + e.getMessage());
                        return new Response(false, "Failed to complete daily fetch: " + e.getMessage(), null);
                    }
                case "CREATE":
                    try {
                        // Log the incoming transaction data in more detail
                        context.getLogger().log("Creating transaction: " + request.transaction);
                        if (request.transaction == null) {
                            return new Response(false, "Transaction data is null", null);
                        }
                        
                        // Log each field to help debug
                        context.getLogger().log("Transaction details - clientId: " + request.transaction.getClientId() 
                            + ", type: " + request.transaction.getTransactionType()
                            + ", amount: " + request.transaction.getAmount()
                            + ", date: " + request.transaction.getDate()
                            + ", status: " + request.transaction.getStatus());
                            
                        Transaction transaction = transactionService.createTransaction(request.transaction);
                        return new Response(true, "", transaction);
                    } catch (Exception e) {
                        // Enhanced error logging
                        context.getLogger().log("Error creating transaction: " + e.getMessage());
                        context.getLogger().log("Error stack trace: " + e.getStackTrace());
                        if (e.getCause() != null) {
                            context.getLogger().log("Caused by: " + e.getCause().getMessage());
                        }
                        return new Response(false, "Failed to create transaction: " + e.getMessage(), null);
                    }
                case "READ":
                    try {
                        Transaction transaction = transactionService.getTransactionById(request.transactionId);
                        return new Response(true, "", transaction);
                    } catch (Exception e) {
                        return new Response(false, e.getMessage(), null);
                    }
                case "UPDATE":
                    try {
                        Transaction transaction = transactionService.updateTransaction(request.transactionId,
                                request.transaction);
                        return new Response(true, "", transaction);
                    } catch (Exception e) {
                        return new Response(false, e.getMessage(), null);
                    }
                case "DELETE":
                    try {
                        transactionService.deleteTransaction(request.transactionId);
                        return new Response(true, "", null);
                    } catch (Exception e) {
                        return new Response(false, e.getMessage(), null);
                    }
                default:
                    throw new IllegalArgumentException("Invalid operation: " + request.operation);
            }
        } catch (Exception e) {
            context.getLogger().log("Failed to process request: " + e.getMessage());
            throw new RuntimeException(e);
        }
    }
}
