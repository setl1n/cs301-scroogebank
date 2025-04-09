package com.cs301g2t1.client.controller;

import com.cs301g2t1.client.model.Client;
import com.cs301g2t1.client.service.ClientService;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/clients")
@Validated
public class ClientController {

    @Autowired
    private ClientService clientService;

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
}