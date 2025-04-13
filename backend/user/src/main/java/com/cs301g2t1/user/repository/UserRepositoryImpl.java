package com.cs301g2t1.user.repository;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import com.cs301g2t1.user.model.User;
import com.cs301g2t1.user.model.UserRole;

import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.cognitoidentityprovider.CognitoIdentityProviderClient;
import software.amazon.awssdk.services.cognitoidentityprovider.model.AdminAddUserToGroupRequest;
import software.amazon.awssdk.services.cognitoidentityprovider.model.AdminCreateUserRequest;
import software.amazon.awssdk.services.cognitoidentityprovider.model.AdminCreateUserResponse;
import software.amazon.awssdk.services.cognitoidentityprovider.model.AdminDeleteUserRequest;
import software.amazon.awssdk.services.cognitoidentityprovider.model.AdminGetUserRequest;
import software.amazon.awssdk.services.cognitoidentityprovider.model.AdminListGroupsForUserRequest;
import software.amazon.awssdk.services.cognitoidentityprovider.model.AdminListGroupsForUserResponse;
import software.amazon.awssdk.services.cognitoidentityprovider.model.AdminUpdateUserAttributesRequest;
import software.amazon.awssdk.services.cognitoidentityprovider.model.AttributeType;
import software.amazon.awssdk.services.cognitoidentityprovider.model.ListUsersRequest;
import software.amazon.awssdk.services.cognitoidentityprovider.model.ListUsersResponse;
import software.amazon.awssdk.services.cognitoidentityprovider.model.UserNotFoundException;
import software.amazon.awssdk.services.cognitoidentityprovider.model.UserType;

public class UserRepositoryImpl implements UserRepository {
    // references environment variables from terraform
    private static final String USER_POOL_ID = System.getenv("COGNITO_USER_POOL_ID");
    private static final String APP_CLIENT_ID = System.getenv("COGNITO_APP_CLIENT_ID");
    private static final Region REGION = Region.of(System.getenv("COGNITO_REGION") != null ? System.getenv("COGNITO_REGION") : "ap-southeast-1");
        
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

    // ok this method MIGHT NOT WORK
    @Override
    public Optional<User> findById(Long userId) {
        try {
            ListUsersRequest listRequest = ListUsersRequest.builder()
                .userPoolId(USER_POOL_ID)
                .filter("sub = \"" + userId.toString() + "\"")
                .limit(1)
                .build();
            
            ListUsersResponse response = cognitoClient.listUsers(listRequest);
            
            if (response.users().isEmpty()) {
                return Optional.empty();
            }
            
            // Map the first (and should be only) result to our User model
            User user = mapToUser(response.users().get(0));
            return Optional.of(user);
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
            // Make sure role correct first
            validateUserRole(user.getRole());

            // Convert user attributes
            List<AttributeType> attributes = new ArrayList<>();
            attributes.add(AttributeType.builder().name("email").value(user.getEmail()).build());
            attributes.add(AttributeType.builder().name("given_name").value(user.getFirstName()).build());
            attributes.add(AttributeType.builder().name("family_name").value(user.getLastName()).build());
            // attributes.add(AttributeType.builder().name("custom:role").value(user.getRole().toString()).build());
            
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
            
            AdminAddUserToGroupRequest groupRequest = AdminAddUserToGroupRequest.builder()
            .userPoolId(USER_POOL_ID)
            .username(user.getEmail()) // Using email as username
            .groupName(user.getRole().toString()) // ADMIN or AGENT matching Cognito group names
            .build();
            
            cognitoClient.adminAddUserToGroup(groupRequest);

            return user;
        } catch (Exception e) {
            throw new RuntimeException("Failed to create user in Cognito: " + e.getMessage(), e);
        }
    }

