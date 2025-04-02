#==============================================================================
# Lambda Module Variables
#
# This file defines all the input variables needed for the Lambda module.
# Each Lambda function can be configured with different service connections
# and the module will automatically set up the appropriate permissions.
#==============================================================================

#------------------------------------------------------------------------------
# Network Configuration Variables
# These variables control how Lambda functions connect to VPC resources
#------------------------------------------------------------------------------
variable "private_lambda_subnet_ids" {
  description = "List of subnet IDs where Lambda functions will be deployed when VPC access is required"
  type        = list(string)
  default     = []
}

variable "lambda_sg_id" {
  description = "Security group ID that controls network access for Lambda functions within VPC"
  type        = string
  default     = ""
}

variable "aws_region" {
  description = "AWS region for creating resources (used for service endpoints)"
  type        = string
  default     = "ap-southeast-1"
}

#------------------------------------------------------------------------------
# Lambda Function Configurations
# Main configuration map that defines all Lambda functions to be created
#------------------------------------------------------------------------------
variable "lambda_functions" {
  description = "Map of Lambda functions with their configurations including service connections and permissions"
  type        = map(any)
  # Example structure:
  # {
  #   "function_key": {
  #     name = "function-name",
  #     handler = "index.handler",
  #     runtime = "nodejs14.x",
  #     filename = "path/to/zip",
  #     timeout = 30,
  #     memory_size = 128,
  #     environment_variables = { KEY = "value" },
  #     rds_config = { database_host = "", database_name = "" },
  #     dynamodb_enabled = true,
  #     ses_enabled = true,
  #     sqs_enabled = true,
  #     sftp_enabled = true
  #   }
  # }
}