#----------------------------------------
# Lambda Module Variables
# 
# This file defines all the input variables needed for the Lambda module.
# Each Lambda function can be configured with different service connections
# and the module will automatically set up the appropriate permissions.
#----------------------------------------

#----------------------------------------
# Network Configuration Variables
#----------------------------------------
variable "private_lambda_subnet_ids" {
  description = "List of private subnet IDs for Lambda functions that need VPC access"
  type        = list(string)
  default     = []
}

variable "lambda_sg_id" {
  description = "Security group ID for Lambda functions that need VPC access"
  type        = string
  default     = ""
}

#----------------------------------------
# Lambda Function Configurations
#----------------------------------------
variable "lambda_functions" {
  description = "Map of Lambda functions with their configurations"
  type = map(object({
    name             = string
    handler          = string
    runtime          = string
    filename         = string
    source_code_hash = string
    timeout          = number
    memory_size      = number

    # Service connections (optional)
    # RDS configuration for database access
    rds_config = optional(object({
      database_host = string
      database_name = string
      database_user = string
      database_pass = string
    }))

    # DynamoDB configuration for NoSQL access
    dynamodb_config = optional(object({
      table_name = string
      region     = string
    }))

    # SES configuration for email sending capabilities
    ses_config = optional(object({
      region     = string
      from_email = string
    }))

    # Custom environment variables specific to each Lambda function
    environment_variables = optional(map(string))
  }))
}