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

  allowed_oauth_flows       = ["code"]
  allowed_oauth_scopes      = ["email", "openid", "profile"]

  # Update with actual callback and logout url later, this for testing
  callback_urls             = ["http://localhost:8080/login/oauth2/code/cognito"]
  logout_urls               = ["http://localhost:8080/logout"]
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
  # hmm
  domain       = "cs301-g2-t1"
  user_pool_id = aws_cognito_user_pool.user_pool.id
}

#########################
# Cognito User Groups
#########################
resource "aws_cognito_user_group" "admin_group" {
  user_pool_id = aws_cognito_user_pool.user_pool.id
  name   = "Admin"
  precedence   = 0
}

resource "aws_cognito_user_group" "agent_group" {
  user_pool_id = aws_cognito_user_pool.user_pool.id
  name   = "Agent"
  precedence   = 1
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