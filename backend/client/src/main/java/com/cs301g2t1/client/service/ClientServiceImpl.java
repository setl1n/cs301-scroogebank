package com.cs301g2t1.client.service;

import com.cs301g2t1.client.model.Client;
import com.cs301g2t1.client.repository.ClientRepository;

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
import java.util.List;

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
        return clientRepository.findAll();
    }

    @Override
    @Cacheable(value = CLIENTS_CACHE, key = "#clientId")
    public Client getClientById(Long clientId) {
        return clientRepository.findById(clientId)
                .orElseThrow(() -> new IllegalArgumentException("Client not found with ID: " + clientId));
    }

    @Transactional
    @Caching(
        put = { @CachePut(value = CLIENTS_CACHE, key = "#result.clientId") },
        evict = { @CacheEvict(value = CLIENTS_ALL_CACHE, allEntries = true) }
    )
    public Client createClient(Client client) {
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
        Long agentId = 1L; // Default agent ID, can be updated to use getAgentId method
        String log = String.format("'operation': 'CREATE', 'attributeName': 'Client ID|First Name|Last Name|DOB|Gender|Email|Phone|Address|City|State|Country|Postal Code', " +
                "'beforeValue': '||||||||||||', " +
                "'afterValue': '%s|%s|%s|%s|%s|%s|%s|%s|%s|%s|%s|%s', " +
                "'agentId': %d, 'clientId': %d, 'dateTime': '%s'",
                savedClient.getClientId(), savedClient.getFirstName(), savedClient.getLastName(), 
                savedClient.getDateOfBirth(), savedClient.getGender(), savedClient.getEmailAddress(),
                savedClient.getPhoneNumber(), savedClient.getAddress(), savedClient.getCity(),
                savedClient.getState(), savedClient.getCountry(), savedClient.getPostalCode(),
                agentId, savedClient.getClientId(), LocalDateTime.now());
        pushLogToSQS(log);

        // The newly saved client is returned and automatically cached (via @CachePut)
        return savedClient;
    }

    @Override
    @Caching(
        put = { @CachePut(value = CLIENTS_CACHE, key = "#clientId") },
        evict = { @CacheEvict(value = CLIENTS_ALL_CACHE, allEntries = true) }
    )

    public Client updateClient(Long clientId, Client updatedClient) {
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
        Long agentId = 1L; // Default agent ID, can be updated to use getAgentId method
        String afterValue = String.format("%s|%s|%s|%s|%s|%s|%s|%s|%s|%s|%s|%s",
                updatedClientFromDb.getClientId(), updatedClientFromDb.getFirstName(), updatedClientFromDb.getLastName(), 
                updatedClientFromDb.getDateOfBirth(), updatedClientFromDb.getGender(), updatedClientFromDb.getEmailAddress(),
                updatedClientFromDb.getPhoneNumber(), updatedClientFromDb.getAddress(), updatedClientFromDb.getCity(),
                updatedClientFromDb.getState(), updatedClientFromDb.getCountry(), updatedClientFromDb.getPostalCode());
        
        String log = String.format("'operation': 'UPDATE', 'attributeName': 'Client ID|First Name|Last Name|DOB|Gender|Email|Phone|Address|City|State|Country|Postal Code', " +
                "'beforeValue': '%s', " +
                "'afterValue': '%s', " +
                "'agentId': %d, 'clientId': %d, 'dateTime': '%s'",
                beforeValue, afterValue, agentId, updatedClientFromDb.getClientId(), LocalDateTime.now());
        pushLogToSQS(log);

        // The returned client is automatically placed into the cache (via @CachePut)
        return updatedClientFromDb;
    }

    @Override
    @Caching(evict = {
        @CacheEvict(value = "clients", key = "#clientId"),
        @CacheEvict(value = "clientsAll", allEntries = true)
    })
    public void deleteClient(Long clientId) {
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
        Long agentId = 1L; // Default agent ID, can be updated to use getAgentId method
        String log = String.format("'operation': 'DELETE', 'attributeName': 'Client ID|First Name|Last Name|DOB|Gender|Email|Phone|Address|City|State|Country|Postal Code', " +
                "'beforeValue': '%s', " +
                "'afterValue': '||||||||||||', " +
                "'agentId': %d, 'clientId': %d, 'dateTime': '%s'",
                beforeValue, agentId, clientId, LocalDateTime.now());
        pushLogToSQS(log);
    }
    
    public void pushLogToSQS(String log) {
        try {
            GetQueueUrlRequest getQueueUrlRequest = GetQueueUrlRequest.builder()
                    .queueName(queueName)
                    .build();
            String queueUrl = sqsClient.getQueueUrl(getQueueUrlRequest).queueUrl();

            SendMessageRequest request = SendMessageRequest.builder()
                    .queueUrl(queueUrl)
                    .messageBody(log)
                    .delaySeconds(0)
                    .build();

            SendMessageResponse response = sqsClient.sendMessage(request);
            System.out.println("Message sent with ID: " + response.messageId());

        } catch (Exception e) {
            System.err.println("SQS Error: " + e.getMessage());
            throw new RuntimeException("Error sending message to SQS", e);
        }
    }
    
    public Long getAgentId(HttpServletRequest request) {
        // This is a placeholder method similar to AccountService
        // In a real implementation, you would extract the agent ID from the JWT token
        return 1L;
    }
}