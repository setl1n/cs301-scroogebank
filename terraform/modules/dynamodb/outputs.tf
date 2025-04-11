#----------------------------------------
# DynamoDB Table Outputs
# Exposes key attributes of the DynamoDB table for use in other modules
#----------------------------------------

#----------------------------------------
# Table Identifiers
# Basic information needed to reference the table
#----------------------------------------
output "table_name" {
  value       = aws_dynamodb_table.logs_table.name
  description = "Name of the DynamoDB logs table"
}

output "table_arn" {
  value       = aws_dynamodb_table.logs_table.arn
  description = "ARN of the DynamoDB logs table"
}

output "table_id" {
  value       = aws_dynamodb_table.logs_table.id
  description = "ID of the DynamoDB logs table"
}

#----------------------------------------
# Service Endpoint
# Connection URL for the DynamoDB service
#----------------------------------------
output "dynamodb_endpoint" {
  value       = "https://dynamodb.${data.aws_region.current.name}.amazonaws.com"
  description = "DynamoDB endpoint URL for the logs microservice"
}

#----------------------------------------
# AWS Region Data Source
# For accessing the current region in this module
#----------------------------------------
data "aws_region" "current" {}