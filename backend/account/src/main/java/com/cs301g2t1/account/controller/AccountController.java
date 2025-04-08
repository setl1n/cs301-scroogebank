package com.cs301g2t1.account.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.cs301g2t1.account.model.Account;
import com.cs301g2t1.account.service.AccountService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/accounts")
public class AccountController {
    private final AccountService accountService;

    @Autowired
    public AccountController(AccountService accountService) {
        this.accountService = accountService;
    }
    
    @PostMapping("/create")
    public ResponseEntity<?> createAccount(HttpServletRequest request, @Valid @RequestBody Account account) {
        Long agentId = accountService.getAgentId(request);
        System.out.println("Agent ID: " + agentId);
        if (agentId == null) {
            return ResponseEntity.status(401).body("Unauthorized");
        }
        Account createdAccount = accountService.createAccount(account, agentId);
        return new ResponseEntity<>(createdAccount, HttpStatus.CREATED);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteAccount(@PathVariable Long id) {
        try {
            Account deletedAccount = accountService.deleteAccount(id);
            return new ResponseEntity<>(deletedAccount, HttpStatus.OK);
        } catch (IllegalArgumentException ex) {
            return new ResponseEntity<>(null, HttpStatus.NOT_FOUND);
        }
    }
}
