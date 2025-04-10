// package com.cs301g2t1.user;

// import static org.mockito.ArgumentMatchers.*;
// import static org.mockito.Mockito.*;
// import static org.assertj.core.api.Assertions.*;

// import com.cs301g2t1.user.controller.UserController;
// import com.cs301g2t1.user.model.User;
// import com.cs301g2t1.user.model.UserRole;
// import com.cs301g2t1.user.service.UserService;
// import org.junit.jupiter.api.BeforeEach;
// import org.junit.jupiter.api.Test;
// import org.junit.jupiter.api.extension.ExtendWith;
// import org.mockito.InjectMocks;
// import org.mockito.Mock;
// import org.mockito.junit.jupiter.MockitoExtension;
// import org.springframework.http.ResponseEntity;

// import java.util.Arrays;
// import java.util.List;
// import java.util.Optional;

// @ExtendWith(MockitoExtension.class)
// class UserApplicationTests {

//     @Mock
//     private UserService userService;

//     @InjectMocks
//     private UserController userController;

//     private User adminUser;
//     private User agentUser;

//     @BeforeEach
//     void setUp() {
//         adminUser = new User();
//         adminUser.setUserId(1L);
//         adminUser.setFirstName("Admin");
//         adminUser.setLastName("User");
//         adminUser.setEmail("admin@example.com");
//         adminUser.setRole(UserRole.ADMIN);

//         agentUser = new User();
//         agentUser.setUserId(2L);
//         agentUser.setFirstName("Agent");
//         agentUser.setLastName("User");
//         agentUser.setEmail("agent@example.com");
//         agentUser.setRole(UserRole.AGENT);
//     }

//     @Test
//     void testGetAllUsers() {
//         when(userService.getAllUsers()).thenReturn(Arrays.asList(adminUser, agentUser));
//         ResponseEntity<List<User>> response = userController.getAllUsers();
//         assertThat(response.getBody()).hasSize(2);
//     }

//     @Test
//     void testGetUserById() {
//         when(userService.getUserById(1L)).thenReturn(Optional.of(adminUser));
//         ResponseEntity<User> response = userController.getUserById(1L);
//         assertThat(response.getBody()).isEqualTo(adminUser);
//     }

//     @Test
//     void testCreateUser() {
//         when(userService.createUser(any(User.class))).thenReturn(adminUser);
//         ResponseEntity<?> response = userController.createUser(adminUser);
//         assertThat(response.getStatusCode().value()).isEqualTo(201);
//     }

//     @Test
//     void testUpdateUser() {
//         when(userService.updateUser(eq(1L), any(User.class))).thenReturn(adminUser);
//         ResponseEntity<?> response = userController.updateUser(1L, adminUser);
//         assertThat(response.getBody()).isEqualTo(adminUser);
//     }

//     @Test
//     void testDeleteUser() {
//         doNothing().when(userService).deleteUser(1L);
//         ResponseEntity<?> response = userController.deleteUser(1L);
//         assertThat(response.getStatusCode().value()).isEqualTo(204);
//     }
// }
