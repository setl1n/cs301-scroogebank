package com.cs301g2t1.user.repository;

import com.cs301g2t1.user.model.User;

import java.util.List;
import java.util.Optional;

public interface UserRepository {
    List<User> findAll();
    Optional<User> findById(String id);
    Optional<User> findByEmail(String email);
    User save(User user);
    void deleteById(String id);
    boolean existsById(String id);
}