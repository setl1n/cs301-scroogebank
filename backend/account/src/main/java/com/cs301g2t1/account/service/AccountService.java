package com.cs301g2t1.account.service;

import java.util.Base64;
import java.time.LocalDateTime; 

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import software.amazon.awssdk.services.sqs.SqsClient;
import software.amazon.awssdk.services.sqs.model.SendMessageRequest;
import software.amazon.awssdk.services.sqs.model.SendMessageResponse;
import software.amazon.awssdk.services.sqs.model.GetQueueUrlRequest;
import com.cs301g2t1.account.model.Account;
import com.cs301g2t1.account.repository.AccountRepository;

import jakarta.servlet.http.HttpServletRequest;

@Service
public class AccountService {
    private final AccountRepository accountRepository;

    @Value("${aws.sqs.queueName}")
    private String queueName;

    @Value("${aws.sqs.region}")
    private String sqsRegion;

    private final SqsClient sqsClient;

    @Autowired
    public AccountService(AccountRepository accountRepository, SqsClient sqsClient) {
        this.accountRepository = accountRepository;
        this.sqsClient = sqsClient;
    }

    public Account createAccount(Account account, Long agentId) {
        // Check if account with the same clientId already exists
        Account createdAccount = accountRepository.save(account);
        // log the creation of the account to sqs
        /*
         * {\"operation\": \"CREATE\", 
         * \"attributeName\": \"exampleAttr\", 
         * \"beforeValue\": \"\", 
         * \"afterValue\": \"newValue\", 
         * \"agentId\": 123, 
         * \"clientId\": 456, 
         * \"dateTime\": \"2025-03-28T21:46:20\"}"
         */
        String log = String.format("'operation': 'CREATE', 'attributeName': 'Account ID|Client ID|Account Type|Account Status|Opening Date|Initial Deposit|Currency|Branch ID', 'beforeValue': '|||||||', 'afterValue': '%s|%s|%s|%s|%s|%s|%s|%s', 'agentId': %d, 'clientId': %d, 'dateTime': '%s'",
                createdAccount.getAccountId(), createdAccount.getClientId(), createdAccount.getAccountType(),
                createdAccount.getAccountStatus(), createdAccount.getOpeningDate(), createdAccount.getInitialDeposit(),
                createdAccount.getCurrency(), createdAccount.getBranchId(), agentId, account.getClientId(), 
                LocalDateTime.now());
        pushLogToSQS(log);

        return createdAccount;
    }

    public Account deleteAccount(Long id) {
        Account account = accountRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Account not found with ID: " + id));
        accountRepository.delete(account);
        String log = String.format("delete", null);
        pushLogToSQS(log);
        return account;
    }

    public Long getAgentId(HttpServletRequest request) {
        // Get the JWT token from ALB header
        // String userId = request.getHeader("x-amzn-oidc-identity");
        // System.out.println("User ID: " + userId);
        // String token = request.getHeader("x-amzn-oidc-data");
        
        // if (token == null) {
        //     throw new RuntimeException("No authentication token found");
        // }

        // String[] parts = token.split("\\.");
        // String payload = new String(Base64.getDecoder().decode(parts[1]));
        // // Parse JSON and get agentId claim
        // // This is just a simplified example
        // String agentId = payload.split("\"agentId\":\"")[1].split("\"")[0];
        // System.out.println("Agent ID: " + agentId);
        
        // // Convert the extracted email (or ID) to a Long
        // try {
        //     return Long.parseLong(agentId);
        // } catch (NumberFormatException e) {
        //     throw new IllegalArgumentException("Invalid agent ID format in token: " + agentId, e);
        // }
        return 1L;
        
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