    private User updateUser(User user) {
        try {
            // Make sure role correct first
            validateUserRole(user.getRole());

            List<AttributeType> attributes = new ArrayList<>();
            attributes.add(AttributeType.builder().name("email").value(user.getEmail()).build());
            attributes.add(AttributeType.builder().name("given_name").value(user.getFirstName()).build());
            attributes.add(AttributeType.builder().name("family_name").value(user.getLastName()).build());
            // attributes.add(AttributeType.builder().name("custom:role").value(user.getRole().toString()).build());
            
            AdminUpdateUserAttributesRequest updateRequest = AdminUpdateUserAttributesRequest.builder()
                    .userPoolId(USER_POOL_ID)
                    .username(user.getEmail())
                    .userAttributes(attributes)
                    .build();
            
            cognitoClient.adminUpdateUserAttributes(updateRequest);

            // UNCOMMENT THESE CODE IF YOU WANT TO ALLOW UPDATE USER TO CHANGE A USER'S ROLE
            // AdminGetUserResponse currentUserResponse = cognitoClient.adminGetUser(AdminGetUserRequest.builder()
            // .userPoolId(USER_POOL_ID)
            // .username(user.getEmail())
            // .build());

            // // Extract current role from custom:role attribute
            // String currentRoleStr = currentUserResponse.userAttributes().stream()
            //         .filter(attr -> "custom:role".equals(attr.name()))
            //         .findFirst()
            //         .map(AttributeType::value)
            //         .orElse("AGENT");

            // // If role has changed, update group membership
            // if (!currentRoleStr.equals(user.getRole().toString())) {
            //     // Remove from old group
            //     cognitoClient.adminRemoveUserFromGroup(AdminRemoveUserFromGroupRequest.builder()
            //             .userPoolId(USER_POOL_ID)
            //             .username(user.getEmail())
            //             .groupName(currentRoleStr)
            //             .build());
                        
            //     // Add to new group
            //     cognitoClient.adminAddUserToGroup(AdminAddUserToGroupRequest.builder()
            //             .userPoolId(USER_POOL_ID)
            //             .username(user.getEmail())
            //             .groupName(user.getRole().toString())
            //             .build());
            // }

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
            Optional<User> userOptional = findById(userId);
            if (!userOptional.isPresent()) {
                throw new IllegalArgumentException("User not found with ID: " + userId);
            }
            
            String userEmail = userOptional.get().getEmail();
            
            AdminDeleteUserRequest deleteRequest = AdminDeleteUserRequest.builder()
                    .userPoolId(USER_POOL_ID)
                    .username(userEmail) // Use the email from the found user
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
            Optional<User> userOptional = findById(userId);
            if (!userOptional.isPresent()) {
                return false;
            }
            
            String userEmail = userOptional.get().getEmail();
            
            AdminGetUserRequest request = AdminGetUserRequest.builder()
                    .userPoolId(USER_POOL_ID)
                    .username(userEmail) // Use the email from the found user
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
        
        user.setEmail(attributes.getOrDefault("email", ""));
        user.setFirstName(attributes.getOrDefault("given_name", ""));
        user.setLastName(attributes.getOrDefault("family_name", ""));

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
        
        // determine role from cognito group
        try {
            String username = user.getEmail();
            
            // Get user's groups
            AdminListGroupsForUserRequest groupsRequest = AdminListGroupsForUserRequest.builder()
                    .userPoolId(USER_POOL_ID)
                    .username(username)
                    .build();
                    
            AdminListGroupsForUserResponse groupsResponse = cognitoClient.adminListGroupsForUser(groupsRequest);
            
            // Default to AGENT if no groups or error
            UserRole role = UserRole.AGENT;
            
            // Check if user is in ADMIN group
            boolean isAdmin = groupsResponse.groups().stream()
                    .anyMatch(group -> "ADMIN".equals(group.groupName()));
                    
            if (isAdmin) {
                role = UserRole.ADMIN;
            }
            
            user.setRole(role);
        } catch (Exception e) {
            // Default to AGENT on error
            user.setRole(UserRole.AGENT);
            // Log error
        }
        
        return user;
    }
    
    // private User mapAdminResponseToUser(AdminGetUserResponse response) {
    //     User user = new User();
        
    //     // Extract attributes
    //     Map<String, String> attributes = response.userAttributes().stream()
    //             .collect(Collectors.toMap(
    //                     AttributeType::name,
    //                     AttributeType::value
    //             ));
        
    //     String sub = attributes.get("sub");
    //     if (sub != null) {
    //         try {
    //             user.setUserId(Long.parseLong(sub));
    //         } catch (NumberFormatException e) {
    //             user.setUserId(null);
    //         }
    //     }
        
    //     user.setEmail(attributes.get("email"));
    //     user.setFirstName(attributes.get("given_name"));
    //     user.setLastName(attributes.get("family_name"));
    //     // Map roles here -- might hv some capitalisation issue
    //     String roleStr = attributes.getOrDefault("custom:role", "AGENT");
    //     try {
    //         user.setRole(UserRole.valueOf(roleStr));
    //     } catch (IllegalArgumentException e) {
    //         // Default to AGENT if the string doesn't match any enum
    //         user.setRole(UserRole.AGENT);
    //     }
        
    //     return user;
    // }
    
    private String generateRandomPassword() {
        // Generate a random password that meets Cognito requirements -- find more secure method later
        return "Temp" + System.currentTimeMillis() + "!";
    }

    private void validateUserRole(UserRole role) {
        // Ensure role matches one of Cognito groups
        if (role != UserRole.ADMIN && role != UserRole.AGENT) {
            throw new IllegalArgumentException("Invalid role: " + role);
        }
    }
}