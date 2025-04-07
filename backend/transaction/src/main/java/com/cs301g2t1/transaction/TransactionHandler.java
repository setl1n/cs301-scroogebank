package com.cs301g2t1.transaction;

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.RequestHandler;
import com.cs301g2t1.transaction.service.TransactionService;
import com.cs301g2t1.transaction.service.TransactionServiceImpl;
import com.cs301g2t1.transaction.utils.SFTPFacade;
import com.cs301g2t1.transaction.utils.SFTPFacadeImpl;
import com.cs301g2t1.transaction.utils.TransactionUtils;

import java.io.InputStream;
import java.util.List;
import java.util.Optional;

import com.cs301g2t1.transaction.model.*;

/**
 * Lambda handler for processing transactions
 */
public class TransactionHandler implements RequestHandler<TransactionHandler.Request, Response> {

    private final TransactionService transactionService = new TransactionServiceImpl();

    public static class Request {
        public String operation;
        public Long transactionId;
        public Optional<Transaction> transaction = Optional.empty();
    }

    @Override
    public Response handleRequest(Request request, Context context) {
        try {
            switch (request.operation) {
                case "dailyFetch":
                    return handleDailyFetch(request, context);

                case "CREATE":
                    return handleCreate(request, context);

                case "READ":
                    return handleRead(request, context);

                case "UPDATE":
                    return handleUpdate(request, context);

                case "DELETE":
                    return handleDelete(request, context);

                default:
                    throw new IllegalArgumentException("Invalid operation: " + request.operation);
            }
        } catch (Exception e) {
            context.getLogger().log("Failed to process request: " + e.getMessage());
            return new Response(false, "Error: " + e.getMessage(), null);
        }
    }

    private Response handleDailyFetch(Request request, Context context) {
        try {
            String sftpTarget = System.getenv("SFTP_TARGET");
            if (sftpTarget == null || sftpTarget.isEmpty()) {
                throw new IllegalArgumentException("SFTP_TARGET environment variable is not set.");
            }

            String doneDirectory = sftpTarget + "/../.done";
            String errorDirectory = sftpTarget + "/../.error";

            // Establish SFTP connection
            try (SFTPFacade sftpFacade = new SFTPFacadeImpl()) {
                sftpFacade.connect();
                List<String> csvFiles = sftpFacade.listFiles(sftpTarget, "*.csv");

                for (String csvFile : csvFiles) {
                    try (InputStream inputStream = sftpFacade.downloadFile(sftpTarget + "/" + csvFile)) {
                        // Parse CSV file
                        List<Transaction> transactions = TransactionUtils.parseCsvToTransactions(inputStream);

                        // Insert transactions into the database
                        for (Transaction transaction : transactions) {
                            transactionService.createTransaction(transaction);
                        }

                        // Move file to .done directory
                        sftpFacade.moveFile(sftpTarget + "/" + csvFile, doneDirectory + "/" + csvFile);
                    } catch (Exception e) {
                        context.getLogger().log("Error processing file " + csvFile + ": " + e.getMessage());
                        // Move file to .error directory
                        sftpFacade.moveFile(sftpTarget + "/" + csvFile, errorDirectory + "/" + csvFile);
                    }
                }
            }

            return new Response(true, "Daily fetch completed successfully.", null);
        } catch (Exception e) {
            context.getLogger().log("Error during dailyFetch: " + e.getMessage());
            return new Response(false, "Failed to complete daily fetch: " + e.getMessage(), null);
        }
    }

    private Response handleCreate(Request request, Context context) {
        try {
            if (!request.transaction.isPresent()) {
                return new Response(false, "Transaction data is missing", null);
            }

            Transaction transaction = request.transaction.get();
            context.getLogger().log("Creating transaction: " + transaction);

            transactionService.createTransaction(transaction);
            return new Response(true, "Transaction created successfully", transaction);
        } catch (Exception e) {
            context.getLogger().log("Error creating transaction: " + e.getMessage());
            return new Response(false, "Failed to create transaction: " + e.getMessage(), null);
        }
    }

    private Response handleRead(Request request, Context context) {
        try {
            if (request.transactionId == null) {
                return new Response(false, "Transaction ID is missing", null);
            }

            Transaction transaction = transactionService.getTransactionById(request.transactionId);
            return new Response(true, "Transaction retrieved successfully", transaction);
        } catch (Exception e) {
            context.getLogger().log("Error reading transaction: " + e.getMessage());
            return new Response(false, "Failed to read transaction: " + e.getMessage(), null);
        }
    }

    private Response handleUpdate(Request request, Context context) {
        try {
            if (request.transactionId == null) {
                return new Response(false, "Transaction ID is missing", null);
            }

            if (!request.transaction.isPresent()) {
                return new Response(false, "Transaction data is missing", null);
            }

            Transaction updatedTransaction = transactionService.updateTransaction(request.transactionId, request.transaction.get());
            return new Response(true, "Transaction updated successfully", updatedTransaction);
        } catch (Exception e) {
            context.getLogger().log("Error updating transaction: " + e.getMessage());
            return new Response(false, "Failed to update transaction: " + e.getMessage(), null);
        }
    }

    private Response handleDelete(Request request, Context context) {
        try {
            if (request.transactionId == null) {
                return new Response(false, "Transaction ID is missing", null);
            }

            transactionService.deleteTransaction(request.transactionId);
            return new Response(true, "Transaction deleted successfully", null);
        } catch (Exception e) {
            context.getLogger().log("Error deleting transaction: " + e.getMessage());
            return new Response(false, "Failed to delete transaction: " + e.getMessage(), null);
        }
    }
}
