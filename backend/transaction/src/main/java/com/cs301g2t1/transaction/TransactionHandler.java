package com.cs301g2t1.transaction;

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.RequestHandler;
import com.cs301g2t1.transaction.service.TransactionService;
import com.cs301g2t1.transaction.service.TransactionServiceImpl;
import com.cs301g2t1.transaction.utils.SFTPFacade;
import com.cs301g2t1.transaction.utils.SFTPFacadeImpl;
import com.cs301g2t1.transaction.utils.TransactionUtils;

import java.io.InputStream;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import com.cs301g2t1.transaction.model.*;

/**
 * Lambda handler for processing transactions
 */
public class TransactionHandler implements RequestHandler<Object, Object> {

    private final TransactionService transactionService = new TransactionServiceImpl();

    public static class Request {
        public String operation;
        public Long transactionId;
        public Optional<Transaction> transaction = Optional.empty();
    }

    @Override
    public Object handleRequest(Object input, Context context) {
        context.getLogger().log("Received request: " + input);

        // Check if this is an API Gateway request with path information
        if (input instanceof Map requestMap) {            
            // Check if this is a health check request to /api/v1/health
            if (requestMap.containsKey("path")) {
                String path = (String) requestMap.get("path");
                if ("/api/v1/health".equals(path)) {
                    context.getLogger().log("Processing health check request");
                    return handleHealthCheck(new HashMap<>());
                }
            }
            
            // For compatibility with original code, convert Map to Request if it has operation
            if (requestMap.containsKey("operation")) {
                Request request = new Request();
                request.operation = (String) requestMap.get("operation");
                
                if (requestMap.containsKey("transactionId")) {
                    // Handle different number types safely
                    Object transactionIdObj = requestMap.get("transactionId");
                    if (transactionIdObj instanceof Number) {
                        request.transactionId = ((Number) transactionIdObj).longValue();
                    } else if (transactionIdObj != null) {
                        try {
                            request.transactionId = Long.valueOf(transactionIdObj.toString());
                        } catch (NumberFormatException e) {
                            context.getLogger().log("Invalid transactionId format: " + transactionIdObj);
                        }
                    }
                }
                
                if (requestMap.containsKey("transaction")) {
                    // This assumes transaction is already a proper object that can be cast to Transaction
                    // In a real implementation you might need JSON deserialization here
                    Object transactionObj = requestMap.get("transaction");
                    if (transactionObj != null) {
                        if (transactionObj instanceof Transaction) {
                            request.transaction = Optional.of((Transaction) transactionObj);
                        } else if (transactionObj instanceof Map mapTransactionObj) {
                            // Convert the Map to a Transaction object
                            Transaction transaction = mapToTransaction(mapTransactionObj);
                            request.transaction = Optional.of(transaction);
                        }
                    }
                }
                
                return handleRegularRequest(request, context);
            }
        } else if (input instanceof Request) {
            // If it's already a Request object, process it directly
            return handleRegularRequest((Request) input, context);
        }

        return new Response<>(false, "Invalid request format", null);
    }
    
    private Transaction mapToTransaction(Map<String, Object> map) {
        Transaction transaction = new Transaction();
        
        if (map.containsKey("id") && map.get("id") != null) {
            Object idObj = map.get("id");
            if (idObj instanceof Number) {
                transaction.setId(((Number) idObj).longValue());
            } else {
                transaction.setId(Long.valueOf(idObj.toString()));
            }
        }
        
        if (map.containsKey("clientId") && map.get("clientId") != null) {
            Object clientIdObj = map.get("clientId");
            if (clientIdObj instanceof Number) {
                transaction.setClientId(((Number) clientIdObj).longValue());
            } else {
                transaction.setClientId(Long.valueOf(clientIdObj.toString()));
            }
        }
        
        if (map.containsKey("transactionType")) {
            // Convert String to TransactionType enum with special mapping for DEPOSIT/WITHDRAWAL
            String typeStr = (String) map.get("transactionType");
            if ("DEPOSIT".equalsIgnoreCase(typeStr)) {
                transaction.setTransactionType(TransactionType.D);
            } else if ("WITHDRAWAL".equalsIgnoreCase(typeStr)) {
                transaction.setTransactionType(TransactionType.W);
            } else {
                try {
                    TransactionType type = TransactionType.valueOf(typeStr);
                    transaction.setTransactionType(type);
                } catch (IllegalArgumentException e) {
                    // Handle invalid enum value
                    System.err.println("Invalid transaction type: " + typeStr);
                }
            }
        }
        
        if (map.containsKey("amount") && map.get("amount") != null) {
            Object amountObj = map.get("amount");
            if (amountObj instanceof Number) {
                transaction.setAmount(((Number) amountObj).doubleValue());
            } else {
                transaction.setAmount(Double.valueOf(amountObj.toString()));
            }
        }
        
        if (map.containsKey("date")) {
            // Convert String to LocalDate
            String dateStr = (String) map.get("date");
            try {
                LocalDate date = LocalDate.parse(dateStr);
                transaction.setDate(date);
            } catch (Exception e) {
                // Handle date parsing error
                System.err.println("Invalid date format: " + dateStr);
            }
        }
        
        if (map.containsKey("status")) {
            // Convert String to TransactionStatus enum
            String statusStr = (String) map.get("status");
            try {
                TransactionStatus status = TransactionStatus.valueOf(statusStr);
                transaction.setStatus(status);
            } catch (IllegalArgumentException e) {
                // Handle invalid enum value
                System.err.println("Invalid transaction status: " + statusStr);
            }
        }
        
        return transaction;
    }

