package com.cs301g2t1.user.repository;

import com.cs301g2t1.user.model.User;
import com.cs301g2t1.user.model.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findById(Long id); 
    Optional<User> findByFirstName(String firstName); 
    Optional<User> findByLastName(String lastName); 
    Optional<User> findByEmail(String email);; 
    Optional<User> findByRole(UserRole role); 
}
