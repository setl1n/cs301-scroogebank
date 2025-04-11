#--------------------------------------------------------------
# AWS COGNITO USER POOL
# The main user directory that stores user accounts and handles
# authentication, account confirmation, and password recovery
#--------------------------------------------------------------
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

#--------------------------------------------------------------
# AWS COGNITO USER POOL CLIENT
# Defines the app that will use this Cognito User Pool for
# authentication, including OAuth settings and callback URLs
#--------------------------------------------------------------
resource "aws_cognito_user_pool_client" "user_pool_client" {
  name         = var.user_pool_client_name
  user_pool_id = aws_cognito_user_pool.user_pool.id

  # Generate a secret for backend authentication
  generate_secret = true

  allowed_oauth_flows  = ["code"]
  allowed_oauth_scopes = ["email", "openid", "profile"]

  # Use compact() to remove any empty strings if custom_domain is not provided
  callback_urls = distinct(concat(
    compact([
      "https://${var.alb_dns_name}/oauth2/idpresponse",
      "https://${var.alb_dns_name}/login/oauth2/code/cognito",
      var.custom_domain != "" ? "https://${var.custom_domain}/oauth2/idpresponse" : "",
      var.custom_domain != "" ? "https://${var.custom_domain}/login/oauth2/code/cognito" : ""
    ]),
    var.callback_urls,
    var.enable_local_development ? flatten([
      for port in var.local_development_ports : [
        "http://localhost:${port}/oauth2/idpresponse",
        "http://localhost:${port}/login/oauth2/code/cognito"
      ]
    ]) : []
  ))

  logout_urls = distinct(concat(
    compact([
      "https://${var.alb_dns_name}/logout",
      var.custom_domain != "" ? "https://${var.custom_domain}/logout" : ""
    ]),
    var.logout_urls,
    var.enable_local_development ? [
      for port in var.local_development_ports : "http://localhost:${port}/logout"
    ] : []
  ))

  supported_identity_providers = ["COGNITO"]

  explicit_auth_flows = [
    "ALLOW_USER_SRP_AUTH",
    "ALLOW_REFRESH_TOKEN_AUTH",
    "ALLOW_ADMIN_USER_PASSWORD_AUTH"
  ]
}

#--------------------------------------------------------------
# AWS COGNITO USER POOL DOMAIN
# Creates a domain for the Cognito hosted UI where users will
# sign in through the default authentication screens
#--------------------------------------------------------------
resource "aws_cognito_user_pool_domain" "user_pool_domain" {
  domain       = var.cognito_domain
  user_pool_id = aws_cognito_user_pool.user_pool.id
}

#--------------------------------------------------------------
# AWS COGNITO USER GROUPS
# Define permission groups for different user roles with
# different levels of access to the application
#--------------------------------------------------------------
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