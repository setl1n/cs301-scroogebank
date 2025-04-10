variable "user_pool_name" {
  description = "Name of the Cognito User Pool"
  type        = string
  default     = "CS301-G2-T1"
}

variable "user_pool_client_name" {
  description = "Name of the Cognito User Pool Client"
  type        = string
  default     = "CS301-G2-T1-AppClient"
}

variable "password_min_length" {
  description = "Minimum length of the password"
  type        = number
  default     = 8
  validation {
    condition     = var.password_min_length >= 8
    error_message = "Password minimum length must be at least 8 characters."
  }
}

variable "password_require_lowercase" {
  description = "Whether to require lowercase letters in passwords"
  type        = bool
  default     = true
}

variable "password_require_uppercase" {
  description = "Whether to require uppercase letters in passwords"
  type        = bool
  default     = true
}

variable "password_require_numbers" {
  description = "Whether to require numbers in passwords"
  type        = bool
  default     = true
}

variable "password_require_symbols" {
  description = "Whether to require symbols in passwords"
  type        = bool
  default     = false
}

variable "mfa_configuration" {
  description = "MFA configuration for the user pool. Can be 'OFF', 'ON', or 'OPTIONAL'"
  type        = string
  default     = "OFF"
  validation {
    condition     = contains(["OFF", "ON", "OPTIONAL"], var.mfa_configuration)
    error_message = "MFA configuration must be one of: OFF, ON, or OPTIONAL."
  }
}

variable "cognito_domain" {
  description = "Domain prefix for Cognito hosted UI"
  type        = string
}

variable "callback_urls" {
  description = "List of allowed callback URLs for the identity providers"
  type        = list(string)
}

variable "logout_urls" {
  description = "List of allowed logout URLs for the identity providers"
  type        = list(string)
}

variable "aws_region" {
  description = "AWS region for the Cognito User Pool"
  type        = string
}

variable "alb_dns_name" {
  description = "The DNS name of the application load balancer"
  type        = string
}

variable "custom_domain" {
  description = "Custom domain for the application (if configured)"
  type        = string
  default     = ""  # Make it optional with a default value
}