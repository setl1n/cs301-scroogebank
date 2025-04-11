#==============================================================================
# Lambda IAM Roles and Policies
#
# This file defines all IAM roles and policies needed for Lambda functions
# to access different AWS services (RDS, DynamoDB, SES, SQS, etc.)
#
# The module uses dynamic resource creation based on function configuration:
# - Each Lambda function gets its own execution role
# - Policies are attached only when the corresponding service is enabled
# - Policy permissions are scoped to the minimum required for each service
#==============================================================================

#------------------------------------------------------------------------------
# Base Lambda Execution Role
# Creates the fundamental IAM role for each Lambda function
#
# This role establishes the trust relationship that allows AWS Lambda service
# to assume this role when executing the function code.
#------------------------------------------------------------------------------
resource "aws_iam_role" "lambda_role" {
  for_each = var.lambda_functions

  name = "lambda-execution-role-${each.value.name}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = {
        Service = "lambda.amazonaws.com"
      }
    }]
  })
}

#------------------------------------------------------------------------------
# Base Lambda Permissions
# These permissions are required for all Lambda functions
#
# These policies provide the minimum permissions needed for Lambda to function:
# - CloudWatch Logs access for function logging
# - VPC access for functions that need to connect to VPC resources
#------------------------------------------------------------------------------
# Allows Lambda to write logs to CloudWatch
# Without this, function logs would not appear in CloudWatch Logs
resource "aws_iam_role_policy_attachment" "lambda_basic" {
  for_each = var.lambda_functions

  role       = aws_iam_role.lambda_role[each.key].name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

# Allows Lambda to connect to VPC resources
# Required for functions that need access to resources in a VPC (like RDS)
resource "aws_iam_role_policy_attachment" "lambda_vpc" {
  for_each = var.lambda_functions

  role       = aws_iam_role.lambda_role[each.key].name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaVPCAccessExecutionRole"
}

#------------------------------------------------------------------------------
# SFTP Access Permissions
# For Lambda functions that need to interact with SFTP servers
#
# These permissions allow Lambda functions to:
# - Access S3 for storing/retrieving files
# - Query EC2 instances (which may be running SFTP servers)
#------------------------------------------------------------------------------
resource "aws_iam_policy" "lambda_sftp_policy" {
  # Create only for functions that have sftp_enabled flag set to true
  for_each = {
    for name, config in var.lambda_functions : name => config
    if lookup(config, "sftp_enabled", false) == true
  }

  name        = "lambda-sftp-policy-${each.value.name}"
  description = "Policy to allow Lambda function ${each.value.name} to access the SFTP server"

  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Action   = ["s3:GetObject", "s3:PutObject"],
        Effect   = "Allow",
        Resource = "*"
      },
      {
        Action   = ["ec2:DescribeInstances"],
        Effect   = "Allow",
        Resource = "*"
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "lambda_sftp" {
  for_each = {
    for name, config in var.lambda_functions : name => config
    if lookup(config, "sftp_enabled", false) == true
  }

  role       = aws_iam_role.lambda_role[each.key].name
  policy_arn = aws_iam_policy.lambda_sftp_policy[each.key].arn
}

#------------------------------------------------------------------------------
# DynamoDB Access Permissions
# For Lambda functions that need to interact with DynamoDB tables
#
# Provides CRUD operations on specific DynamoDB tables.
# The permissions are scoped to only the tables needed by each function.
#------------------------------------------------------------------------------
resource "aws_iam_policy" "dynamodb_access" {
  # Create only for functions that have dynamodb_enabled flag set to true
  for_each = {
    for name, config in var.lambda_functions : name => config
    if lookup(config, "dynamodb_enabled", false) == true
  }

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
        Resource = "arn:aws:dynamodb:*:*:table/${var.lambda_functions[each.key].dynamodb_config.table_name}"
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "dynamodb_access" {
  for_each = {
    for name, config in var.lambda_functions : name => config
    if lookup(config, "dynamodb_enabled", false) == true
  }

  role       = aws_iam_role.lambda_role[each.key].name
  policy_arn = aws_iam_policy.dynamodb_access[each.key].arn
}

#------------------------------------------------------------------------------
# SES Access Permissions
# For Lambda functions that need to send emails via SES
#
# These permissions allow the function to send both formatted and raw emails.
# Consider restricting to specific email identities in production environments.
#------------------------------------------------------------------------------
resource "aws_iam_policy" "ses_access" {
  # Create only for functions that have ses_enabled flag set to true
  for_each = {
    for name, config in var.lambda_functions : name => config
    if lookup(config, "ses_enabled", false) == true
  }

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
        Resource = "*"
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "ses_access" {
  for_each = {
    for name, config in var.lambda_functions : name => config
    if lookup(config, "ses_enabled", false) == true
  }

  role       = aws_iam_role.lambda_role[each.key].name
  policy_arn = aws_iam_policy.ses_access[each.key].arn
}

#------------------------------------------------------------------------------
# SQS Access Permissions
# For Lambda functions that need to process messages from SQS queues
#
# Provides the exact permissions needed for Lambda to:
# - Pull messages from queues
# - Delete processed messages
# - Manage visibility timeout
#------------------------------------------------------------------------------
resource "aws_iam_policy" "lambda_sqs_policy" {
  # Create only for functions that have sqs_enabled flag set to true and sqs_config defined
  for_each = {
    for name, config in var.lambda_functions : name => config
    if lookup(config, "sqs_enabled", false) == true
  }

  name        = "lambda-sqs-policy-${each.key}"
  description = "IAM policy for Lambda function ${each.key} to access SQS"

  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Action = [
          "sqs:ReceiveMessage",
          "sqs:DeleteMessage",
          "sqs:GetQueueAttributes",
          "sqs:ChangeMessageVisibility"
        ],
        Effect   = "Allow",
        Resource = each.value.sqs_config.queue_arn
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "lambda_sqs" {
  for_each = {
    for name, config in var.lambda_functions : name => config
    if lookup(config, "sqs_enabled", false) == true
  }

  role       = aws_iam_role.lambda_role[each.key].name
  policy_arn = aws_iam_policy.lambda_sqs_policy[each.key].arn
}

#------------------------------------------------------------------------------
# Cognito Access Permissions
# For Lambda functions that need to interact with Cognito User Pools
#
# Enables user management operations such as:
# - Creating/retrieving/updating/deleting users
# - Managing user group memberships
# - Querying user information
#------------------------------------------------------------------------------
resource "aws_iam_policy" "cognito_access" {
  for_each = {
    for name, config in var.lambda_functions : name => config
    if lookup(config, "cognito_enabled", false) == true
  }

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
  for_each = {
    for name, config in var.lambda_functions : name => config
    if lookup(config, "cognito_enabled", false) == true &&
    lookup(config, "cognito_config", null) != null
  }

  role       = aws_iam_role.lambda_role[each.key].name
  policy_arn = aws_iam_policy.cognito_access[each.key].arn
}

#------------------------------------------------------------------------------
# Secrets Manager Access Permissions
# For Lambda functions that need to access secrets (passwords, keys, etc.)
#
# Currently scoped for SFTP functions but can be extended to other use cases.
# In production, consider restricting to specific secret ARNs for better security.
#------------------------------------------------------------------------------
resource "aws_iam_policy" "secrets_manager_access" {
  for_each = {
    for name, config in var.lambda_functions : name => name
    if lookup(config, "sftp_enabled", false) == true
  }

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
  for_each = {
    for name, config in var.lambda_functions : name => config
    if lookup(config, "sftp_enabled", false) == true
  }

  role       = aws_iam_role.lambda_role[each.key].name
  policy_arn = aws_iam_policy.secrets_manager_access[each.key].arn
}

#------------------------------------------------------------------------------
# S3 Access Permissions
# For Lambda functions that need to upload images or other content to S3 buckets
#
# These permissions allow Lambda functions to:
# - Upload files to S3 buckets (PutObject)
# - Retrieve files from S3 buckets (GetObject)
# - List bucket contents (ListBucket)
# - Generate pre-signed URLs
#------------------------------------------------------------------------------
resource "aws_iam_policy" "s3_access" {
  # Create only for functions that have s3_enabled flag set to true
  for_each = {
    for name, config in var.lambda_functions : name => config
    if lookup(config, "s3_enabled", false) == true
  }

  name        = "${var.lambda_functions[each.key].name}-s3-policy"
  description = "Policy for Lambda function ${each.key} to upload to and access S3 buckets"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = [
          "s3:PutObject",
          "s3:GetObject",
          "s3:ListBucket",
          "s3:DeleteObject"
        ]
        Effect   = "Allow"
        Resource = [
          "arn:aws:s3:::${lookup(each.value.s3_config, "s3_bucket_name", "*")}",
          "arn:aws:s3:::${lookup(each.value.s3_config, "s3_bucket_name", "*")}/*"
        ]
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "s3_access" {
  for_each = {
    for name, config in var.lambda_functions : name => config
    if lookup(config, "s3_enabled", false) == true
  }

  role       = aws_iam_role.lambda_role[each.key].name
  policy_arn = aws_iam_policy.s3_access[each.key].arn
}

#------------------------------------------------------------------------------
# EC2 Network Interface Permissions
# Required for Lambda functions running in a VPC or accessing EC2 resources
#
# These permissions allow Lambda to:
# - Create and manage ENIs (Elastic Network Interfaces)
# - Connect to resources within a VPC securely
#------------------------------------------------------------------------------
resource "aws_iam_policy" "ec2_network_access" {
  for_each = {
    for name, config in var.lambda_functions : name => config
    if lookup(config, "sftp_enabled", false) == true
  }

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
  for_each = {
    for name, config in var.lambda_functions : name => config
    if lookup(config, "sftp_enabled", false) == true
  }

  role       = aws_iam_role.lambda_role[each.key].name
  policy_arn = aws_iam_policy.ec2_network_access[each.key].arn
}