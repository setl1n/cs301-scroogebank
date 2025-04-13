package com.cs301g2t1.user.service;

import java.util.List;
import java.util.Optional;

import com.cs301g2t1.user.model.User;

public interface UserService {
    List<User> getAllUsers();
    Optional<User> getUserById(String userId);
    User createUser(User user);
    User updateUser(String userId, User updatedUser);
    void deleteUser(String userId);
}