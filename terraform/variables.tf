#--------------------------------------------------------------
# CS301 Group 2 Team 1 Project Variables
# This file defines all input variables used throughout the Terraform configuration.
# Sensitive values should be supplied via terraform.tfvars (not committed to version control).
#--------------------------------------------------------------

#--------------------------------------------------------------
# AWS General Configuration
#--------------------------------------------------------------
variable "aws_region" {
  description = "AWS region for resources"
  type        = string
  default     = "ap-southeast-1"
}

#--------------------------------------------------------------
# Domain and DNS Configuration
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

variable "CUSTOM_DOMAIN" {
  description = "Custom domain for the application"
  type        = string
  default     = "alb.itsag2t1.com"
}

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
    account = {
      identifier = "account-db"
    },
    transaction = {
      identifier = "transaction-db"
    },
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
variable "COGNITO_DOMAIN" {
  description = "Custom domain name for the Cognito User Pool"
  type        = string
}

variable "ENABLE_LOCAL_DEVELOPMENT" {
  description = "Whether to enable localhost URLs for local development in Cognito"
  type        = bool
  default     = true
}

variable "LOCAL_DEVELOPMENT_PORTS" {
  description = "List of localhost ports to allow for local development"
  type        = list(number)
  default     = [3000, 8080, 4200, 5173] # Common ports for React, Node, Angular development
}

#--------------------------------------------------------------
# SFTP Server Configuration
# Used for securely transferring files
#--------------------------------------------------------------
variable "sftp_private_key_secret_name" {
  description = "Name for the AWS Secrets Manager secret that will store the SFTP private key"
  type        = string
  default     = "sftp-server-private-key"
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
    cognito_enabled  = optional(bool, false)
    sftp_enabled     = optional(bool, false)
    sqs_enabled      = optional(bool, false)
    s3_enabled       = optional(bool, false)
    public_facing    = optional(bool, false) # Whether this Lambda should be exposed via ALB

    # SQS specific configuration
    sqs_trigger_enabled         = optional(bool, false)
    sqs_batch_size              = optional(number, 10)
    sqs_batching_window_seconds = optional(number, 0)

    # Environment variables (optional)
    environment_variables = optional(map(string), {})
  }))

  default = {
    transaction = {
      name         = "transaction_lambda_function"
      handler      = "com.cs301g2t1.transaction.TransactionHandler::handleRequest"
      runtime      = "java21"
      filename     = "../backend/transaction/target/transaction-1.0-SNAPSHOT.jar"
      timeout      = 90
      memory_size  = 256
      rds_enabled  = true
      sftp_enabled = true
      environment_variables = {
        SFTP_PORT   = "22"
        SFTP_TARGET = "/sftp/target"
      }
    },
    user = {
      name            = "user_lambda_function"
      handler         = "com.cs301g2t1.user.UserHandler::handleRequest"
      runtime         = "java21"
      filename        = "../backend/user/target/user-0.0.1-SNAPSHOT.jar"
      timeout         = 45
      memory_size     = 256
      cognito_enabled = true
    },
    log = {
      name                = "log_lambda_function"
      handler             = "com.cs301g2t1.log.LogHandler::handleRequest"
      runtime             = "java21"
      filename            = "../backend/log/target/log-1.0-SNAPSHOT.jar"
      timeout             = 45
      memory_size         = 256
      dynamodb_enabled    = true
      sqs_enabled         = true
      sqs_trigger_enabled = true # Enable SQS triggering
      sqs_batch_size      = 10   # Process 10 messages at a time
    },
    verification = {
      name          = "verification_lambda_function"
      handler       = "com.cs301g2t1.verification.VerificationHandler::handleRequest"
      runtime       = "java21"
      filename      = "../backend/verification/target/verification-0.0.1-SNAPSHOT.jar"
      timeout       = 45
      memory_size   = 256
      s3_enabled    = true
      public_facing = true
    },
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
# ECS Services Configuration
# Defines ECS services including database, cache, and application settings
#--------------------------------------------------------------
variable "ecs_services" {
  description = "Configuration map for ECS services including database, cache, and application settings"
  type = map(object({
    cluster_name   = string
    db_endpoint    = string
    db_port        = number
    redis_endpoint = string
    redis_port     = number
    app_image      = string
    app_port       = number
    path_pattern   = list(string)
    auth_enabled   = bool
  }))
  default = {
    client = {
      cluster_name   = "client-cluster"
      db_endpoint    = null # Will be filled dynamically in main.tf
      db_port        = 5432
      redis_endpoint = null # Will be filled dynamically in main.tf
      redis_port     = null # Will be filled dynamically in main.tf
      app_image      = "677761253473.dkr.ecr.ap-southeast-1.amazonaws.com/cs301g2t1-client:latest"
      app_port       = 8080
      path_pattern   = ["/api/v1/clients*"]
      auth_enabled   = true
    }
    account = {
      cluster_name   = "account-cluster"
      db_endpoint    = null # Will be filled dynamically in main.tf
      db_port        = 5432
      redis_endpoint = null # Will be filled dynamically in main.tf
      redis_port     = null # Will be filled dynamically in main.tf
      app_image      = "677761253473.dkr.ecr.ap-southeast-1.amazonaws.com/cs301g2t1-account:latest"
      app_port       = 8080
      path_pattern   = ["/api/v1/accounts*"]
      auth_enabled   = true
    }
  }
}

variable "health_check_path" {
  type        = string
  default     = "/api/v1/health"
  description = "Health check path for microservices"
}