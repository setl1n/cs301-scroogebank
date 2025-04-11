package com.cs301g2t1.client.service;

import com.cs301g2t1.client.model.Client;
import com.cs301g2t1.client.model.ImageUploadToken;
import com.cs301g2t1.client.repository.ImageUploadTokenRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class ImageUploadTokenService {

    @Autowired
    private ImageUploadTokenRepository tokenRepository;

    @Autowired
    private EmailService emailService;
    

    // Hardcoded frontend upload URL for testing
    private static final String FRONTEND_UPLOAD_URL = "https://alb.itsag2t1.com/upload";

    public String generateAndSendToken(Client client) {
        System.out.println("Generating token for client: " + client);
    
        // Generate token
        String token = UUID.randomUUID().toString();
        System.out.println("Generated token: " + token);
    
        // Create token entity
        ImageUploadToken uploadToken = new ImageUploadToken();
        uploadToken.setToken(token);
        uploadToken.setEmailAddress(client.getEmailAddress());
        uploadToken.setExpiryDate(LocalDateTime.now().plusHours(24));
        uploadToken.setClient(client);
    
        System.out.println("Saving token to database: " + uploadToken);
        // Save token
        tokenRepository.save(uploadToken);
    
        // Generate upload link
        String uploadLink = generateUploadLink(token, client.getEmailAddress());
        System.out.println("Generated upload link: " + uploadLink);
    
        // Send email
        emailService.sendImageUploadLink(client.getEmailAddress(), uploadLink);
    
        return token;
    }
    

    private String generateUploadLink(String token, String email) {
        return String.format("%s?token=%s&email=%s", FRONTEND_UPLOAD_URL, token, email);
    }

    public boolean validateToken(String token, String email) {
        // Find the token in the database
        return tokenRepository.findByTokenAndEmailAddressAndUsedFalse(token, email)
                .map(uploadToken -> {
                    // Check if the token has expired
                    if (uploadToken.getExpiryDate().isBefore(LocalDateTime.now())) {
                        return false; // Token is expired
                    }
                    // Mark the token as used
                    uploadToken.setUsed(true);
                    tokenRepository.save(uploadToken);
                    return true; // Token is valid
                })
                .orElse(false); // Token not found or already used
    }
}