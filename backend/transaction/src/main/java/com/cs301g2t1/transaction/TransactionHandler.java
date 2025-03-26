package com.cs301g2t1.transaction;

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.RequestHandler;
import com.cs301g2t1.transaction.service.TransactionService;
import com.cs301g2t1.transaction.service.TransactionServiceImpl;

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
