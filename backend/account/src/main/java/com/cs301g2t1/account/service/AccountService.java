package com.cs301g2t1.account.service;

import java.util.Base64;
import java.util.List;
import java.time.LocalDateTime;

import org.hibernate.annotations.Cache;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import software.amazon.awssdk.services.sqs.SqsClient;
import software.amazon.awssdk.services.sqs.model.SendMessageRequest;
import software.amazon.awssdk.services.sqs.model.SendMessageResponse;
import software.amazon.awssdk.services.sqs.model.GetQueueUrlRequest;
import com.cs301g2t1.account.model.Account;
import com.cs301g2t1.account.repository.AccountRepository;
import org.springframework.transaction.annotation.Transactional;

import jakarta.servlet.http.HttpServletRequest;

import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.CachePut;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;

@Service
public class AccountService {
    private final AccountRepository accountRepository;

    @Value("${aws.sqs.queueName}")
    private String queueName;

    @Value("${aws.sqs.region}")
    private String sqsRegion;

    private final SqsClient sqsClient;

    private static final String ACCOUNTS_CACHE = "accounts";         // Caches individual accounts by ID
    private static final String ACCOUNTS_CLIENT_CACHE = "accountsClient"; // Caches accounts by client ID
    private static final String ACCOUNTS_ALL_CACHE = "accountsAll";  // Caches the whole list of accounts


    @Autowired
    public AccountService(AccountRepository accountRepository, SqsClient sqsClient) {
        this.accountRepository = accountRepository;
        this.sqsClient = sqsClient;
    }

    @Transactional
    @Caching(
        put = { @CachePut(value = ACCOUNTS_CACHE, key = "#result.accountId") },
        evict = {
            @CacheEvict(value = ACCOUNTS_CLIENT_CACHE, key = "#result.clientId"),
            @CacheEvict(value = ACCOUNTS_ALL_CACHE, allEntries = true)
        }
    )
    public Account createAccount(Account account, String agentId) {
        // Check if account with the same clientId already exists
        Account createdAccount = accountRepository.save(account);
        String log = String.format("'operation': 'CREATE', 'attributeName': 'Account ID|Client ID|Account Type|Account Status|Opening Date|Initial Deposit|Currency|Branch ID', 'beforeValue': '|||||||', 'afterValue': '%s|%s|%s|%s|%s|%s|%s|%s', 'agentId': %s, 'clientId': %d, 'dateTime': '%s'",
                createdAccount.getAccountId(), createdAccount.getClientId(), createdAccount.getAccountType(),
                createdAccount.getAccountStatus(), createdAccount.getOpeningDate(), createdAccount.getInitialDeposit(),
                createdAccount.getCurrency(), createdAccount.getBranchId(), agentId, account.getClientId(), 
                LocalDateTime.now());
        pushLogToSQS(log);

        return createdAccount;
    }

    @Caching(evict = {
        @CacheEvict(value = "accounts", key = "#accountId"),
        @CacheEvict(value = "accountsClient", key = "#result.clientId"), // remove all accounts for this client
        @CacheEvict(value = "accountsAll", allEntries = true)
    })
    public Account deleteAccount(Long accountId, String agentId) {
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new IllegalArgumentException("Account not found with ID: " + accountId));
        accountRepository.delete(account);
        String log = String.format("'operation': 'DELETE', 'attributeName': 'Account ID|Client ID|Account Type|Account Status|Opening Date|Initial Deposit|Currency|Branch ID', 'beforeValue': '%s|%s|%s|%s|%s|%s|%s|%s', 'afterValue': '|||||||', 'agentId': %s, 'clientId': %d, 'dateTime': '%s'",
                account.getAccountId(), account.getClientId(), account.getAccountType(),
                account.getAccountStatus(), account.getOpeningDate(), account.getInitialDeposit(),
                account.getCurrency(), account.getBranchId(), agentId, account.getClientId(), 
                LocalDateTime.now());
        pushLogToSQS(log);
        return account;
    }

    @Cacheable(value = ACCOUNTS_CACHE, key = "#accountId")
    public Account getAccountById(Long accountId) {
        return accountRepository.findById(accountId)
                .orElseThrow(() -> new IllegalArgumentException("Account not found with ID: " + accountId));
    }

    @Cacheable(value = ACCOUNTS_ALL_CACHE)
    public List<Account> getAllAccounts() {
        return accountRepository.findAll();
    }

    @Cacheable(value = ACCOUNTS_CLIENT_CACHE, key = "#clientId")
    public List<Account> getAccountsByClientId(Long clientId) {
        return accountRepository.findByClientId(clientId);
    }

    @Caching(
        put = { @CachePut(value = ACCOUNTS_CACHE, key = "#result.accountId") },
        evict = {
            @CacheEvict(value = ACCOUNTS_CLIENT_CACHE, key = "#result.clientId"),
            @CacheEvict(value = ACCOUNTS_ALL_CACHE, allEntries = true)
        }
    )
    public Account updateAccount(Long accountId, Account newAccount, String agentId) {
        // System.out.println("Updating account with ID: " + newAccount.getAccountId());
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new IllegalArgumentException("Account not found with ID: " + accountId));
        
        // account.setAccountType(newAccount.getAccountType()); # account type shouldnt change
        String oldValues = String.format("%s|%s|%s|%s|%s|%s|%s|%s",
                account.getAccountId(), account.getClientId(), account.getAccountType(),
                account.getAccountStatus(), account.getOpeningDate(), account.getInitialDeposit(),
                account.getCurrency(), account.getBranchId());
        account.setAccountStatus(newAccount.getAccountStatus());
        account.setOpeningDate(newAccount.getOpeningDate());
        account.setInitialDeposit(newAccount.getInitialDeposit()); 
        account.setCurrency(newAccount.getCurrency());
        account.setBranchId(newAccount.getBranchId());
        Account updatedAccount = accountRepository.save(account);
        String log = String.format("'operation': 'UPDATE', 'attributeName': 'Account ID|Client ID|Account Type|Account Status|Opening Date|Initial Deposit|Currency|Branch ID', 'beforeValue': '%s', 'afterValue': '%s|%s|%s|%s|%s|%s|%s|%s', 'agentId': %s, 'clientId': %d, 'dateTime': '%s'",
                oldValues, updatedAccount.getAccountId(), updatedAccount.getClientId(), updatedAccount.getAccountType(),
                updatedAccount.getAccountStatus(), updatedAccount.getOpeningDate(), updatedAccount.getInitialDeposit(),
                updatedAccount.getCurrency(), updatedAccount.getBranchId(), agentId, updatedAccount.getClientId(), 
                LocalDateTime.now());
        pushLogToSQS(log);
        return updatedAccount;
    }

    public String getAgentId(HttpServletRequest request) {
        // Get the JWT token from ALB header
        // String userId = request.getHeader("x-amzn-oidc-identity");
        // System.out.println("User ID: " + userId);
        String token = request.getHeader("x-amzn-oidc-data");
        
        if (token == null) {
            throw new RuntimeException("No authentication token found");
        }

        String[] parts = token.split("\\.");
        String payload = new String(Base64.getDecoder().decode(parts[1]));
        // Parse JSON and get agentId claim
        // This is just a simplified example
        String agentId = payload.split("\"sub\":\"")[1].split("\"")[0]; // called sub in the token
        // System.out.println("Agent ID: " + agentId);
        // System.out.println("Payload: " + payload);
        return agentId;
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
}

