package com.cs301g2t1.user.service;

import com.cs301g2t1.user.model.User;
import com.cs301g2t1.user.repository.UserRepository;
import com.cs301g2t1.user.repository.UserRepositoryImpl;

import java.util.List;
import java.util.Optional;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserServiceImpl implements UserService {

    private UserRepository userRepository = UserRepositoryImpl.getInstance();

    @Override
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Override
    public Optional<User> getUserById(Long userId) {
        return userRepository.findById(userId);
    }

    @Transactional
    public User createUser(User user) {
        userRepository.findByEmail(user.getEmail())
                .ifPresent(existing -> {
                    throw new IllegalArgumentException("Email address already exists");
                });

        return userRepository.save(user);
    }

    @Override
    public User updateUser(Long userId, User updatedUser) {
        User existingUser = userRepository.findById(userId)
            .orElseThrow(() -> new IllegalArgumentException("User not found with ID: " + userId));

        if (!existingUser.getEmail().equals(updatedUser.getEmail())) {
            userRepository.findByEmail(updatedUser.getEmail())
                .ifPresent(c -> {
                    throw new IllegalArgumentException("Email address already exists");
                });
        }

        existingUser.setFirstName(updatedUser.getFirstName());
        existingUser.setLastName(updatedUser.getLastName());
        existingUser.setEmail(updatedUser.getEmail());
        existingUser.setRole(updatedUser.getRole());

        return userRepository.save(existingUser);
    }

    @Override
    public void deleteUser(Long userId) {
        if (!userRepository.existsById(userId)) {
            throw new IllegalArgumentException("User not found with ID: " + userId);
        }
        userRepository.deleteById(userId);
    }
}