package com.cs301g2t1.client.controller;

import com.cs301g2t1.client.model.Client;
import com.cs301g2t1.client.service.ClientService;
import com.cs301g2t1.client.service.ImageUploadTokenService;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import org.springframework.core.env.Environment;

@RestController
@RequestMapping("/clients")
@Validated
public class ClientController {

    @Autowired
    private ClientService clientService;

    @Autowired
    private Environment env;

    
    // Inject the Redis template to interact with ElastiCache (Redis)
    @Autowired
    private StringRedisTemplate redisTemplate;

    @GetMapping
    public ResponseEntity<List<Client>> getAllClients() {
        List<Client> clients = clientService.getAllClients();
        return ResponseEntity.ok(clients);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Client> getClientById(@PathVariable("id") Long id) {
        try {
            Client client = clientService.getClientById(id);
            return ResponseEntity.ok(client);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping
    public ResponseEntity<?> createClient(@Valid @RequestBody Client client) {
        try {
            Client createdClient = clientService.createClient(client);
            return new ResponseEntity<>(createdClient, HttpStatus.CREATED);
        } catch (IllegalArgumentException ex) {
            // Return a conflict response if email or phone number already exists
            return new ResponseEntity<>(ex.getMessage(), HttpStatus.CONFLICT);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateClient(@PathVariable("id") Long id,
                                          @Valid @RequestBody Client updatedClient) {
        try {
            Client client = clientService.updateClient(id, updatedClient);
            return ResponseEntity.ok(client);
        } catch (IllegalArgumentException ex) {
            // Could return 404 if not found or 409 if uniqueness is violated
            if (ex.getMessage().contains("not found")) {
                return ResponseEntity.notFound().build();
            } else {
                return ResponseEntity.status(HttpStatus.CONFLICT).body(ex.getMessage());
            }
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteClient(@PathVariable("id") Long id) {
        try {
            clientService.deleteClient(id);
            return ResponseEntity.noContent().build(); // 204 No Content
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.notFound().build();
        }
    }
    
    // New endpoint to test Redis caching (ElastiCache)
    @GetMapping("/cache-test")
    public ResponseEntity<String> testCache() {
        // Print the Redis host and port from application properties
        String redisHost = env.getProperty("spring.data.redis.host");
        String redisPort = env.getProperty("spring.data.redis.port");
        System.out.println("Attempting to connect to Redis at host: " + redisHost + " on port: " + redisPort);

        try {
            // Write a test value to Redis
            redisTemplate.opsForValue().set("testKey", "testValue");
            System.out.println("Successfully set key 'testKey' to 'testValue'");
            // Read the test value from Redis
            String value = redisTemplate.opsForValue().get("testKey");
            System.out.println("Retrieved value from Redis: " + value);
            return ResponseEntity.ok("Value from Redis: " + value);
        } catch (Exception e) {
            // Print full stack trace if there's an error connecting to Redis
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error connecting to Redis: " + e.getMessage());
        }
    }

     @Autowired
    private ImageUploadTokenService tokenService;
    
    @PostMapping("/{id}/request-image-upload")
    public ResponseEntity<String> requestImageUpload(@PathVariable Long id) {
        System.out.println("Fetching client with ID: " + id);
        Client client = clientService.getClientById(id);
        System.out.println("Client fetched: " + client);

        String token = tokenService.generateAndSendToken(client);
        System.out.println("Generated token: " + token);

        return ResponseEntity.ok("Upload link sent to email");
    }


    @GetMapping("/validate-upload-token")
    public ResponseEntity<Boolean> validateToken(
            @RequestParam String token,
            @RequestParam String email) {
        boolean isValid = tokenService.validateToken(token, email);
        return ResponseEntity.ok(isValid);
    }


}