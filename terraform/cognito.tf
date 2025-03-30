#########################
# Cognito User Pool
#########################
resource "aws_cognito_user_pool" "user_pool" {
  name = "CS301-G2-T1"

  auto_verified_attributes = ["email"]

  password_policy {
    minimum_length    = 8
    require_lowercase = true
    require_uppercase = true
    require_numbers   = true
    require_symbols   = false
  }

  # MFA configuration can be set to "OFF", "ON", or "OPTIONAL". I put as OFF for now
  mfa_configuration = "OFF"
}

#########################
# Cognito User Pool Client
#########################
resource "aws_cognito_user_pool_client" "user_pool_client" {
  name         = "CS301-G2-T1-AppClient"
  user_pool_id = aws_cognito_user_pool.user_pool.id

  # Generate a secret for backend authentication
  generate_secret = true

  allowed_oauth_flows  = ["code"]
  allowed_oauth_scopes = ["email", "openid", "profile"]

  # Update with actual callback and logout url later, this for testing
  callback_urls                = var.COGNITO_CALLBACK_URLS
  logout_urls                  = var.COGNITO_LOGOUT_URLS
  supported_identity_providers = ["COGNITO"]

  explicit_auth_flows = [
    "ALLOW_USER_SRP_AUTH",
    "ALLOW_REFRESH_TOKEN_AUTH",
    "ALLOW_ADMIN_USER_PASSWORD_AUTH"
  ]
}

#########################
# Cognito User Pool Domain
#########################
resource "aws_cognito_user_pool_domain" "user_pool_domain" {
  domain       = var.COGNITO_DOMAIN
  user_pool_id = aws_cognito_user_pool.user_pool.id
}

#########################
# Cognito User Groups
#########################
resource "aws_cognito_user_group" "admin_group" {
  user_pool_id = aws_cognito_user_pool.user_pool.id
  name         = "ADMIN"
  precedence   = 0
}

resource "aws_cognito_user_group" "agent_group" {
  user_pool_id = aws_cognito_user_pool.user_pool.id
  name         = "AGENT"
  precedence   = 1
}

#--------------------------------------------------------------
# IAM Policy for Cognito Access
#--------------------------------------------------------------

resource "aws_iam_policy" "cognito_access_policy" {
  name        = "cognito-access-policy"
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
        Resource = "arn:aws:cognito-idp:${var.aws_region}:*:userpool/${aws_cognito_user_pool.user_pool.id}"
      }
    ]
  })
}

#--------------------------------------------------------------
# Lambda Stuffs for Cognito to pass environment variables to
#--------------------------------------------------------------
resource "aws_lambda_function" "lambda_function" {
  for_each = var.lambda_functions

  function_name = each.value.name
  handler       = each.value.handler
  runtime       = each.value.runtime
  filename      = each.value.filename
  timeout       = each.value.timeout
  memory_size   = each.value.memory_size
  role          = aws_iam_role.lambda_role[each.key].arn

  environment {
    variables = merge(
      each.value.environment_variables,
      # Add Cognito environment variables if enabled
      each.value.cognito_enabled ? {
        COGNITO_USER_POOL_ID  = aws_cognito_user_pool.user_pool.id
        COGNITO_APP_CLIENT_ID = aws_cognito_user_pool_client.user_pool_client.id
        COGNITO_REGION        = var.aws_region
      } : {}
    )
  }
}

# IAM role for Lambda functions
resource "aws_iam_role" "lambda_role" {
  for_each = var.lambda_functions

  name = "${each.value.name}_role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
        Effect = "Allow"
        Sid    = ""
      }
    ]
  })
}

# Attach policies based on enabled services
resource "aws_iam_role_policy_attachment" "lambda_basic_execution" {
  for_each = var.lambda_functions

  role       = aws_iam_role.lambda_role[each.key].name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

# Attach Cognito policy if enabled
resource "aws_iam_role_policy_attachment" "cognito_policy_attachment" {
  for_each = {
    for k, v in var.lambda_functions : k => v
    if v.cognito_enabled == true
  }

  role       = aws_iam_role.lambda_role[each.key].name
  policy_arn = aws_iam_policy.cognito_access_policy.arn
}

#########################
# Outputs for Lambda Integration
#########################
output "cognito_user_pool_id" {
  description = "The ID of the Cognito User Pool"
  value       = aws_cognito_user_pool.user_pool.id
}

output "cognito_user_pool_client_id" {
  description = "The Client ID of the Cognito User Pool Client"
  value       = aws_cognito_user_pool_client.user_pool_client.id
}

output "cognito_user_pool_client_secret" {
  description = "The Client Secret of the Cognito User Pool Client"
  value       = aws_cognito_user_pool_client.user_pool_client.client_secret
  sensitive   = true
}

output "cognito_user_pool_domain" {
  description = "The domain for the Cognito User Pool"
  value       = aws_cognito_user_pool_domain.user_pool_domain.domain
}

output "cognito_jwks_url" {
  description = "The JWKS URL for verifying JWT tokens"
  value       = "https://cognito-idp.${var.aws_region}.amazonaws.com/${aws_cognito_user_pool.user_pool.id}/.well-known/jwks.json"
}