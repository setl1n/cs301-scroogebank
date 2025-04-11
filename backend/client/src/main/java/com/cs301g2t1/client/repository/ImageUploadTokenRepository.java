package com.cs301g2t1.client.repository;

import com.cs301g2t1.client.model.ImageUploadToken;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ImageUploadTokenRepository extends JpaRepository<ImageUploadToken, Long> {
    Optional<ImageUploadToken> findByTokenAndEmailAddressAndUsedFalse(String token, String emailAddress);
}