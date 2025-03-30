package com.cs301g2t1.user.repository;

import com.cs301g2t1.user.model.User;
import com.cs301g2t1.user.model.UserRole;

import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.cognitoidentityprovider.CognitoIdentityProviderClient;
import software.amazon.awssdk.services.cognitoidentityprovider.model.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

public class UserRepositoryImpl implements UserRepository {
    // references .env for now
    private static final String USER_POOL_ID = System.getenv("COGNITO_USER_POOL_ID");
    private static final String APP_CLIENT_ID = System.getenv("COGNITO_APP_CLIENT_ID");
    private static final Region REGION = Region.AP_SOUTHEAST_1;
    
    private final CognitoIdentityProviderClient cognitoClient;
    private static UserRepositoryImpl instance;
    
    private UserRepositoryImpl() {
        this.cognitoClient = CognitoIdentityProviderClient.builder()
                .region(REGION)
                .build();
    }
    
    public static synchronized UserRepositoryImpl getInstance() {
        if (instance == null) {
            instance = new UserRepositoryImpl();
        }
        return instance;
    }

    @Override
    public List<User> findAll() {
        try {
            ListUsersRequest request = ListUsersRequest.builder()
                    .userPoolId(USER_POOL_ID)
                    .limit(60) // Adjust based on how many we wanna display
                    .build();
            
            ListUsersResponse response = cognitoClient.listUsers(request);
            return response.users().stream()
                    .map(this::mapToUser)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            throw new RuntimeException("Failed to list users from Cognito: " + e.getMessage(), e);
        }
    }

    @Override
    public Optional<User> findById(Long userId) {
        try {
            // In Cognito, we typically use username or sub as the unique identifier, here we assume userId is mapped to the username in Cognito
            // Can change ltr
            AdminGetUserRequest request = AdminGetUserRequest.builder()
                    .userPoolId(USER_POOL_ID)
                    .username(userId.toString())
                    .build();
            
            AdminGetUserResponse response = cognitoClient.adminGetUser(request);
            return Optional.of(mapAdminResponseToUser(response));
        } catch (UserNotFoundException e) {
            return Optional.empty();
        } catch (Exception e) {
            throw new RuntimeException("Failed to find user by ID: " + e.getMessage(), e);
        }
    }

    @Override
    public Optional<User> findByEmail(String email) {
        try {
            // Using filter to find user by email
            ListUsersRequest request = ListUsersRequest.builder()
                    .userPoolId(USER_POOL_ID)
                    .filter("email = \"" + email + "\"")
                    .limit(1)
                    .build();
            
            ListUsersResponse response = cognitoClient.listUsers(request);
            if (!response.users().isEmpty()) {
                return Optional.of(mapToUser(response.users().get(0)));
            }
            return Optional.empty();
        } catch (Exception e) {
            throw new RuntimeException("Failed to find user by email: " + e.getMessage(), e);
        }
    }

    @Override
    public User save(User user) {
        if (user.getUserId() == null) {
            return createUser(user);
        } else {
            return updateUser(user);
        }
    }

    private User createUser(User user) {
        try {
            // Convert user attributes
            List<AttributeType> attributes = new ArrayList<>();
            attributes.add(AttributeType.builder().name("email").value(user.getEmail()).build());
            attributes.add(AttributeType.builder().name("given_name").value(user.getFirstName()).build());
            attributes.add(AttributeType.builder().name("family_name").value(user.getLastName()).build());
            attributes.add(AttributeType.builder().name("custom:role").value(user.getRole().toString()).build());
            
            // Generate a temporary password
            String temporaryPassword = generateRandomPassword();
            
            AdminCreateUserRequest createRequest = AdminCreateUserRequest.builder()
                    .userPoolId(USER_POOL_ID)
                    .username(user.getEmail()) // Using email as username
                    .temporaryPassword(temporaryPassword)
                    .userAttributes(attributes)
                    .build();
            
            AdminCreateUserResponse createResponse = cognitoClient.adminCreateUser(createRequest);
            
            // Set the ID from the Cognito sub attribute
            // This might need adjustment based on how you handle IDs
            String sub = createResponse.user().attributes().stream()
                    .filter(attr -> "sub".equals(attr.name()))
                    .findFirst()
                    .map(AttributeType::value)
                    .orElse(null);
            
            if (sub != null) {
                user.setUserId(Long.parseLong(sub));
            }
            
            return user;
        } catch (Exception e) {
            throw new RuntimeException("Failed to create user in Cognito: " + e.getMessage(), e);
        }
    }

