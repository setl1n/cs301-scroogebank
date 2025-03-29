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
    
    private LocalDateTime dateTime;

    @DynamoDbSortKey
    public LocalDateTime getDateTime() {
        return dateTime;
    }

    public void setDateTime(LocalDateTime dateTime) {
        this.dateTime = dateTime;
    }
    
    private Long expireAt;

    public Long getIdAsLong() {  // backwards compatability
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
    
    @DynamoDbSortKey
    @DynamoDbAttribute("dateTime")
    public String getDateTimeAsString() {
        return dateTime != null ? dateTime.toString() : null;
    }
    
    public void setDateTimeAsString(String dateTimeStr) {
        this.dateTime = dateTimeStr != null ? LocalDateTime.parse(dateTimeStr) : null;
    }
}