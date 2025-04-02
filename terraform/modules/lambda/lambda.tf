#----------------------------------------
# Lambda Module
# 
# This module creates Lambda functions with appropriate IAM roles and
# permissions based on which AWS services each function needs to access.
# Supports configuring access to RDS, DynamoDB, SES, and other services.
#----------------------------------------

#----------------------------------------
# Lambda Functions
#----------------------------------------
# Creates Lambda functions based on the provided configurations,
# dynamically setting up VPC access and environment variables
resource "aws_lambda_function" "lambda_functions" {
  for_each = var.lambda_functions

  function_name    = each.value.name
  handler          = each.value.handler
  runtime          = each.value.runtime
  filename         = each.value.filename
  source_code_hash = each.value.source_code_hash
  timeout          = each.value.timeout
  memory_size      = each.value.memory_size
  role             = aws_iam_role.lambda_role[each.key].arn

  # Configure VPC access only if Lambda needs RDS or other VPC resources
  vpc_config {
    subnet_ids         = (each.value.rds_config != null) ? var.private_lambda_subnet_ids : []
    security_group_ids = (each.value.rds_config != null) ? [var.lambda_sg_id] : []
  }

  # Set up environment variables based on what services this Lambda needs
  environment {
    variables = merge(
      # Default environment variables
      each.value.environment_variables != null ? each.value.environment_variables : {},

      # RDS connection variables
      each.value.rds_config != null ? {
        JDBC_URL      = "jdbc:postgresql://${each.value.rds_config.database_host}:5432/${each.value.rds_config.database_name}"
        JDBC_USER     = each.value.rds_config.database_user
        JDBC_PASSWORD = each.value.rds_config.database_pass
      } : {},

      # DynamoDB connection variables
      each.value.dynamodb_config != null ? {
        DYNAMODB_TABLE  = each.value.dynamodb_config.table_name
        DYNAMODB_REGION = each.value.dynamodb_config.region
      } : {},

      # SES configuration
      each.value.ses_config != null ? {
        SES_REGION = each.value.ses_config.region
        FROM_EMAIL = each.value.ses_config.from_email
      } : {},
      
      # SQS configuration
      each.value.sqs_config != null ? {
        SQS_QUEUE_URL = each.value.sqs_config.queue_url
        SQS_REGION    = each.value.sqs_config.region
      } : {}
    )
  }
}

# SQS Event Source Mapping for Lambda
resource "aws_lambda_event_source_mapping" "sqs_event_source" {
  for_each = {
    for k, v in var.lambda_functions : k => v
    if v.sqs_config != null
  }

  event_source_arn        = each.value.sqs_config.queue_arn
  function_name           = aws_lambda_function.lambda_functions[each.key].arn
  batch_size              = lookup(each.value.sqs_config, "batch_size", 10)
  maximum_batching_window_in_seconds = lookup(each.value.sqs_config, "maximum_batching_window_in_seconds", 0)
  
  # Optional configurations
  enabled                 = lookup(each.value.sqs_config, "enabled", true)
  function_response_types = lookup(each.value.sqs_config, "function_response_types", null)
  scaling_config {
    maximum_concurrency = lookup(each.value.sqs_config, "maximum_concurrency", 10)
  }
}