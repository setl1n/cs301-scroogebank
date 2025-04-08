#==============================================================================
# Lambda Module - Main Resources
# 
# This module creates Lambda functions with appropriate IAM roles and
# permissions based on which AWS services each function needs to access.
# It supports configuring access to RDS, DynamoDB, SES, SQS, and other services.
#==============================================================================

#------------------------------------------------------------------------------
# Lambda Functions
#------------------------------------------------------------------------------
resource "aws_lambda_function" "lambda_functions" {
  for_each = var.lambda_functions

  # Basic Lambda configuration
  function_name    = each.value.name
  handler          = each.value.handler
  runtime          = each.value.runtime
  filename         = each.value.filename
  source_code_hash = each.value.source_code_hash # Ensures redeployment when code changes
  timeout          = each.value.timeout
  memory_size      = each.value.memory_size
  role             = aws_iam_role.lambda_role[each.key].arn

  # Configure VPC access only if Lambda needs access to VPC resources (e.g., RDS)
  # This avoids unnecessary ENI creation for functions that don't need VPC access
  vpc_config {
    subnet_ids         = (each.value.rds_config != null) ? var.private_lambda_subnet_ids : []
    security_group_ids = (each.value.rds_config != null) ? [var.lambda_sg_id] : []
  }

  # Set up environment variables dynamically based on required service integrations
  environment {
    variables = merge(
      # Base environment variables provided in configuration
      each.value.environment_variables != null ? each.value.environment_variables : {},

      # RDS connection variables - added only when RDS config is provided
      each.value.rds_config != null ? {
        JDBC_URL      = "jdbc:postgresql://${each.value.rds_config.database_host}:5432/${each.value.rds_config.database_name}"
        JDBC_USER     = each.value.rds_config.database_user
        JDBC_PASSWORD = each.value.rds_config.database_pass
      } : {},

      # DynamoDB connection variables - added only when DynamoDB config is provided
      each.value.dynamodb_config != null ? {
        DYNAMODB_TABLE  = each.value.dynamodb_config.table_name
        DYNAMODB_REGION = each.value.dynamodb_config.region
      } : {},

      # SES configuration - added only when SES config is provided
      each.value.ses_config != null ? {
        SES_REGION = each.value.ses_config.region
        FROM_EMAIL = each.value.ses_config.from_email
      } : {},

      # Cognito configuration
      each.value.cognito_config != null ? {
        COGNITO_USER_POOL_ID  = each.value.cognito_config.user_pool_id
        COGNITO_APP_CLIENT_ID = each.value.cognito_config.app_client_id
        COGNITO_REGION        = each.value.cognito_config.region
      } : {},

      each.value.sftp_config != null ? {
        SFTP_USER                    = each.value.sftp_config.sftp_user,
        SFTP_PASS                    = each.value.sftp_config.sftp_pass,
        SFTP_HOST                    = each.value.sftp_config.sftp_host,
        SFTP_PRIVATE_KEY_SECRET_NAME = each.value.sftp_config.sftp_private_key_secret_name,
      } : {}
    )
  }
}

#------------------------------------------------------------------------------
# SQS Event Source Mapping for Lambda
# Sets up triggers for Lambda functions that process SQS messages
#------------------------------------------------------------------------------
resource "aws_lambda_event_source_mapping" "sqs_event_source" {
  # Create only for Lambda functions configured with SQS integration
  for_each = {
    for k, v in var.lambda_functions : k => v
    if v.sqs_config != null
  }

  # Core configuration
  event_source_arn = each.value.sqs_config.queue_arn
  function_name    = aws_lambda_function.lambda_functions[each.key].arn

  # Batch processing settings
  batch_size                         = lookup(each.value.sqs_config, "batch_size", 10)
  maximum_batching_window_in_seconds = lookup(each.value.sqs_config, "maximum_batching_window_in_seconds", 0)

  # Optional configurations with sensible defaults
  enabled                 = lookup(each.value.sqs_config, "enabled", true)
  function_response_types = lookup(each.value.sqs_config, "function_response_types", null)

  # Concurrency settings to control Lambda scaling
  scaling_config {
    maximum_concurrency = lookup(each.value.sqs_config, "maximum_concurrency", 10)
  }
}