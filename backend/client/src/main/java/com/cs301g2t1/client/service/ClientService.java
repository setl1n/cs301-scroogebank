package com.cs301g2t1.client.service;

import java.util.List;

import com.cs301g2t1.client.model.Client;

import jakarta.servlet.http.HttpServletRequest;

public interface ClientService {
    List<Client> getAllClients();
    Client getClientById(Long clientId);
    Client createClient(Client client, HttpServletRequest request);
    Client updateClient(Long clientId, Client updatedClient, HttpServletRequest request);
    void deleteClient(Long clientId, HttpServletRequest request);
}