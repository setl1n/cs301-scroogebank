package com.cs301g2t1.user;

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.RequestHandler;
import com.cs301g2t1.user.model.User;
import com.cs301g2t1.user.model.Response;
import com.cs301g2t1.user.service.UserService;
import com.cs301g2t1.user.service.UserServiceImpl;

/**
 * Lambda handler for processing user operations
 */
public class UserHandler implements RequestHandler<UserHandler.Request, Response> {

    private final UserService userService = new UserServiceImpl();

    public static class Request {
        public String operation;
        public Long userId;
        public User user;
    }

    @Override
    public Response handleRequest(Request request, Context context) {
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
}