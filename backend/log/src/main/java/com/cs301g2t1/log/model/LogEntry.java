package com.cs301g2t1.log.model;

import java.time.LocalDateTime;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
@Entity
public class LogEntry {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    // "CREATE", "UPDATE", "DELETE", "READ"
    @NotBlank(message = "Operation is required")
    private String operation;

    // For updates, this can be a composite of attribute names -- eg., "First Name|Address"
    private String attributeName;

    // Values before and after the change
    private String beforeValue;
    private String afterValue;

    @NotNull(message = "Agent ID is required")
    private Long agentId;

    @NotNull(message = "Client ID is required")
    private Long clientId;

    @NotNull(message = "DateTime is required")
    private LocalDateTime dateTime;
}