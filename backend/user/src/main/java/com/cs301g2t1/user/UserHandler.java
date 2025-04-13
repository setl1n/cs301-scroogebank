package com.cs301g2t1.user;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.RequestHandler;
import com.cs301g2t1.user.model.Response;
import com.cs301g2t1.user.model.User;
import com.cs301g2t1.user.service.UserService;
import com.cs301g2t1.user.service.UserServiceImpl;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
/**
 * Lambda handler for processing user operations
 */
public class UserHandler implements RequestHandler<Object, Object> {

    private final UserService userService = new UserServiceImpl();

    public static class Request {
        public String operation;
        public String userId;
        public User user;
    }

    @Override
    public Object handleRequest(Object input, Context context) {
        Map<String, Object> response = new HashMap<>();
        Map<String, String> headers = new HashMap<>();
        headers.put("Content-Type", "application/json");
        response.put("headers", headers);

        context.getLogger().log("inside handleRequest method");
        context.getLogger().log("USER_POOL_ID: " + System.getenv("COGNITO_USER_POOL_ID"));
        context.getLogger().log("APP_CLIENT_ID: " + System.getenv("COGNITO_APP_CLIENT_ID"));
        
        // Check if this is an API Gateway request with path information
        if (input instanceof Map) {
            context.getLogger().log("Received input: " + input.toString());
            @SuppressWarnings("unchecked")
            Map<String, Object> requestMap = (Map<String, Object>) input;
            
            // Check if this is a health check request to /api/v1/health
            if (requestMap.containsKey("path")) {
                String path = (String) requestMap.get("path");
                context.getLogger().log("Request path: " + path);
                if ("/api/v1/health".equals(path)) {
                    context.getLogger().log("Processing health check request");
                    return handleHealthCheck(new HashMap<>());
                }
                context.getLogger().log("not health check: " + path);
            }

            /*
             * body={
                "operation": "CREATE",
                "user": {
                    "firstName": "abc",
                    "lastName": "xyz",
                    "email": "abc.xyz@example.com", 
                    "role": "AGENT"
                }
             */
            Map<String, Object> requestBody;
            if (requestMap.containsKey("body") && requestMap.get("body") instanceof String) {
                String bodyStr = (String) requestMap.get("body");
                context.getLogger().log("Body is a string, parsing JSON: " + bodyStr);
                
                try {
                    // Parse JSON string to Map using Jackson ObjectMapper
                    ObjectMapper mapper = new ObjectMapper();
                    requestBody = mapper.readValue(bodyStr, new TypeReference<Map<String, Object>>() {});
                } catch (Exception e) {
                    context.getLogger().log("Failed to parse body as JSON: " + e.getMessage());
                    response.put("statusCode", 400);
                    response.put("body", "{\"error\":\"Invalid JSON format\"}");
                    return response;
                }
            } else {
                // Body is already a                 
                requestBody = (Map<String, Object>) requestMap.get("body");
            }
            context.getLogger().log("Request body: " + requestBody);
            // Convert Map to Request if it has operation
            if (requestBody.containsKey("operation")) {
                context.getLogger().log("Processing request with operation: " + requestBody.get("operation"));
                Request request = new Request();
                request.operation = (String) requestBody.get("operation");
                
                if (requestBody.containsKey("userId")) {
                    request.userId = (String) requestBody.get("userId");
                }
                
                if (requestBody.containsKey("user")) {
                    // Use ObjectMapper to convert the nested map to a User object
                    ObjectMapper mapper = new ObjectMapper();
                    try {
                        request.user = mapper.convertValue(requestBody.get("user"), User.class);
                        context.getLogger().log("Converted user object successfully");
                    } catch (Exception e) {
                        context.getLogger().log("Failed to convert user data: " + e.getMessage());
                        response.put("statusCode", 400);
                        response.put("body", "{\"error\":\"Invalid user data format\"}");
                        return response;
                    }
                }
                
                return processRequest(request, context, response);
            }
        } else if (input instanceof Request) {
            // If it's already a Request object, process it directly
            return processRequest((Request) input, context, response);
        }
        response.put("statusCode", 400);
        response.put("body", "{\"error\":\"Invalid request format\"}");
        return response;
    }
    
