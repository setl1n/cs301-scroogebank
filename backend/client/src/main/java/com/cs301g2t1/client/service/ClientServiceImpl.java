package com.cs301g2t1.client.service;

import com.cs301g2t1.client.model.Client;
import com.cs301g2t1.client.repository.ClientRepository;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.CachePut;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import software.amazon.awssdk.services.sqs.SqsClient;
import software.amazon.awssdk.services.sqs.model.SendMessageRequest;
import software.amazon.awssdk.services.sqs.model.SendMessageResponse;
import software.amazon.awssdk.services.sqs.model.GetQueueUrlRequest;

import jakarta.servlet.http.HttpServletRequest;

import java.time.LocalDateTime;
import java.util.Base64;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class ClientServiceImpl implements ClientService {

    @Autowired
    private ClientRepository clientRepository;  // JPA repository for RDS
    
    @Autowired
    private SqsClient sqsClient;
    
    @Value("${aws.sqs.queueName}")
    private String queueName;

    @Value("${aws.sqs.region}")
    private String sqsRegion;

    // Cache names used in annotations
    private static final String CLIENTS_CACHE = "clients";
    private static final String CLIENTS_ALL_CACHE = "clientsAll";

    @Override
    @Cacheable(value = CLIENTS_ALL_CACHE)
    public List<Client> getAllClients() {
        // If not found in the cache, Spring will call this method,
        // then store the result in the "clientsAll" cache.
        return clientRepository.findAll();
    }

    @Override
    @Cacheable(value = CLIENTS_CACHE, key = "#clientId")
    public Client getClientById(Long clientId) {
        // If not found in cache, this method is called, and the result
        // is automatically cached with key = clientId in "clients" cache.
        return clientRepository.findById(clientId)
                .orElseThrow(() -> new IllegalArgumentException("Client not found with ID: " + clientId));
    }

    @Transactional
    @CachePut(value = CLIENTS_CACHE, key = "#result.clientId")
    public Client createClient(Client client, HttpServletRequest request) {
        // Check if email or phone number already exists in RDS
        clientRepository.findByEmailAddress(client.getEmailAddress())
                .ifPresent(existing -> {
                    throw new IllegalArgumentException("Email address already exists");
                });

        clientRepository.findByPhoneNumber(client.getPhoneNumber())
                .ifPresent(existing -> {
                    throw new IllegalArgumentException("Phone number already exists");
                });

        // Save the client in RDS (JPA)
        Client savedClient = clientRepository.save(client);
        // Log to SQS
        String agentId = getAgentId(request);
        Map<String, Object> logRequest = getLogRequest("CREATE", "||||||||||||", String.format("%s|%s|%s|%s|%s|%s|%s|%s|%s|%s|%s|%s", 
                savedClient.getClientId(), savedClient.getFirstName(), savedClient.getLastName(), 
                savedClient.getDateOfBirth(), savedClient.getGender(), savedClient.getEmailAddress(),
                savedClient.getPhoneNumber(), savedClient.getAddress(), savedClient.getCity(),
                savedClient.getState(), savedClient.getCountry(), savedClient.getPostalCode()), agentId, savedClient.getClientId(), "POST");
        pushLogToSQS(logRequest);

        // The newly saved client is returned and automatically cached (via @CachePut)
        return savedClient;
    }

    @Override
    @CachePut(value = CLIENTS_CACHE, key = "#clientId")
    public Client updateClient(Long clientId, Client updatedClient, HttpServletRequest request) {
        // Fetch the existing client from RDS
        Client existingClient = clientRepository.findById(clientId)
            .orElseThrow(() -> new IllegalArgumentException("Client not found with ID: " + clientId));
            
        // Store old values for logging
        String beforeValue = String.format("%s|%s|%s|%s|%s|%s|%s|%s|%s|%s|%s|%s",
                existingClient.getClientId(), existingClient.getFirstName(), existingClient.getLastName(), 
                existingClient.getDateOfBirth(), existingClient.getGender(), existingClient.getEmailAddress(),
                existingClient.getPhoneNumber(), existingClient.getAddress(), existingClient.getCity(),
                existingClient.getState(), existingClient.getCountry(), existingClient.getPostalCode());

        // Update client details
        existingClient.setFirstName(updatedClient.getFirstName());
        existingClient.setLastName(updatedClient.getLastName());
        existingClient.setDateOfBirth(updatedClient.getDateOfBirth());
        existingClient.setGender(updatedClient.getGender());
        existingClient.setEmailAddress(updatedClient.getEmailAddress());
        existingClient.setPhoneNumber(updatedClient.getPhoneNumber());
        existingClient.setAddress(updatedClient.getAddress());
        existingClient.setCity(updatedClient.getCity());
        existingClient.setState(updatedClient.getState());
        existingClient.setCountry(updatedClient.getCountry());
        existingClient.setPostalCode(updatedClient.getPostalCode());

        // Save the updated client in RDS
        Client updatedClientFromDb = clientRepository.save(existingClient);
        
        // Log to SQS
        String agentId = getAgentId(request);
        String afterValue = String.format("%s|%s|%s|%s|%s|%s|%s|%s|%s|%s|%s|%s",
                updatedClientFromDb.getClientId(), updatedClientFromDb.getFirstName(), updatedClientFromDb.getLastName(), 
                updatedClientFromDb.getDateOfBirth(), updatedClientFromDb.getGender(), updatedClientFromDb.getEmailAddress(),
                updatedClientFromDb.getPhoneNumber(), updatedClientFromDb.getAddress(), updatedClientFromDb.getCity(),
                updatedClientFromDb.getState(), updatedClientFromDb.getCountry(), updatedClientFromDb.getPostalCode());
        
        Map<String, Object> logRequest = getLogRequest("UPDATE", beforeValue, afterValue, agentId, updatedClientFromDb.getClientId(), "PUT");
        pushLogToSQS(logRequest);

        // The returned client is automatically placed into the cache (via @CachePut)
        return updatedClientFromDb;
    }

    @Override
    @Caching(evict = {
        @CacheEvict(value = "clients", key = "#clientId"),
        @CacheEvict(value = "clientsAll", allEntries = true)
    })
    public void deleteClient(Long clientId, HttpServletRequest request) {
        Client client = clientRepository.findById(clientId)
            .orElseThrow(() -> new IllegalArgumentException("Client not found with ID: " + clientId));
        
        // Store values for logging before deletion
        String beforeValue = String.format("%s|%s|%s|%s|%s|%s|%s|%s|%s|%s|%s|%s",
                client.getClientId(), client.getFirstName(), client.getLastName(), 
                client.getDateOfBirth(), client.getGender(), client.getEmailAddress(),
                client.getPhoneNumber(), client.getAddress(), client.getCity(),
                client.getState(), client.getCountry(), client.getPostalCode());
        
        // Delete client from RDS
        clientRepository.deleteById(clientId);
        
        // Log to SQS
        String agentId = getAgentId(request);
        Map<String, Object> logRequest = getLogRequest("DELETE", beforeValue, "||||||||||||", agentId, clientId, "DELETE");
        pushLogToSQS(logRequest);
    }
    
    public String getAgentId(HttpServletRequest request) {
        // Get the JWT token from ALB header
        String token = request.getHeader("x-amzn-oidc-data");
        if (token == null) {
            throw new RuntimeException("No authentication token found");
        }
        String[] parts = token.split("\\.");
        String payload = new String(Base64.getDecoder().decode(parts[1]));
        String agentId = payload.split("\"sub\":\"")[1].split("\"")[0]; // called sub in the token
        return agentId;
    }

    public Map<String, Object> getLogRequest(String operation, String beforeValue, String afterValue, String agentId, Long clientId, String operationType) {
        Map<String, Object> logEntry = new HashMap<>();
        logEntry.put("operation", operation);
        logEntry.put("attributeName", "Client ID|First Name|Last Name|DOB|Gender|Email|Phone|Address|City|State|Country|Postal Code");
        logEntry.put("beforeValue", beforeValue);
        logEntry.put("afterValue", afterValue);
        logEntry.put("agentId", agentId);
        logEntry.put("clientId", clientId);
        logEntry.put("dateTime", LocalDateTime.now().toString());

        Map<String, Object> request = new HashMap<>();
        request.put("operation", operationType);
        request.put("logEntry", logEntry);
        return request;
    }

    public void pushLogToSQS(Map<String, Object> logMessage) {
        try {
            ObjectMapper objectMapper = new ObjectMapper();
            String logJson = objectMapper.writeValueAsString(logMessage);

            System.out.println("Log JSON: " + logJson);
            GetQueueUrlRequest getQueueUrlRequest = GetQueueUrlRequest.builder()
                    .queueName(queueName)
                    .build();
            String queueUrl = sqsClient.getQueueUrl(getQueueUrlRequest).queueUrl();

            SendMessageRequest request = SendMessageRequest.builder()
                    .queueUrl(queueUrl)
                    .messageBody(logJson)
                    .delaySeconds(0)
                    .build();
            
            System.out.println("request: " + request);
            SendMessageResponse response = sqsClient.sendMessage(request);
            System.out.println("response: " + response);
            System.out.println("Message sent with ID: " + response.messageId());

        } catch (Exception e) {
            System.err.println("SQS Error: " + e.getMessage());
            throw new RuntimeException("Error sending message to SQS", e);
        }
    }
}