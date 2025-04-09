package com.cs301g2t1.client.model;

import java.io.Serializable;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.time.LocalDate;
import java.time.Period;

@Data
@Entity
public class Client implements Serializable {

    private static final long serialVersionUID = 1L;
    
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long clientId; // System-generated unique identifier

    @NotBlank(message = "First name is required")
    @Size(min = 2, max = 50)
    @Pattern(regexp = "^[A-Za-z ]+$", message = "First name must contain only alphabetic characters and spaces")
    private String firstName;

    @NotBlank(message = "Last name is required")
    @Size(min = 2, max = 50)
    @Pattern(regexp = "^[A-Za-z ]+$", message = "Last name must contain only alphabetic characters and spaces")
    private String lastName;

    @NotNull(message = "Date of birth is required")
    @Past(message = "Date of birth must be in the past")
    private LocalDate dateOfBirth;

    @NotBlank(message = "Gender is required")
    @Pattern(regexp = "^(Male|Female|Non-binary|Prefer not to say)$", message = "Gender must be one of: Male, Female, Non-binary, Prefer not to say")
    private String gender;

    @NotBlank(message = "Email address is required")
    @Email(message = "Invalid email format")
    @Column(unique = true)
    private String emailAddress;

    @NotBlank(message = "Phone number is required")
    @Pattern(regexp = "^\\+?[0-9]{10,15}$", message = "Phone number must be between 10 and 15 digits and can start with +")
    @Column(unique = true)
    private String phoneNumber;

    @NotBlank(message = "Address is required")
    @Size(min = 5, max = 100)
    private String address;

    @NotBlank(message = "City is required")
    @Size(min = 2, max = 50)
    private String city;

    @NotBlank(message = "State is required")
    @Size(min = 2, max = 50)
    private String state;

    @NotBlank(message = "Country is required")
    @Size(min = 2, max = 50)
    private String country; // For this case, always "Singapore" but validated as a String

    @NotBlank(message = "Postal Code is required")
    @Size(min = 4, max = 10)
    // You might want to add a regex specific to Singapore's postal code format if needed.
    private String postalCode;

    // Getters and setters omitted for brevity

    // Custom validation: Ensure age is between 18 and 100 years.
    @AssertTrue(message = "Client must be between 18 and 100 years old")
    public boolean isAgeValid() {
        if (dateOfBirth == null) {
            return false;
        }
        int age = Period.between(dateOfBirth, LocalDate.now()).getYears();
        return age >= 18 && age <= 100;
    }

    // Constructors, getters, and setters...
}