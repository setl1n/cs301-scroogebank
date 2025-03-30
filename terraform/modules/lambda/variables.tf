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
  description = "List of subnet IDs for Lambda functions that need VPC access"
  type        = list(string)
  default     = []
}

variable "lambda_sg_id" {
  description = "Security group ID for Lambda functions"
  type        = string
  default     = ""
}

#----------------------------------------
# Lambda Function Configurations
#----------------------------------------
variable "lambda_functions" {
  description = "Configuration for Lambda functions"
  type = map(object({
    name             = string
    handler          = string
    runtime          = string
    filename         = string
    source_code_hash = string
    timeout          = number
    memory_size      = number

    environment_variables = map(string)

    # Service-specific configurations
    rds_config = optional(object({
      database_host = string
      database_name = string
      database_user = string
      database_pass = string
    }))

    dynamodb_config = optional(object({
      table_name = string
      region     = string
    }))

    ses_config = optional(object({
      region     = string
      from_email = string
    }))

    cognito_config = optional(object({
      user_pool_id  = string
      app_client_id = string
      region        = string
    }))
  }))
}