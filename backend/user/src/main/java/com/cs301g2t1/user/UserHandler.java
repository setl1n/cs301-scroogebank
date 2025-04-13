package com.cs301g2t1.user;

import java.util.HashMap;
import java.util.Map;

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.RequestHandler;
import com.cs301g2t1.user.model.Response;
import com.cs301g2t1.user.model.User;
import com.cs301g2t1.user.service.UserService;
import com.cs301g2t1.user.service.UserServiceImpl;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.core.type.TypeReference;
/**
 * Lambda handler for processing user operations
 */
public class UserHandler implements RequestHandler<Object, Object> {

    private final UserService userService = new UserServiceImpl();

    public static class Request {
        public String operation;
        public Long userId;
        public User user;
    }

    @Override
    public Object handleRequest(Object input, Context context) {
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
                    return new Response(false, "Invalid JSON in request body", null);
                }
            } else {
                // Body is already a Map
                requestBody = (Map<String, Object>) requestMap.get("body");
            }
            context.getLogger().log("Request body: " + requestBody);
            // Convert Map to Request if it has operation
            if (requestBody.containsKey("operation")) {
                context.getLogger().log("Processing request with operation: " + requestBody.get("operation"));
                Request request = new Request();
                request.operation = (String) requestBody.get("operation");
                
                if (requestBody.containsKey("userId")) {
                    // Handle different number types safely
                    Object userIdObj = requestBody.get("userId");
                    if (userIdObj instanceof Number) {
                        request.userId = ((Number) userIdObj).longValue();
                    } else if (userIdObj != null) {
                        try {
                            request.userId = Long.valueOf(userIdObj.toString());
                        } catch (NumberFormatException e) {
                            context.getLogger().log("Invalid userId format: " + userIdObj);
                        }
                    }
                }
                
                if (requestBody.containsKey("user")) {
                    // Use ObjectMapper to convert the nested map to a User object
                    ObjectMapper mapper = new ObjectMapper();
                    try {
                        request.user = mapper.convertValue(requestBody.get("user"), User.class);
                        context.getLogger().log("Converted user object successfully");
                    } catch (Exception e) {
                        context.getLogger().log("Failed to convert user data: " + e.getMessage());
                        return new Response(false, "Invalid user data format", null);
                    }
                }
                
                return processRequest(request, context);
            }
        } else if (input instanceof Request) {
            // If it's already a Request object, process it directly
            return processRequest((Request) input, context);
        }
        
        return new Response(false, "Invalid request format", null);
    }
    
    private Response processRequest(Request request, Context context) {
        try {
            switch (request.operation) {
                case "CREATE":
                    try {
                        context.getLogger().log("Creating user: " + request.user);
                        if (request.user == null) {
                            return new Response(false, "User data is null", null);
                        }
                        
                        // Log details for debugging
                        context.getLogger().log("User details - firstName: " + request.user.getFirstName() 
                            + ", lastName: " + request.user.getLastName()
                            + ", email: " + request.user.getEmail()
                            + ", role: " + request.user.getRole());
                            
                        User user = userService.createUser(request.user);
                        return new Response(true, "", user);
                    } catch (Exception e) {
                        context.getLogger().log("Error creating user: " + e.getMessage());
                        context.getLogger().log("Error stack trace: " + e.getStackTrace());
                        if (e.getCause() != null) {
                            context.getLogger().log("Caused by: " + e.getCause().getMessage());
                        }
                        return new Response(false, "Failed to create user: " + e.getMessage(), null);
                    }
                case "READ":
                    try {
                        return userService.getUserById(request.userId)
                            .map(user -> new Response(true, "", user))
                            .orElse(new Response(false, "User not found with ID: " + request.userId, null));
                    } catch (Exception e) {
                        return new Response(false, e.getMessage(), null);
                    }
                case "UPDATE":
                    try {
                        User user = userService.updateUser(request.userId, request.user);
                        return new Response(true, "", user);
                    } catch (Exception e) {
                        return new Response(false, e.getMessage(), null);
                    }
                case "DELETE":
                    try {
                        userService.deleteUser(request.userId);
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
    
    private Map<String, Object> handleHealthCheck(Map<String, Object> response) {
        response.put("statusCode", 200);
        response.put("body", "{\"status\":\"healthy\"}");
        return response;
    }
}