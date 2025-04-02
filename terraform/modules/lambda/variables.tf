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
  description = "List of subnet IDs for Lambda functions"
  type        = list(string)
  default     = []
}

variable "lambda_sg_id" {
  description = "Security group ID for Lambda functions"
  type        = string
  default     = ""
}

variable "aws_region" {
  description = "AWS region for creating resources"
  type        = string
  default     = "ap-southeast-1"
}

#----------------------------------------
# Lambda Function Configurations
#----------------------------------------
variable "lambda_functions" {
  description = "Map of Lambda functions configuration"
  type        = map(any)
}