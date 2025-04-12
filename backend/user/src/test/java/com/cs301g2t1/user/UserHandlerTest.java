package com.cs301g2t1.user;

import java.lang.reflect.Field;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import com.amazonaws.services.lambda.runtime.ClientContext;
import com.amazonaws.services.lambda.runtime.CognitoIdentity;
import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.LambdaLogger;
import com.cs301g2t1.user.model.Response;
import com.cs301g2t1.user.model.User;
import com.cs301g2t1.user.model.UserRole;
import com.cs301g2t1.user.repository.UserRepository;
import com.cs301g2t1.user.service.UserServiceImpl;

public class UserHandlerTest {

    // dummy context for testing
    private static class TestContext implements Context {

        @Override
        public String getAwsRequestId() {
            return "test-request-id";
        }

        @Override
        public String getLogGroupName() {
            return "test-log-group";
        }

        @Override
        public String getLogStreamName() {
            return "test-log-stream";
        }

        @Override
        public String getFunctionName() {
            return "UserHandlerTest";
        }

        @Override
        public String getFunctionVersion() {
            return "1.0";
        }

        @Override
        public String getInvokedFunctionArn() {
            return "test-arn";
        }

        @Override
        public CognitoIdentity getIdentity() {
            return null;
        }

        @Override
        public ClientContext getClientContext() {
            return null;
        }

        @Override
        public int getRemainingTimeInMillis() {
            return 300000;
        }

        @Override
        public int getMemoryLimitInMB() {
            return 512;
        }

        @Override
        public LambdaLogger getLogger() {
            return new LambdaLogger() {
                @Override
                public void log(String message) {
                    System.out.println(message);
                }

                @Override
                public void log(byte[] message) {
                    System.out.println(new String(message));
                }
            };
        }
    }

    private UserHandler handler;
    private Context context;
    private MockUserRepository mockRepository;

    // Mock repository implementation for testing, overrides the og repo's methods but stores in a hashmap
    private static class MockUserRepository implements UserRepository {
        private final Map<Long, User> users = new HashMap<>();
        private long nextId = 1;

        @Override
        public List<User> findAll() {
            return new ArrayList<>(users.values());
        }

        @Override
        public Optional<User> findById(Long userId) {
            return Optional.ofNullable(users.get(userId));
        }

        @Override
        public Optional<User> findByEmail(String email) {
            return users.values().stream()
                .filter(u -> email.equals(u.getEmail()))
                .findFirst();
        }

        @Override
        public User save(User user) {
            if (user.getUserId() == null) {
                // Create new user
                user.setUserId(nextId++);
                users.put(user.getUserId(), user);
            } else {
                // Update existing user
                if (!users.containsKey(user.getUserId())) {
                    throw new IllegalArgumentException("User not found with ID: " + user.getUserId());
                }
                users.put(user.getUserId(), user);
            }
            return user;
        }

        @Override
        public void deleteById(Long userId) {
            if (!users.containsKey(userId)) {
                throw new IllegalArgumentException("User not found with ID: " + userId);
            }
            users.remove(userId);
        }

        @Override
        public boolean existsById(Long userId) {
            return users.containsKey(userId);
        }
    }

    @BeforeEach
    public void setup() throws Exception {
        // Create handler with mock repository
        handler = new UserHandler();
        context = new TestContext();
        mockRepository = new MockUserRepository();
        
        // Inject mock repository into UserServiceImpl
        UserServiceImpl userService = new UserServiceImpl();
        
        // Use reflection to set the userRepository field in UserServiceImpl
        Field repositoryField = UserServiceImpl.class.getDeclaredField("userRepository");
        repositoryField.setAccessible(true);
        repositoryField.set(userService, mockRepository);
        
        // Inject the modified userService into UserHandler
        Field serviceField = UserHandler.class.getDeclaredField("userService");
        serviceField.setAccessible(true);
        serviceField.set(handler, userService);
    }

    @Test
    public void testCreateUser_Success() {
        // Prepare a user object for creation
        User testUser = new User();
        testUser.setFirstName("Joel");
        testUser.setLastName("Lim");
        testUser.setEmail("joel@example.com");
        testUser.setRole(UserRole.ADMIN);

        // Prepare request for CREATE operation
        UserHandler.Request request = new UserHandler.Request();
        request.operation = "CREATE";
        request.user = testUser;

        // Call handler
        Object result = handler.handleRequest(request, context);
        Response response = (Response)result;

        // Validate successful response
        assertTrue(response.isResult(), "User creation should be successful");
        assertNotNull(response.getData(), "Response data should not be null");

        // Validate fields directly without casting
        User createdUser = response.getData();
        assertEquals("Joel", createdUser.getFirstName());
        assertEquals("Lim", createdUser.getLastName());
        assertEquals("joel@example.com", createdUser.getEmail());
        assertEquals(UserRole.ADMIN, createdUser.getRole());
    }

    @Test
    public void testReadUser_NotFound() {
        // Prepare request for READ operation for a non-existent user
        UserHandler.Request request = new UserHandler.Request();
        request.operation = "READ";
        request.userId = 999L;

        // Call handler
        Object result = handler.handleRequest(request, context);
        Response response = (Response)result;

        // Validate that the user is not found
        assertFalse(response.isResult(), "Reading non-existent user should fail");
        assertTrue(response.getErrorMessage().contains("User not found with ID: 999"), 
                   "Expected not found message");
    }

    @Test
    public void testUpdateUser_Success() {
        // First, create a user that we can update
        User testUser = new User();
        testUser.setFirstName("Joel");
        testUser.setLastName("Lim");
        testUser.setEmail("joel@example.com");
        testUser.setRole(UserRole.ADMIN);
        
        // Save the user to get an ID assigned
        User savedUser = mockRepository.save(testUser);
        Long userId = savedUser.getUserId();
        
        // Now prepare the update
        User updatedUser = new User();
        updatedUser.setFirstName("JoelUpdated");
        updatedUser.setLastName("LimUpdated");
        updatedUser.setEmail("joel.updated@example.com");
        updatedUser.setRole(UserRole.ADMIN);

        UserHandler.Request request = new UserHandler.Request();
        request.operation = "UPDATE";
        request.userId = userId;
        request.user = updatedUser;

        // Call handler
        Object result = handler.handleRequest(request, context);
        Response response = (Response)result;

        // Validate update
        assertTrue(response.isResult(), "Update operation should be successful");
        User user = response.getData();
        assertEquals("JoelUpdated", user.getFirstName());
        assertEquals("LimUpdated", user.getLastName());
        assertEquals("joel.updated@example.com", user.getEmail());
        assertEquals(UserRole.ADMIN, user.getRole());
    }

    @Test
    public void testDeleteUser_Success() {
        // create a user that we can delete
        User testUser = new User();
        testUser.setFirstName("ToDelete");
        testUser.setLastName("User");
        testUser.setEmail("delete@example.com");
        testUser.setRole(UserRole.AGENT);
        
        // Save the user to get an ID assigned
        User savedUser = mockRepository.save(testUser);
        Long userId = savedUser.getUserId();

        UserHandler.Request request = new UserHandler.Request();
        request.operation = "DELETE";
        request.userId = userId;

        // Call handler
        Object result = handler.handleRequest(request, context);
        Response response = (Response)result;

        // Validate deletion
        assertTrue(response.isResult(), "User deletion should be successful");
        assertNull(response.getData(), "Response data should be null after deletion");
        
        // Verify the user is actually deleted
        assertFalse(mockRepository.existsById(userId), "User should no longer exist after deletion");
    }
}