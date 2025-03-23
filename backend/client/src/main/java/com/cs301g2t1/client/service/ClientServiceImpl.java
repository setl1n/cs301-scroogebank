package com.cs301g2t1.client.service;

import com.cs301g2t1.client.model.Client;
import com.cs301g2t1.client.repository.ClientRepository;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ClientServiceImpl implements ClientService {

    @Autowired
    private ClientRepository clientRepository;

    @Override
    public List<Client> getAllClients() {
        return clientRepository.findAll();
    }

    @Override
    public Client getClientById(Long clientId) {
        return clientRepository.findById(clientId)
                .orElseThrow(() -> new IllegalArgumentException("Client not found with ID: " + clientId));
    }

    @Transactional
    public Client createClient(Client client) {
        // Check if email already exists
        clientRepository.findByEmailAddress(client.getEmailAddress())
                .ifPresent(existing -> {
                    throw new IllegalArgumentException("Email address already exists");
                });

        // Check if phone number already exists
        clientRepository.findByPhoneNumber(client.getPhoneNumber())
                .ifPresent(existing -> {
                    throw new IllegalArgumentException("Phone number already exists");
                });

        // Save the client (clientId will be auto-generated)
        return clientRepository.save(client);
    }

    @Override
    public Client updateClient(Long clientId, Client updatedClient) {
        // Fetch existing client
        Client existingClient = clientRepository.findById(clientId)
            .orElseThrow(() -> new IllegalArgumentException("Client not found with ID: " + clientId));

        // Check email uniqueness if it has changed
        if (!existingClient.getEmailAddress().equals(updatedClient.getEmailAddress())) {
            clientRepository.findByEmailAddress(updatedClient.getEmailAddress())
                .ifPresent(c -> {
                    throw new IllegalArgumentException("Email address already exists");
                });
        }

        // Check phone number uniqueness if it has changed
        if (!existingClient.getPhoneNumber().equals(updatedClient.getPhoneNumber())) {
            clientRepository.findByPhoneNumber(updatedClient.getPhoneNumber())
                .ifPresent(c -> {
                    throw new IllegalArgumentException("Phone number already exists");
                });
        }

        // Update fields
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

        // Save and return updated client
        return clientRepository.save(existingClient);
    }

    @Override
    public void deleteClient(Long clientId) {
        if (!clientRepository.existsById(clientId)) {
            throw new IllegalArgumentException("Client not found with ID: " + clientId);
        }
        clientRepository.deleteById(clientId);
    }
}