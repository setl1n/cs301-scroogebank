package com.cs301g2t1.log.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@DynamoDbBean
public class LogEntry {
    private String id;

    @DynamoDbPartitionKey
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }
    
    private String operation;
    private String attributeName;
    private String beforeValue;
    private String afterValue;
    
    private String agentId;
    private String clientId;
    
    // Remove the dateTime field & standard getter/setter
    // private LocalDateTime dateTime; (Lombok won't generate these methods now)
    
    // Store as string in DynamoDB but present as LocalDateTime in Java
    private String dateTimeStr;
    
    private Long expireAt;

    @DynamoDbSecondaryPartitionKey(indexNames = "TTLIndex")
    public Long getExpireAt() {
        return expireAt;
    }

    public void setExpireAt(Long expireAt) {
        this.expireAt = expireAt;
    }

    // Helper methods for backward compatibility
    public Long getIdAsLong() { 
        return id != null ? Long.parseLong(id) : null; 
    }
    
    public void setIdFromLong(Long longId) { 
        this.id = longId != null ? longId.toString() : null; 
    }
    
    public Long getAgentIdAsLong() { 
        return agentId != null ? Long.parseLong(agentId) : null; 
    }
    
    public void setAgentIdFromLong(Long longAgentId) { 
        this.agentId = longAgentId != null ? longAgentId.toString() : null; 
    }
    
    public Long getClientIdAsLong() { 
        return clientId != null ? Long.parseLong(clientId) : null; 
    }
    
    public void setClientIdFromLong(Long longClientId) { 
        this.clientId = longClientId != null ? longClientId.toString() : null; 
    }
    
    // Special methods for dateTime handling
    @DynamoDbSortKey
    @DynamoDbAttribute("dateTimeStr")
    public String getDateTimeStr() {
        return dateTimeStr;
    }
    
    public void setDateTimeStr(String dateTimeStr) {
        this.dateTimeStr = dateTimeStr;
    }
    
    // Virtual property - not stored directly in DynamoDB
    @DynamoDbIgnore
    public LocalDateTime getDateTime() {
        return dateTimeStr != null ? LocalDateTime.parse(dateTimeStr) : null;
    }
    
    @DynamoDbIgnore
    public void setDateTime(LocalDateTime dateTime) {
        this.dateTimeStr = dateTime != null ? dateTime.toString() : null;
    }
}