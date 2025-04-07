#==============================================================================
# Lambda IAM Roles and Policies
#
# This file defines all IAM roles and policies needed for Lambda functions
# to access different AWS services (RDS, DynamoDB, SES, SQS, etc.)
#==============================================================================

#------------------------------------------------------------------------------
# Base Lambda Execution Role
# Creates the fundamental IAM role for each Lambda function
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
#------------------------------------------------------------------------------
# Allows Lambda to write logs to CloudWatch
resource "aws_iam_role_policy_attachment" "lambda_basic" {
  for_each = var.lambda_functions

  role       = aws_iam_role.lambda_role[each.key].name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

# Allows Lambda to connect to VPC resources
resource "aws_iam_role_policy_attachment" "lambda_vpc" {
  for_each = var.lambda_functions

  role       = aws_iam_role.lambda_role[each.key].name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaVPCAccessExecutionRole"
}

#------------------------------------------------------------------------------
# SFTP Access Permissions
# For Lambda functions that need to interact with SFTP servers
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
#------------------------------------------------------------------------------
resource "aws_iam_policy" "lambda_sqs_policy" {
  # Create only for functions that have sqs_enabled flag set to true and sqs_config defined
  for_each = {
    for name, config in var.lambda_functions : name => config
    if lookup(config, "sqs_enabled", false) == true &&
    lookup(config, "sqs_config", null) != null
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
    if lookup(config, "sqs_enabled", false) == true &&
    lookup(config, "sqs_config", null) != null
  }

  role       = aws_iam_role.lambda_role[each.key].name
  policy_arn = aws_iam_policy.lambda_sqs_policy[each.key].arn
}