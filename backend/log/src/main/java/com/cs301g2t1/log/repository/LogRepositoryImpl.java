package com.cs301g2t1.log.repository;

import com.cs301g2t1.log.model.LogEntry;
import software.amazon.awssdk.enhanced.dynamodb.*;
import software.amazon.awssdk.enhanced.dynamodb.model.*;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.dynamodb.DynamoDbClient;

import java.util.*;
import java.util.stream.Collectors;

public class LogRepositoryImpl implements LogRepository {

    private static final String TABLE_NAME = System.getenv("DYNAMODB_TABLE");
    private static final String REGION = System.getenv("DYNAMODB_REGION");
    
    private final DynamoDbClient dynamoDbClient;
    private final DynamoDbEnhancedClient enhancedClient;
    private final DynamoDbTable<LogEntry> logTable;
    
    // Volatile for thread safety in singleton pattern
    private static volatile LogRepositoryImpl instance;

    private LogRepositoryImpl() {
        // Validate environment variables at initialization time
        if (TABLE_NAME == null || TABLE_NAME.trim().isEmpty()) {
            throw new IllegalStateException("DYNAMODB_TABLE_NAME environment variable is not set");
        }
        
        if (REGION == null || REGION.trim().isEmpty()) {
            throw new IllegalStateException("AWS_REGION environment variable is not set");
        }
        
        System.out.println("Initializing DynamoDb client for table '" + TABLE_NAME + "' in region '" + REGION + "'");

        this.dynamoDbClient = DynamoDbClient.builder()
                .region(Region.of(REGION))
                .build();
        
        this.enhancedClient = DynamoDbEnhancedClient.builder()
                .dynamoDbClient(dynamoDbClient)
                .build();
        
        this.logTable = enhancedClient.table(TABLE_NAME, 
                TableSchema.fromBean(LogEntry.class));
    }

    public static LogRepositoryImpl getInstance() {
        if (instance == null) {
            synchronized (LogRepositoryImpl.class) {
                if (instance == null) {
                    instance = new LogRepositoryImpl();
                }
            }
        }
        return instance;
    }

    @Override
    public List<LogEntry> findAll() {
        try {
            ScanEnhancedRequest scanRequest = ScanEnhancedRequest.builder().build();
            
            // Directly use LogEntry objects from scan
            return logTable.scan(scanRequest)
                    .items()
                    .stream()
                    .collect(Collectors.toList());
        } catch (Exception e) {
            throw new RuntimeException("Failed to fetch logs from DynamoDB", e);
        }
    }

    @Override
    public Optional<LogEntry> findById(Long id) {
        try {
            // Generate a key using the ID
            Key key = Key.builder().partitionValue(id.toString()).build();
            
            // Get the item from DynamoDB
            LogEntry result = logTable.getItem(key);
            
            // Return as Optional
            return Optional.ofNullable(result);
        } catch (Exception e) {
            throw new RuntimeException("Failed to fetch log by ID from DynamoDB", e);
        }
    }

    @Override
    public LogEntry save(LogEntry logEntry) {
        try {
            // If no ID is present, generate a unique ID
            if (logEntry.getId() == null) {
                logEntry.setId(UUID.randomUUID().toString());
            }
            
            // Set TTL value (30 days from now)
            long ttl = System.currentTimeMillis() / 1000 + (30 * 24 * 60 * 60);
            logEntry.setExpireAt(ttl);
            
            System.out.println("Saving item to table: " + TABLE_NAME);
            System.out.println("Item ID: " + logEntry.getId());
            System.out.println("Item details: " + logEntry);
            
            logTable.putItem(logEntry);
            return logEntry;
        } catch (Exception e) {
            System.err.println("SAVE ERROR - Exception type: " + e.getClass().getName());
            System.err.println("SAVE ERROR - Error message: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to save log entry to DynamoDB: " + e.getMessage(), e);
        }
    }

    @Override
    public void deleteById(Long id) {
        try {
            // Generate key for the item to delete
            Key key = Key.builder().partitionValue(id.toString()).build();
            
            // Delete the item
            logTable.deleteItem(key);
        } catch (Exception e) {
            throw new RuntimeException("Failed to delete log entry from DynamoDB", e);
        }
    }

    @Override
    public boolean existsById(Long id) {
        try {
            // Generate key for the item
            Key key = Key.builder().partitionValue(id.toString()).build();
            
            // Check if item exists
            LogEntry result = logTable.getItem(key);
            return result != null;
        } catch (Exception e) {
            throw new RuntimeException("Failed to check log entry existence in DynamoDB", e);
        }
    }
}