    private Map<String, Object> processRequest(Request request, Context context, Map<String, Object> response) {
        try {
            switch (request.operation) {
                case "CREATE":
                    try {
                        context.getLogger().log("Creating user: " + request.user);
                        if (request.user == null) {
                            response.put("statusCode", 400);
                            response.put("body", "{\"error\":\"User data is null\"}");
                            return response;
                        }
                        
                        // Log details for debugging
                        context.getLogger().log("User details - firstName: " + request.user.getFirstName() 
                            + ", lastName: " + request.user.getLastName()
                            + ", email: " + request.user.getEmail()
                            + ", role: " + request.user.getRole());
                            
                        User user = userService.createUser(request.user);
                        
                        context.getLogger().log("User created successfully: " + user);
                        response.put("statusCode", 201);
                        response.put("body", "{\"message\":\"User created successfully\"}");
                        return response;
                    } catch (Exception e) {
                        context.getLogger().log("Error creating user: " + e.getMessage());
                        context.getLogger().log("Error stack trace: " + e.getStackTrace());
                        if (e.getCause() != null) {
                            context.getLogger().log("Caused by: " + e.getCause().getMessage());
                        }
                        response.put("statusCode", 500);
                        response.put("body", "{\"error\":\"Failed to create user: " + e.getMessage() + "\"}");
                        return response;
                    }
                case "READ":
                    try {
                        Optional<User> userOptional = userService.getUserById(request.userId);
                        if (userOptional.isPresent()) {
                            // Convert to JSON string with ObjectMapper
                            ObjectMapper mapper = new ObjectMapper();
                            String userJson = mapper.writeValueAsString(userOptional.get());
                            response.put("statusCode", 200);
                            response.put("body", userJson);
                        } else {
                            response.put("statusCode", 404);
                            response.put("body", "{\"error\":\"User not found with ID: " + request.userId + "\"}");
                        }
                        return response;
                    } catch (Exception e) {
                        context.getLogger().log("Error retrieving user: " + e.getMessage());
                        response.put("statusCode", 500);
                        response.put("body", "{\"error\":\"" + e.getMessage() + "\"}");
                        return response;
                    }
                case "UPDATE":
                    try {
                        User user = userService.updateUser(request.userId, request.user);
                        // Convert to JSON string with ObjectMapper
                        ObjectMapper mapper = new ObjectMapper();
                        String userJson = mapper.writeValueAsString(user);
                        response.put("statusCode", 200);
                        response.put("body", userJson);
                        return response;
                    } catch (Exception e) {
                        context.getLogger().log("Error updating user: " + e.getMessage());
                        response.put("statusCode", 400);
                        response.put("body", "{\"error\":\"" + e.getMessage() + "\"}");
                        return response;
                    }
                case "DELETE":
                    try {
                        userService.deleteUser(request.userId);
                        response.put("statusCode", 204); // No Content
                        response.put("body", "{\"message\":\"User deleted successfully\"}");
                        return response;
                    } catch (Exception e) {
                        context.getLogger().log("Error deleting user: " + e.getMessage());
                        response.put("statusCode", 400);
                        response.put("body", "{\"error\":\"" + e.getMessage() + "\"}");
                        return response;
                    }
                default:
                    throw new IllegalArgumentException("Invalid operation: " + request.operation);
            }
        } catch (Exception e) {
            context.getLogger().log("Failed to process request: " + e.getMessage());
            throw new RuntimeException(e);
        }
    }
    
    private Map<String, Object> handleHealthCheck(Map<String, Object> response) {
        response.put("statusCode", 200);
        response.put("body", "{\"status\":\"healthy\"}");
        return response;
    }
}