    // Handles the original request format
    private Object handleRegularRequest(Request request, Context context) {
        try {
            switch (request.operation) {
                case "testSftpConnection":
                    return testSftpConnection(request, context);

                case "dailyFetch":
                    return handleDailyFetch(request, context);

                case "CREATE":
                    return handleCreate(request, context);

                case "READ":
                    return handleRead(request, context);

                case "READ_ALL":
                    return handleReadAll(request, context);

                case "READ_BY_CLIENT":
                    return handleReadByClient(request, context);

                case "UPDATE":
                    return handleUpdate(request, context);

                case "DELETE":
                    return handleDelete(request, context);

                default:
                    throw new IllegalArgumentException("Invalid operation: " + request.operation);
            }
        } catch (Exception e) {
            context.getLogger().log("Failed to process request: " + e.getMessage());
            return new Response<>(false, "Error: " + e.getMessage(), null);
        }
    }

    private Map<String, Object> handleHealthCheck(Map<String, Object> response) {
        response.put("statusCode", 200);
        response.put("body", "{\"status\":\"healthy\"}");
        return response;
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

    private Response<List<Transaction>> handleReadAll(Request request, Context context) {
        try {
            List<Transaction> transactions = transactionService.getAllTransactions();
            return new Response<>(true, "All transactions retrieved successfully", transactions);
        } catch (Exception e) {
            context.getLogger().log("Error retrieving all transactions: " + e.getMessage());
            return new Response<>(false, "Failed to retrieve all transactions: " + e.getMessage(), null);
        }
    }

    private Response<List<Transaction>> handleReadByClient(Request request, Context context) {
        try {
            if (request.transactionId == null) {
                return new Response<>(false, "Client ID is missing", null);
            }

            List<Transaction> transactions = transactionService.getTransactionsByClientId(request.transactionId);
            return new Response<>(true, "Transactions for client retrieved successfully", transactions);
        } catch (Exception e) {
            context.getLogger().log("Error retrieving transactions for client: " + e.getMessage());
            return new Response<>(false, "Failed to retrieve transactions for client: " + e.getMessage(), null);
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

    private Response testSftpConnection(Request request, Context context) {
        context.getLogger().log("Testing SFTP connection...");

        try (SFTPFacade sftpFacade = new SFTPFacadeImpl()) {
            // Print environment variables for debugging
            String host = System.getenv("SFTP_HOST");
            String username = System.getenv("SFTP_USER");
            String hasPassword = System.getenv("SFTP_PASS") != null ? "yes" : "no";
            String privateKeySecretName = System.getenv("SFTP_PRIVATE_KEY_SECRET_NAME");

            context.getLogger().log("SFTP_HOST: " + host);
            context.getLogger().log("SFTP_USER: " + username);
            context.getLogger().log("SFTP_PASS available: " + hasPassword);
            context.getLogger().log("SFTP_PRIVATE_KEY_SECRET_NAME: " + privateKeySecretName);

            // Attempt connection
            sftpFacade.connect();
            context.getLogger().log("SFTP connection successful!");

            // List a directory to verify full access
            String sftpTarget = System.getenv("SFTP_TARGET");
            List<String> files = sftpFacade.listFiles(sftpTarget, "*");
            context.getLogger().log("Found " + files.size() + " files in " + sftpTarget);

            return new Response(true, "SFTP connection successful", null);
        } catch (Exception e) {
            context.getLogger().log("SFTP connection failed: " + e.getMessage());
            e.printStackTrace();
            return new Response(false, "SFTP connection failed: " + e.getMessage(), null);
        }
    }
}
