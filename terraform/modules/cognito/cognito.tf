#########################
# Cognito User Pool
#########################
resource "aws_cognito_user_pool" "user_pool" {
  name = var.user_pool_name

  auto_verified_attributes = ["email"]

  password_policy {
    minimum_length    = var.password_min_length
    require_lowercase = var.password_require_lowercase
    require_uppercase = var.password_require_uppercase
    require_numbers   = var.password_require_numbers
    require_symbols   = var.password_require_symbols
  }

  mfa_configuration = var.mfa_configuration
}

#########################
# Cognito User Pool Client
#########################
resource "aws_cognito_user_pool_client" "user_pool_client" {
  name         = var.user_pool_client_name
  user_pool_id = aws_cognito_user_pool.user_pool.id

  # Generate a secret for backend authentication
  generate_secret = true

  allowed_oauth_flows  = ["code"]
  allowed_oauth_scopes = ["email", "openid", "profile"]

  callback_urls                = var.callback_urls
  logout_urls                  = var.logout_urls
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
  domain       = var.cognito_domain
  user_pool_id = aws_cognito_user_pool.user_pool.id
}

#########################
# Cognito User Groups
#########################
resource "aws_cognito_user_group" "admin_group" {
  user_pool_id = aws_cognito_user_pool.user_pool.id
  name         = "ADMIN"
  precedence   = 0
  description  = "Administrator group with highest privileges"
}

resource "aws_cognito_user_group" "agent_group" {
  user_pool_id = aws_cognito_user_pool.user_pool.id
  name         = "AGENT"
  precedence   = 1
  description  = "Agent group with standard access"
}