    private User updateUser(User user) {
        try {
            List<AttributeType> attributes = new ArrayList<>();
            attributes.add(AttributeType.builder().name("email").value(user.getEmail()).build());
            attributes.add(AttributeType.builder().name("given_name").value(user.getFirstName()).build());
            attributes.add(AttributeType.builder().name("family_name").value(user.getLastName()).build());
            attributes.add(AttributeType.builder().name("custom:role").value(user.getRole().toString()).build());
            
            AdminUpdateUserAttributesRequest updateRequest = AdminUpdateUserAttributesRequest.builder()
                    .userPoolId(USER_POOL_ID)
                    .username(user.getUserId().toString()) // Assuming ID is username in Cognito
                    .userAttributes(attributes)
                    .build();
            
            cognitoClient.adminUpdateUserAttributes(updateRequest);
            return user;
        } catch (UserNotFoundException e) {
            throw new IllegalArgumentException("User not found with ID: " + user.getUserId());
        } catch (Exception e) {
            throw new RuntimeException("Failed to update user in Cognito: " + e.getMessage(), e);
        }
    }

    @Override
    public void deleteById(Long userId) {
        try {
            AdminDeleteUserRequest deleteRequest = AdminDeleteUserRequest.builder()
                    .userPoolId(USER_POOL_ID)
                    .username(userId.toString())
                    .build();
            
            cognitoClient.adminDeleteUser(deleteRequest);
        } catch (UserNotFoundException e) {
            throw new IllegalArgumentException("User not found with ID: " + userId);
        } catch (Exception e) {
            throw new RuntimeException("Failed to delete user from Cognito: " + e.getMessage(), e);
        }
    }

    @Override
    public boolean existsById(Long userId) {
        try {
            AdminGetUserRequest request = AdminGetUserRequest.builder()
                    .userPoolId(USER_POOL_ID)
                    .username(userId.toString())
                    .build();
            
            cognitoClient.adminGetUser(request);
            return true;
        } catch (UserNotFoundException e) {
            return false;
        } catch (Exception e) {
            throw new RuntimeException("Failed to check if user exists: " + e.getMessage(), e);
        }
    }
    
    // Helper methods
    private User mapToUser(UserType cognitoUser) {
        User user = new User();
        
        // Extract attributes from Cognito user
        Map<String, String> attributes = cognitoUser.attributes().stream()
                .collect(Collectors.toMap(
                        AttributeType::name,
                        AttributeType::value
                ));
        
        // Set user properties from attributes
        String sub = attributes.get("sub");
        if (sub != null) {
            try {
                user.setUserId(Long.parseLong(sub));
            } catch (NumberFormatException e) {
                // Handle case where sub isn't a valid Long
                user.setUserId(null);
            }
        }
        
        user.setEmail(attributes.get("email"));
        user.setFirstName(attributes.get("given_name"));
        user.setLastName(attributes.get("family_name"));
        // Map roles here -- might hv some capitalisation issue
        String roleStr = attributes.getOrDefault("custom:role", "AGENT");
        try {
            user.setRole(UserRole.valueOf(roleStr));
        } catch (IllegalArgumentException e) {
            // Default to AGENT if the string doesn't match any enum
            user.setRole(UserRole.AGENT);
        }
        
        return user;
    }
    
    private User mapAdminResponseToUser(AdminGetUserResponse response) {
        User user = new User();
        
        // Extract attributes
        Map<String, String> attributes = response.userAttributes().stream()
                .collect(Collectors.toMap(
                        AttributeType::name,
                        AttributeType::value
                ));
        
        String sub = attributes.get("sub");
        if (sub != null) {
            try {
                user.setUserId(Long.parseLong(sub));
            } catch (NumberFormatException e) {
                user.setUserId(null);
            }
        }
        
        user.setEmail(attributes.get("email"));
        user.setFirstName(attributes.get("given_name"));
        user.setLastName(attributes.get("family_name"));
        // Map roles here -- might hv some capitalisation issue
        String roleStr = attributes.getOrDefault("custom:role", "AGENT");
        try {
            user.setRole(UserRole.valueOf(roleStr));
        } catch (IllegalArgumentException e) {
            // Default to AGENT if the string doesn't match any enum
            user.setRole(UserRole.AGENT);
        }
        
        return user;
    }
    
    private String generateRandomPassword() {
        // Generate a random password that meets Cognito requirements -- find more secure method later
        return "Temp" + System.currentTimeMillis() + "!";
    }
}