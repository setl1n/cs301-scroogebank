#==============================================================================
# Lambda Module - Main Resources
# 
# This module creates Lambda functions with appropriate IAM roles and
# permissions based on which AWS services each function needs to access.
# It supports configuring access to RDS, DynamoDB, SES, SQS, and other services.
#
# The module uses a "configuration-driven" approach where you specify which 
# services each function needs to access, and the appropriate permissions
# and environment variables are automatically configured.
#==============================================================================

#------------------------------------------------------------------------------
# Lambda Functions
#
# Creates the actual Lambda function resources with all necessary configurations:
# - Base settings (runtime, handler, memory, timeout)
# - IAM role assignment with appropriate permissions
# - Environment variables for service connections
# - VPC configuration for functions that need it
#------------------------------------------------------------------------------
resource "aws_lambda_function" "lambda_functions" {
  for_each = var.lambda_functions

  # Basic Lambda configuration
  function_name    = each.value.name
  handler          = each.value.handler                     # Format varies by runtime: index.handler for Node.js, module.function for Python
  runtime          = each.value.runtime                     # e.g., nodejs14.x, python3.9, java11, etc.
  filename         = each.value.filename                    # Path to the deployment package (ZIP file)
  source_code_hash = each.value.source_code_hash            # Ensures redeployment when code changes
  timeout          = each.value.timeout                     # Maximum execution time in seconds (max 900s)
  memory_size      = each.value.memory_size                 # Memory allocation in MB (affects CPU allocation too)
  role             = aws_iam_role.lambda_role[each.key].arn # IAM role with appropriate permissions

  # Configure VPC access only if Lambda needs access to VPC resources (e.g., RDS)
  # This avoids unnecessary ENI creation for functions that don't need VPC access
  # ENIs count against your VPC limits and can be a potential bottleneck
  vpc_config {
    subnet_ids         = (each.value.rds_config != null) ? var.private_lambda_subnet_ids : []
    security_group_ids = (each.value.rds_config != null) ? [var.lambda_sg_id] : []
  }

  # Set up environment variables dynamically based on required service integrations
  # Environment variables are encrypted at rest and decrypted during function initialization
  # They're accessible in the Lambda function code via process.env (Node.js) or os.environ (Python)
  environment {
    variables = merge(
      # Base environment variables provided in configuration
      # These are custom variables specified by the user
      each.value.environment_variables != null ? each.value.environment_variables : {},

      # RDS connection variables - added only when RDS config is provided
      # Provides standardized environment variables for database connections
      each.value.rds_config != null ? {
        JDBC_URL      = "jdbc:postgresql://${each.value.rds_config.database_host}:5432/${each.value.rds_config.database_name}"
        JDBC_USER     = each.value.rds_config.database_user
        JDBC_PASSWORD = each.value.rds_config.database_pass
      } : {},

      # DynamoDB connection variables - added only when DynamoDB config is provided
      # Allows the function to easily locate the DynamoDB table
      each.value.dynamodb_config != null ? {
        DYNAMODB_TABLE  = each.value.dynamodb_config.table_name
        DYNAMODB_REGION = each.value.dynamodb_config.region
      } : {},

      # SES configuration - added only when SES config is provided
      # Provides email sending configuration
      each.value.ses_config != null ? {
        SES_REGION = each.value.ses_config.region
        FROM_EMAIL = each.value.ses_config.from_email
      } : {},

      # Cognito configuration - for user authentication/authorization
      # Allows the function to interact with Cognito User Pools
      each.value.cognito_config != null ? {
        COGNITO_USER_POOL_ID  = each.value.cognito_config.user_pool_id
        COGNITO_APP_CLIENT_ID = each.value.cognito_config.app_client_id
        COGNITO_REGION        = each.value.cognito_config.region
      } : {},

      # SFTP configuration - for secure file transfers
      # Provides connection details for SFTP operations
      each.value.sftp_config != null ? {
        SFTP_USER                    = each.value.sftp_config.sftp_user,
        SFTP_HOST                    = each.value.sftp_config.sftp_host,
        SFTP_PRIVATE_KEY_SECRET_NAME = each.value.sftp_config.sftp_private_key_secret_name,
      } : {}
    )
  }
}

#------------------------------------------------------------------------------
# SQS Event Source Mapping for Lambda
# Sets up triggers for Lambda functions that process SQS messages
#
# This creates the event source that automatically invokes Lambda when
# messages arrive in an SQS queue. The Lambda is triggered either when
# the batch size is reached or when the batching window expires.
#------------------------------------------------------------------------------
resource "aws_lambda_event_source_mapping" "sqs_event_source" {
  # Create only for Lambda functions configured with SQS integration
  for_each = {
    for k, v in var.lambda_functions : k => v
    if v.sqs_config != null
  }

  # Core configuration - links the SQS queue to the Lambda function
  event_source_arn = each.value.sqs_config.queue_arn                    # ARN of the SQS queue
  function_name    = aws_lambda_function.lambda_functions[each.key].arn # ARN of the Lambda function

  # Batch processing settings
  # These control how many messages are processed in a single Lambda invocation
  batch_size                         = lookup(each.value.sqs_config, "batch_size", 10)                        # Number of messages per batch (1-10000)
  maximum_batching_window_in_seconds = lookup(each.value.sqs_config, "maximum_batching_window_in_seconds", 0) # Max wait time for batch accumulation (0-300s)

  # Optional configurations with sensible defaults
  enabled                 = lookup(each.value.sqs_config, "enabled", true)                 # Can be used to temporarily disable processing
  function_response_types = lookup(each.value.sqs_config, "function_response_types", null) # For partial batch failures

  # Concurrency settings to control Lambda scaling
  # Limits the number of concurrent executions to prevent overwhelming downstream systems
  scaling_config {
    maximum_concurrency = lookup(each.value.sqs_config, "maximum_concurrency", 10) # Maximum concurrent Lambda invocations
  }
}