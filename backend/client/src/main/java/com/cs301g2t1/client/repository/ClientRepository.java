package com.cs301g2t1.client.repository;

import com.cs301g2t1.client.model.Client;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface ClientRepository extends JpaRepository<Client, Long> {
    Optional<Client> findByEmailAddress(String emailAddress);
    Optional<Client> findByPhoneNumber(String phoneNumber);
}