# Network Configuration Variables
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

    # Additional services can be added here
    environment_variables = optional(map(string))
  }))
}