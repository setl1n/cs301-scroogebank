#--------------------------------------------------------------
# CS301 Group 2 Team 1 Project Variables
# This file defines all input variables used throughout the Terraform configuration.
# Sensitive values should be supplied via terraform.tfvars (not committed to version control).
#--------------------------------------------------------------

#--------------------------------------------------------------
# Database Configuration
# These credentials will be used for RDS instance setup
#--------------------------------------------------------------
variable "DATABASE_NAME" {
  description = "Name of the database to create"
  type        = string
  sensitive   = true
}

variable "DATABASE_USERNAME" {
  description = "Username for database access"
  type        = string
  sensitive   = true
}

variable "DATABASE_PASSWORD" {
  description = "Password for database access"
  type        = string
  sensitive   = true
}

#--------------------------------------------------------------
# Domain Configuration
# Used for setting up Route53 DNS records and certificates
#--------------------------------------------------------------
variable "DOMAIN_NAME" {
  description = "Domain name"
  type        = string
  sensitive   = true
}

variable "ROUTE53_ZONE_ID" {
  description = "Hosted zone ID for Route53"
  type        = string
  sensitive   = true
}

#--------------------------------------------------------------
# Application Database Configurations
# Defines database identifiers for each microservice
#--------------------------------------------------------------
variable "applications" {
  description = "Map of applications with their configurations"
  type = map(object({
    identifier = string
  }))
  default = {
    client = {
      identifier = "client-db"
    },
    # account = {
    #   identifier = "account-db"
    # },
    # transaction = {
    #   identifier = "transaction-db"
    # },
  }
}

#--------------------------------------------------------------
# Lambda Functions Configuration
# Each Lambda function can have different configurations and permissions
# - Service flags enable appropriate IAM permissions
# - Environment variables can be passed to each function
#--------------------------------------------------------------
variable "lambda_functions" {
  description = "Configuration for Lambda functions"
  type = map(object({
    name        = string
    handler     = string
    runtime     = string
    filename    = string
    timeout     = optional(number, 10)
    memory_size = optional(number, 128)

    # Service flags
    rds_enabled      = optional(bool, false)
    ses_enabled      = optional(bool, false)
    dynamodb_enabled = optional(bool, false)

    # Environment variables (optional)
    environment_variables = optional(map(string), {})
  }))

  default = {
    transaction = {
      name        = "transaction_lambda_function"
      handler     = "com.cs301g2t1.transaction.TransactionHandler::handleRequest"
      runtime     = "java21"
      filename    = "../backend/transaction/target/transaction-1.0-SNAPSHOT.jar"
      timeout     = 15
      memory_size = 256
      rds_enabled = true
    }
    # Example with other services
    # notification_sender = {
    #   name             = "notification-sender"
    #   handler          = "index.handler"
    #   runtime          = "nodejs18.x"
    #   filename         = "${path.module}/lambda_functions/notification_sender.zip"
    #   ses_enabled      = true
    # }
    # data_processor = {
    #   name             = "data-processor"
    #   handler          = "processor.handler"
    #   runtime          = "python3.9"
    #   filename         = "${path.module}/lambda_functions/data_processor.zip"
    #   dynamodb_enabled = true
    # }
  }
}

#--------------------------------------------------------------
# S3 Bucket Configurations
# Defines buckets for:
# - Frontend hosting (configured as static websites)
# - Document storage
#--------------------------------------------------------------
variable "s3_buckets" {
  description = "Map of S3 buckets to create with their configurations"
  type = map(object({
    name           = string
    is_website     = bool
    index_document = optional(string, "index.html")
    error_document = optional(string, "index.html")
  }))

  default = {
    main_frontend = {
      name       = "cs301g2t1-main-frontend-bucket"
      is_website = true
    },
    verification_frontend = {
      name       = "cs301g2t1-verification-frontend-bucket"
      is_website = true
    },
    verification_documents = {
      name       = "cs301g2t1-verification-documents-bucket"
      is_website = false
    }
  }
}

#--------------------------------------------------------------
# Cognito Configuration
# Defines AWS Cognito settings for user authentication
#--------------------------------------------------------------
variable "aws_region" {
  description = "AWS region for Cognito"
  type        = string
  default     = "ap-southeast-1"
}
