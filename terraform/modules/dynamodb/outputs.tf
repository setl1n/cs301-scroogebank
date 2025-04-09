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

output "dynamodb_endpoint" {
  value       = "https://dynamodb.${data.aws_region.current.name}.amazonaws.com"
  description = "DynamoDB endpoint URL for the logs microservice"
}

# For accessing the AWS region
data "aws_region" "current" {}