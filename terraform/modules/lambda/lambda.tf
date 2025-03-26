#----------------------------------------
# Lambda Functions
#----------------------------------------
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
      } : {}
    )
  }
}

#----------------------------------------
# IAM Policies
#----------------------------------------
# Create locals to filter Lambda functions with specific configurations
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
}

# Create role for Lambda functions
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

# Attach policies based on what services each Lambda needs
resource "aws_iam_role_policy_attachment" "lambda_basic_execution" {
  for_each = var.lambda_functions

  role       = aws_iam_role.lambda_role[each.key].name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

# VPC access for Lambda functions that need it
resource "aws_iam_role_policy_attachment" "lambda_vpc_access" {
  for_each = local.lambda_with_rds

  role       = aws_iam_role.lambda_role[each.key].name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaVPCAccessExecutionRole"
}

# DynamoDB access for Lambda functions that need it
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
        Resource = "arn:aws:dynamodb:*:*:table/${var.lambda_functions[each.key].dynamodb_config.table_name}"
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "dynamodb_access" {
  for_each = local.lambda_with_dynamodb

  role       = aws_iam_role.lambda_role[each.key].name
  policy_arn = aws_iam_policy.dynamodb_access[each.key].arn
}

# SES access for Lambda functions that need it
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
        Resource = "*"
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "ses_access" {
  for_each = local.lambda_with_ses

  role       = aws_iam_role.lambda_role[each.key].name
  policy_arn = aws_iam_policy.ses_access[each.key].arn
}
