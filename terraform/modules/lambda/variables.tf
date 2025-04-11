#==============================================================================
# Lambda Module Variables
#
# This file defines all the input variables needed for the Lambda module.
# Each Lambda function can be configured with different service connections
# and the module will automatically set up the appropriate permissions.
#
# The module is designed to be flexible, allowing you to create multiple
# Lambda functions with different configurations from a single module instance.
#==============================================================================

#------------------------------------------------------------------------------
# Network Configuration Variables
# These variables control how Lambda functions connect to VPC resources
#
# VPC connectivity is required for functions that need to access:
# - RDS databases within a private subnet
# - ElastiCache instances
# - Other VPC-bound resources
#------------------------------------------------------------------------------
variable "private_lambda_subnet_ids" {
  description = "List of subnet IDs where Lambda functions will be deployed when VPC access is required. These should typically be private subnets with NAT gateway access."
  type        = list(string)
  default     = []
}

variable "lambda_sg_id" {
  description = "Security group ID that controls network access for Lambda functions within VPC. Should allow outbound access to required services (RDS, ElastiCache, etc.)."
  type        = string
  default     = ""
}

variable "aws_region" {
  description = "AWS region for creating resources (used for service endpoints). Ensures all resources are created in the same region for proper connectivity."
  type        = string
  default     = "ap-southeast-1"
}

variable "https_listener_arn" {
  description = "ARN of the HTTPS listener"
  type        = string
}

variable "health_check_path" {
  type        = string
  default     = "/api/v1/health"
  description = "Health check path for microservices"
}
#------------------------------------------------------------------------------
# Lambda Function Configurations
# Main configuration map that defines all Lambda functions to be created
#
# This map-based approach allows creating multiple functions with different
# configurations in a single module call, reducing repetitive Terraform code.
#------------------------------------------------------------------------------
variable "lambda_functions" {
  description = "Map of Lambda functions with their configurations including service connections and permissions. Each function can have different resource access needs and configurations."
  type        = map(any)
  # Example structure:
  # {
  #   "function_key": {
  #     name = "function-name",                    # Name used for the Lambda function
  #     handler = "index.handler",                 # Entry point in your code
  #     runtime = "nodejs14.x",                    # Runtime environment
  #     filename = "path/to/zip",                  # Path to the deployment package
  #     timeout = 30,                              # Execution timeout in seconds
  #     memory_size = 128,                         # Memory allocation in MB
  #     environment_variables = { KEY = "value" }, # Environment variables
  #     rds_config = {                             # RDS connection details
  #       database_host = "", 
  #       database_name = "",
  #       database_user = "",
  #       database_pass = ""
  #     },
  #     dynamodb_enabled = true,                   # Enable DynamoDB access
  #     dynamodb_config = {                        # DynamoDB configuration
  #       table_name = "",
  #       region = ""
  #     },
  #     ses_enabled = true,                        # Enable SES access
  #     ses_config = {                             # SES configuration
  #       region = "",
  #       from_email = ""
  #     },
  #     sqs_enabled = true,                        # Enable SQS access
  #     sqs_config = {                             # SQS configuration
  #       queue_arn = "",
  #       batch_size = 10,
  #       maximum_batching_window_in_seconds = 0,
  #       maximum_concurrency = 10
  #     },
  #     sftp_enabled = true,                       # Enable SFTP access
  #     sftp_config = {                            # SFTP configuration
  #       sftp_user = "",
  #       sftp_pass = "",
  #       sftp_host = "",
  #       sftp_private_key_secret_name = ""
  #     },
  #     cognito_enabled = true,                    # Enable Cognito access
  #     cognito_config = {                         # Cognito configuration
  #       user_pool_id = "",
  #       app_client_id = "",
  #       region = ""
  #     }
  #   }
  # }
}