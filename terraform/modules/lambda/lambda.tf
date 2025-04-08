#----------------------------------------
# Lambda Module
# 
# This module creates Lambda functions with appropriate IAM roles and
# permissions based on which AWS services each function needs to access.
# Supports configuring access to RDS, DynamoDB, SES, Cognito, and other services.
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
  timeout          = each.value.timeout + 15
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

#----------------------------------------
# IAM Policies and Roles
#----------------------------------------
# These locals filter Lambda functions by which AWS services they need to access
# This makes it easy to attach the appropriate policies only to functions that need them
locals {
  lambda_with_rds = nonsensitive({
    for k, v in var.lambda_functions : k => true if try(v.rds_config != null, false)
  })
  lambda_with_dynamodb = nonsensitive({
    for k, v in var.lambda_functions : k => true if try(v.dynamodb_config != null, false)
  })
  lambda_with_ses = nonsensitive({
    for k, v in var.lambda_functions : k => true if try(v.ses_config != null, false)
  })
  lambda_with_cognito = nonsensitive({
    for k, v in var.lambda_functions : k => true if try(v.cognito_config != null, false)
  })
  lambda_with_sftp = nonsensitive({
    for k, v in var.lambda_functions : k => true if try(v.sftp_config == true, false)
  })
}

# Create IAM role for each Lambda function
# These roles will have different policies attached based on what services each Lambda needs
resource "aws_iam_role" "lambda_role" {
  for_each = var.lambda_functions

  name = "${each.value.name}-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })
}

# Basic execution permission for CloudWatch Logs - needed by all Lambda functions
resource "aws_iam_role_policy_attachment" "lambda_basic_execution" {
  for_each = var.lambda_functions

  role       = aws_iam_role.lambda_role[each.key].name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

# VPC access for Lambda functions that need to connect to RDS or other VPC resources
resource "aws_iam_role_policy_attachment" "lambda_vpc_access" {
  for_each = local.lambda_with_rds

  role       = aws_iam_role.lambda_role[each.key].name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaVPCAccessExecutionRole"
}

#----------------------------------------
# Service-Specific Permissions
#----------------------------------------
# DynamoDB access permissions
resource "aws_iam_policy" "dynamodb_access" {
  for_each = local.lambda_with_dynamodb

  name = "${var.lambda_functions[each.key].name}-dynamodb-policy"
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = [
          "dynamodb:GetItem",
          "dynamodb:PutItem",
          "dynamodb:UpdateItem",
          "dynamodb:DeleteItem",
          "dynamodb:Scan",
          "dynamodb:Query"
        ]
        Effect   = "Allow"
        Resource = "arn:aws:dynamodb:${var.lambda_functions[each.key].dynamodb_config.region}:*:table/${var.lambda_functions[each.key].dynamodb_config.table_name}"
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "dynamodb_access" {
  for_each = local.lambda_with_dynamodb

  role       = aws_iam_role.lambda_role[each.key].name
  policy_arn = aws_iam_policy.dynamodb_access[each.key].arn
}

# SES access for Lambda functions that need to send emails
resource "aws_iam_policy" "ses_access" {
  for_each = local.lambda_with_ses

  name = "${var.lambda_functions[each.key].name}-ses-policy"
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = [
          "ses:SendEmail",
          "ses:SendRawEmail"
        ]
        Effect   = "Allow"
        Resource = "*" # Consider restricting to specific identities if possible
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "ses_access" {
  for_each = local.lambda_with_ses

  role       = aws_iam_role.lambda_role[each.key].name
  policy_arn = aws_iam_policy.ses_access[each.key].arn
}

# Cognito access for Lambda functions that need to interact with Cognito User Pools
resource "aws_iam_policy" "cognito_access" {
  for_each = local.lambda_with_cognito

  name        = "${var.lambda_functions[each.key].name}-cognito-policy"
  description = "Policy for Lambda functions to access Cognito User Pools"

  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Effect = "Allow",
        Action = [
          "cognito-idp:AdminCreateUser",
          "cognito-idp:AdminGetUser",
          "cognito-idp:ListUsers",
          "cognito-idp:AdminDeleteUser",
          "cognito-idp:AdminUpdateUserAttributes",
          "cognito-idp:AdminAddUserToGroup",
          "cognito-idp:AdminRemoveUserFromGroup",
          "cognito-idp:AdminListGroupsForUser"
        ],
        Resource = "arn:aws:cognito-idp:${var.lambda_functions[each.key].cognito_config.region}:*:userpool/${var.lambda_functions[each.key].cognito_config.user_pool_id}"
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "cognito_access" {
  for_each = local.lambda_with_cognito

  role       = aws_iam_role.lambda_role[each.key].name
  policy_arn = aws_iam_policy.cognito_access[each.key].arn
}

# Secrets Manager access for Lambda functions
resource "aws_iam_policy" "secrets_manager_access" {
  for_each = local.lambda_with_sftp

  name = "${var.lambda_functions[each.key].name}-secrets-policy"
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = [
          "secretsmanager:GetSecretValue",
          "secretsmanager:DescribeSecret"
        ]
        Effect   = "Allow"
        Resource = "*" # Consider restricting to specific secrets if possible
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "secrets_manager_access" {
  for_each = local.lambda_with_sftp

  role       = aws_iam_role.lambda_role[each.key].name
  policy_arn = aws_iam_policy.secrets_manager_access[each.key].arn
}

# Add EC2 permissions for Lambda functions that need to connect to SFTP servers
resource "aws_iam_policy" "ec2_network_access" {
  for_each = local.lambda_with_sftp

  name = "${var.lambda_functions[each.key].name}-ec2-network-policy"
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = [
          "ec2:CreateNetworkInterface",
          "ec2:DescribeNetworkInterfaces",
          "ec2:DeleteNetworkInterface",
          "ec2:AssignPrivateIpAddresses",
          "ec2:UnassignPrivateIpAddresses"
        ]
        Effect   = "Allow"
        Resource = "*"
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "ec2_network_access" {
  for_each = local.lambda_with_sftp

  role       = aws_iam_role.lambda_role[each.key].name
  policy_arn = aws_iam_policy.ec2_network_access[each.key].arn
}