package com.cs301g2t1.user.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
@Entity
public class User {

    @Id
    private String userId;

    @NotBlank(message = "First name is required")
    @Size(min = 2, max = 50)
    @Pattern(regexp = "^[A-Za-z ]+$", message = "First name must contain only alphabetic characters and spaces")
    private String firstName;

    @NotBlank(message = "Last name is required")
    @Size(min = 2, max = 50)
    @Pattern(regexp = "^[A-Za-z ]+$", message = "Last name must contain only alphabetic characters and spaces")
    private String lastName;

    @NotBlank(message = "Email address is required")
    @Email(message = "Invalid email format")
    @Column(unique = true)
    private String email;

    @Enumerated(EnumType.STRING)
    @NotNull(message = "Role is required")
    @Column(columnDefinition = "VARCHAR(20)") // Some SQL issue
    private UserRole role;  
}
