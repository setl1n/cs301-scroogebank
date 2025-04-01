package com.cs301g2t1.client.service;

import com.cs301g2t1.client.model.Client;
import com.cs301g2t1.client.repository.ClientRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.CachePut;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ClientServiceImpl implements ClientService {

    @Autowired
    private ClientRepository clientRepository;  // JPA repository for RDS

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

        // The newly saved client is returned and automatically cached (via @CachePut)
        return savedClient;
    }

    @Override
    @CachePut(value = CLIENTS_CACHE, key = "#clientId")
    public Client updateClient(Long clientId, Client updatedClient) {
        // Fetch the existing client from RDS
        Client existingClient = clientRepository.findById(clientId)
            .orElseThrow(() -> new IllegalArgumentException("Client not found with ID: " + clientId));

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

        // The returned client is automatically placed into the cache (via @CachePut)
        return updatedClientFromDb;
    }

    @Override
    @Caching(evict = {
        @CacheEvict(value = "clients", key = "#clientId"),
        @CacheEvict(value = "clientsAll", allEntries = true)
    })
    public void deleteClient(Long clientId) {
        if (!clientRepository.existsById(clientId)) {
            throw new IllegalArgumentException("Client not found with ID: " + clientId);
        }

        // Delete client from RDS
        clientRepository.deleteById(clientId);
    }
}