package com.cs301g2t1.client.service;

import java.util.List;

import com.cs301g2t1.client.model.Client;

public interface ClientService {
    List<Client> getAllClients();
    Client getClientById(Long clientId);
    Client createClient(Client client);
    Client updateClient(Long clientId, Client updatedClient);
    void deleteClient(Long clientId);
}
}