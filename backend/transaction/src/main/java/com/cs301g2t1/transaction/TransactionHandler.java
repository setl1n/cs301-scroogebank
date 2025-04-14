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
import com.fasterxml.jackson.databind.ObjectMapper;

/**
 * Lambda handler for processing transactions
 */
public class TransactionHandler implements RequestHandler<Object, Object> {

    private final TransactionService transactionService = new TransactionServiceImpl();
    private final ObjectMapper objectMapper;

    public TransactionHandler() {
        // Initialize and configure the ObjectMapper
        this.objectMapper = new ObjectMapper();
        objectMapper.registerModule(new com.fasterxml.jackson.datatype.jsr310.JavaTimeModule());
        objectMapper.configure(com.fasterxml.jackson.databind.SerializationFeature.WRITE_DATES_AS_TIMESTAMPS, false);
    }

    public static class Request {
        public String operation;
        public Long transactionId;
        public Optional<Transaction> transaction = Optional.empty();
    }

    @Override
    public Object handleRequest(Object input, Context context) {
        context.getLogger().log("Received request: " + input);

        // Check if this is an API Gateway/ALB request with path information
        if (input instanceof Map requestMap) {            
            // Check if this is a health check request to /api/v1/health
            if (requestMap.containsKey("path")) {
                String path = (String) requestMap.get("path");
                if ("/api/v1/health".equals(path)) {
                    context.getLogger().log("Processing health check request");
                    return handleHealthCheck(new HashMap<>());
                }
            }
            
            // Handle ALB/API Gateway request format (where operation is in the body)
            if (requestMap.containsKey("body")) {
                try {
                    // Get the body content which may be a string or a map
                    Object bodyObj = requestMap.get("body");
                    Map<String, Object> bodyMap;
                    
                    if (bodyObj instanceof String) {
                        // Parse the body string as JSON
                        context.getLogger().log("Parsing body string: " + bodyObj);
                        bodyMap = objectMapper.readValue((String) bodyObj, Map.class);
                    } else if (bodyObj instanceof Map) {
                        // Body is already a map
                        bodyMap = (Map<String, Object>) bodyObj;
                    } else {
                        context.getLogger().log("Unexpected body format: " + (bodyObj != null ? bodyObj.getClass() : "null"));
                        return createErrorResponse(400, "Invalid request format");
                    }
                    
                    context.getLogger().log("Parsed body: " + bodyMap);
                    
                    // Now extract operation and other fields from the bodyMap
                    if (bodyMap.containsKey("operation")) {
                        Request request = new Request();
                        request.operation = (String) bodyMap.get("operation");
                        
                        if (bodyMap.containsKey("transactionId")) {
                            // Handle different number types safely
                            Object transactionIdObj = bodyMap.get("transactionId");
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
                        
                        if (bodyMap.containsKey("transaction")) {
                            Object transactionObj = bodyMap.get("transaction");
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
                } catch (Exception e) {
                    context.getLogger().log("Error parsing request body: " + e.getMessage());
                    e.printStackTrace();
                    return createErrorResponse(400, "Error parsing request: " + e.getMessage());
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

        context.getLogger().log("Could not process request format");
        return createErrorResponse(400, "Invalid request format");
    }
    
    // Helper method to create error response
    private Map<String, Object> createErrorResponse(int statusCode, String errorMessage) {
        Map<String, Object> response = new HashMap<>();
        response.put("statusCode", statusCode);
        response.put("headers", createCorsHeaders());
        response.put("body", "{\"result\":false,\"errorMessage\":\"" + errorMessage.replace("\"", "\\\"") + "\",\"data\":null}");
        return response;
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

    private Object handleDailyFetch(Request request, Context context) {
        try {
            String sftpTarget = System.getenv("SFTP_TARGET");
            if (sftpTarget == null || sftpTarget.isEmpty()) {
                throw new IllegalArgumentException("SFTP_TARGET environment variable is not set.");
            }

            String doneDirectory = sftpTarget + "/../.done";
            String errorDirectory = sftpTarget + "/../.error";
            
            // List to collect all processed transactions
            List<Transaction> allProcessedTransactions = new java.util.ArrayList<>();

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
                            Transaction createdTransaction = transactionService.createTransaction(transaction);
                            allProcessedTransactions.add(createdTransaction);
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
            
            // Create ALB-compatible response
            Map<String, Object> response = new HashMap<>();
            response.put("statusCode", 200);
            response.put("headers", createCorsHeaders());
            
            // Create a Response object with the processed transactions and convert it to JSON for the body
            Response<List<Transaction>> responseObj = new Response<>(true, 
                "Daily fetch completed successfully. Processed " + allProcessedTransactions.size() + " transactions.", 
                allProcessedTransactions);
            String responseBody = convertToJson(responseObj);
            response.put("body", responseBody);
            
            return response;
        } catch (Exception e) {
            context.getLogger().log("Error during dailyFetch: " + e.getMessage());
            
            // Create error response
            Map<String, Object> response = new HashMap<>();
            response.put("statusCode", 500);
            response.put("headers", createCorsHeaders());
            response.put("body", "{\"result\":false,\"errorMessage\":\"Failed to complete daily fetch: " 
                    + e.getMessage().replace("\"", "\\\"") + "\",\"data\":null}");
            return response;
        }
    }

    private Object handleCreate(Request request, Context context) {
        try {
            if (!request.transaction.isPresent()) {
                Map<String, Object> response = new HashMap<>();
                response.put("statusCode", 400);
                response.put("headers", createCorsHeaders());
                response.put("body", "{\"result\":false,\"errorMessage\":\"Transaction data is missing\",\"data\":null}");
                return response;
            }

            Transaction transaction = request.transaction.get();
            context.getLogger().log("Creating transaction: " + transaction);

            Transaction createdTransaction = transactionService.createTransaction(transaction);
            
            // Create ALB-compatible response
            Map<String, Object> response = new HashMap<>();
            response.put("statusCode", 201); // 201 Created
            response.put("headers", createCorsHeaders());
            
            // Create a Response object and convert it to JSON for the body
            Response<Transaction> responseObj = new Response<>(true, "Transaction created successfully", createdTransaction);
            String responseBody = convertToJson(responseObj);
            response.put("body", responseBody);
            
            return response;
        } catch (Exception e) {
            context.getLogger().log("Error creating transaction: " + e.getMessage());
            
            // Create error response
            Map<String, Object> response = new HashMap<>();
            response.put("statusCode", 500);
            response.put("headers", createCorsHeaders());
            response.put("body", "{\"result\":false,\"errorMessage\":\"Failed to create transaction: " 
                    + e.getMessage().replace("\"", "\\\"") + "\",\"data\":null}");
            return response;
        }
    }

    private Object handleRead(Request request, Context context) {
        try {
            if (request.transactionId == null) {
                Map<String, Object> response = new HashMap<>();
                response.put("statusCode", 400);
                response.put("headers", createCorsHeaders());
                response.put("body", "{\"result\":false,\"errorMessage\":\"Transaction ID is missing\",\"data\":null}");
                return response;
            }

            Transaction transaction = transactionService.getTransactionById(request.transactionId);
            // Create ALB-compatible response
            Map<String, Object> response = new HashMap<>();
            response.put("statusCode", 200);
            response.put("headers", createCorsHeaders());
            
            // Create a Response object and convert it to JSON for the body
            Response<Transaction> responseObj = new Response<>(true, "Transaction retrieved successfully", transaction);
            String responseBody = convertToJson(responseObj);
            response.put("body", responseBody);
            
            return response;
        } catch (Exception e) {
            context.getLogger().log("Error reading transaction: " + e.getMessage());
            
            // Create error response
            Map<String, Object> response = new HashMap<>();
            response.put("statusCode", 500);
            response.put("headers", createCorsHeaders());
            response.put("body", "{\"result\":false,\"errorMessage\":\"Failed to read transaction: " 
                    + e.getMessage().replace("\"", "\\\"") + "\",\"data\":null}");
            return response;
        }
    }

    private Object handleReadAll(Request request, Context context) {
        try {
            List<Transaction> transactions = transactionService.getAllTransactions();
            
            // Create ALB-compatible response
            Map<String, Object> response = new HashMap<>();
            response.put("statusCode", 200);
            response.put("headers", createCorsHeaders());
            
            // Create a Response object and convert it to JSON for the body
            Response<List<Transaction>> responseObj = new Response<>(true, "All transactions retrieved successfully", transactions);
            String responseBody = convertToJson(responseObj);
            response.put("body", responseBody);
            
            return response;
        } catch (Exception e) {
            context.getLogger().log("Error retrieving all transactions: " + e.getMessage());
            
            // Create error response
            Map<String, Object> response = new HashMap<>();
            response.put("statusCode", 500);
            response.put("headers", createCorsHeaders());
            response.put("body", "{\"result\":false,\"errorMessage\":\"Failed to retrieve all transactions: " 
                    + e.getMessage().replace("\"", "\\\"") + "\",\"data\":null}");
            return response;
        }
    }

    private Object handleReadByClient(Request request, Context context) {
        try {
            if (request.transactionId == null) {
                Map<String, Object> response = new HashMap<>();
                response.put("statusCode", 400);
                response.put("headers", createCorsHeaders());
                response.put("body", "{\"result\":false,\"errorMessage\":\"Client ID is missing\",\"data\":null}");
                return response;
            }

            List<Transaction> transactions = transactionService.getTransactionsByClientId(request.transactionId);
            
            // Create ALB-compatible response
            Map<String, Object> response = new HashMap<>();
            response.put("statusCode", 200);
            response.put("headers", createCorsHeaders());
            
            // Create a Response object and convert it to JSON for the body
            Response<List<Transaction>> responseObj = new Response<>(true, "Transactions for client retrieved successfully", transactions);
            String responseBody = convertToJson(responseObj);
            response.put("body", responseBody);
            
            return response;
        } catch (Exception e) {
            context.getLogger().log("Error retrieving transactions for client: " + e.getMessage());
            
            // Create error response
            Map<String, Object> response = new HashMap<>();
            response.put("statusCode", 500);
            response.put("headers", createCorsHeaders());
            response.put("body", "{\"result\":false,\"errorMessage\":\"Failed to retrieve transactions for client: " 
                    + e.getMessage().replace("\"", "\\\"") + "\",\"data\":null}");
            return response;
        }
    }
    
    private Object handleUpdate(Request request, Context context) {
        try {
            if (request.transactionId == null) {
                Map<String, Object> response = new HashMap<>();
                response.put("statusCode", 400);
                response.put("headers", createCorsHeaders());
                response.put("body", "{\"result\":false,\"errorMessage\":\"Transaction ID is missing\",\"data\":null}");
                return response;
            }

            if (!request.transaction.isPresent()) {
                Map<String, Object> response = new HashMap<>();
                response.put("statusCode", 400);
                response.put("headers", createCorsHeaders());
                response.put("body", "{\"result\":false,\"errorMessage\":\"Transaction data is missing\",\"data\":null}");
                return response;
            }

            Transaction updatedTransaction = transactionService.updateTransaction(request.transactionId, request.transaction.get());
            
            // Create ALB-compatible response
            Map<String, Object> response = new HashMap<>();
            response.put("statusCode", 200);
            response.put("headers", createCorsHeaders());
            
            // Create a Response object and convert it to JSON for the body
            Response<Transaction> responseObj = new Response<>(true, "Transaction updated successfully", updatedTransaction);
            String responseBody = convertToJson(responseObj);
            response.put("body", responseBody);
            
            return response;
        } catch (Exception e) {
            context.getLogger().log("Error updating transaction: " + e.getMessage());
            
            // Create error response
            Map<String, Object> response = new HashMap<>();
            response.put("statusCode", 500);
            response.put("headers", createCorsHeaders());
            response.put("body", "{\"result\":false,\"errorMessage\":\"Failed to update transaction: " 
                    + e.getMessage().replace("\"", "\\\"") + "\",\"data\":null}");
            return response;
        }
    }

    private Object handleDelete(Request request, Context context) {
        try {
            if (request.transactionId == null) {
                Map<String, Object> response = new HashMap<>();
                response.put("statusCode", 400);
                response.put("headers", createCorsHeaders());
                response.put("body", "{\"result\":false,\"errorMessage\":\"Transaction ID is missing\",\"data\":null}");
                return response;
            }

            transactionService.deleteTransaction(request.transactionId);
            
            // Create ALB-compatible response
            Map<String, Object> response = new HashMap<>();
            response.put("statusCode", 200);
            response.put("headers", createCorsHeaders());
            
            // Create a Response object and convert it to JSON for the body
            Response<Object> responseObj = new Response<>(true, "Transaction deleted successfully", null);
            String responseBody = convertToJson(responseObj);
            response.put("body", responseBody);
            
            return response;
        } catch (Exception e) {
            context.getLogger().log("Error deleting transaction: " + e.getMessage());
            
            // Create error response
            Map<String, Object> response = new HashMap<>();
            response.put("statusCode", 500);
            response.put("headers", createCorsHeaders());
            response.put("body", "{\"result\":false,\"errorMessage\":\"Failed to delete transaction: " 
                    + e.getMessage().replace("\"", "\\\"") + "\",\"data\":null}");
            return response;
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
    
    // Helper method to create CORS headers
    private Map<String, String> createCorsHeaders() {
        Map<String, String> headers = new HashMap<>();
        headers.put("Content-Type", "application/json");
        return headers;
    }
    
    // Helper method to convert object to JSON string
    private String convertToJson(Object obj) {
        try {
            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            mapper.registerModule(new com.fasterxml.jackson.datatype.jsr310.JavaTimeModule());
            mapper.configure(com.fasterxml.jackson.databind.SerializationFeature.WRITE_DATES_AS_TIMESTAMPS, false);
            return mapper.writeValueAsString(obj);
        } catch (Exception e) {
            // Fallback to basic JSON if Jackson fails
            if (obj instanceof Response) {
                Response<?> resp = (Response<?>) obj;
                String dataJson = "null";
                if (resp.getData() != null) {
                    if (resp.getData() instanceof List) {
                        dataJson = "[]"; // Simplified - in a real scenario we'd need proper serialization
                    } else {
                        dataJson = "{}"; // Simplified
                    }
                }
                return "{\"result\":" + resp.isResult() + 
                       ",\"errorMessage\":\"" + (resp.getErrorMessage() != null ? resp.getErrorMessage().replace("\"", "\\\"") : "") + "\"," +
                       "\"data\":" + dataJson + "}";
            }
            return "{}";
        }
    }
}
