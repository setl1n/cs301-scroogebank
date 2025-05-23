#--------------------------------------------------------------
# AWS COGNITO USER POOL
# The main user directory that stores user accounts and handles
# authentication, account confirmation, and password recovery
#--------------------------------------------------------------

# Get current AWS account ID for resource ARNs
data "aws_caller_identity" "current" {}

resource "aws_cognito_user_pool" "user_pool" {
  name = var.user_pool_name

  auto_verified_attributes = ["email"]

  admin_create_user_config {
    allow_admin_create_user_only = true
  }

  # // to map to user schema role...
  # schema {
  #   name                = "role"
  #   attribute_data_type = "String"
  #   developer_only_attribute = false
  #   mutable             = false
  #   required            = false

  #   // have to specify for some reason -- found on forum
  #   string_attribute_constraints {
  #     min_length = 0
  #     max_length = 2048
  #   }
  # }

  password_policy {
    minimum_length    = var.password_min_length
    require_lowercase = var.password_require_lowercase
    require_uppercase = var.password_require_uppercase
    require_numbers   = var.password_require_numbers
    require_symbols   = var.password_require_symbols
  }

  mfa_configuration = var.mfa_configuration

  # Email configuration - use Cognito's default email sender
  email_configuration {
    email_sending_account = "COGNITO_DEFAULT"
  }

  # Enable TOTP MFA (authenticator apps like Google Authenticator)
  software_token_mfa_configuration {
    enabled = true
  }

  # Custom messages for various verification steps
  verification_message_template {
    default_email_option = "CONFIRM_WITH_CODE"
    email_subject = "Your verification code"
    email_message = "Your verification code is {####}. This code will expire in 24 hours."
  }
  
  # Custom messages for MFA
  sms_authentication_message = "Your authentication code is {####}."
  sms_verification_message = "Your verification code is {####}."
}

#--------------------------------------------------------------
# AWS COGNITO USER POOL CLIENT FOR BACKEND
# Defines the app that will use this Cognito User Pool for
# authentication, including OAuth settings and callback URLs
# This client is for confidential clients (backends) that can
# securely store a client secret
#--------------------------------------------------------------
resource "aws_cognito_user_pool_client" "user_pool_client" {
  name         = var.user_pool_client_name
  user_pool_id = aws_cognito_user_pool.user_pool.id

  generate_secret = true

  allowed_oauth_flows                  = ["code"]
  allowed_oauth_scopes                 = ["email", "openid", "profile"]
  allowed_oauth_flows_user_pool_client = true


  # Use compact() to remove any empty strings if custom_domain is not provided
  callback_urls = distinct(concat(
    compact([
      var.custom_domain != "" ? "https://${var.custom_domain}/oauth2/idpresponse" : "",
      var.custom_domain != "" ? "https://${var.custom_domain}/login/oauth2/code/cognito" : "",
      var.frontend_domain != "" ? "https://${var.frontend_domain}/oauth2/idpresponse" : "",
      var.frontend_domain != "" ? "https://${var.frontend_domain}/login/oauth2/code/cognito" : ""
    ]),
    var.enable_local_development ? flatten([
      for port in var.local_development_ports : [
        "http://localhost:${port}/oauth2/idpresponse",
        "http://localhost:${port}/login/oauth2/code/cognito"
      ]
    ]) : []
  ))

  logout_urls = distinct(concat(
    compact([
      "https://${var.alb_dns_name}/login",
      var.custom_domain != "" ? "https://${var.custom_domain}/login" : "",
      var.frontend_domain != "" ? "https://${var.frontend_domain}/login" : ""
    ]),
    var.enable_local_development ? [
      for port in var.local_development_ports : "http://localhost:${port}/login"
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
# AWS COGNITO USER POOL CLIENT FOR FRONTEND SPA
# A separate client for the frontend SPA that doesn't require
# a client secret since public clients cannot securely store secrets
#--------------------------------------------------------------
resource "aws_cognito_user_pool_client" "spa_client" {
  name         = "${var.user_pool_client_name}-spa"
  user_pool_id = aws_cognito_user_pool.user_pool.id

  generate_secret = false

  allowed_oauth_flows                  = ["implicit", "code"]
  allowed_oauth_scopes                 = ["email", "openid", "profile"]
  allowed_oauth_flows_user_pool_client = true

  # SPA callback and logout URLs
  callback_urls = distinct(concat(
    compact([
      var.custom_domain != "" ? "https://${var.custom_domain}" : "",
      var.custom_domain != "" ? "https://${var.custom_domain}/login/oauth2/code/cognito" : "",
      var.frontend_domain != "" ? "https://${var.frontend_domain}" : "",
      var.frontend_domain != "" ? "https://${var.frontend_domain}/login/oauth2/code/cognito" : ""
    ]),
    var.enable_local_development ? flatten([
      for port in var.local_development_ports : [
        "http://localhost:${port}",
        "http://localhost:${port}/login/oauth2/code/cognito"
      ]
    ]) : []
  ))

  logout_urls = distinct(concat(
    compact([
      var.custom_domain != "" ? "https://${var.custom_domain}" : "",
      var.custom_domain != "" ? "https://${var.custom_domain}/login" : "",
      var.frontend_domain != "" ? "https://${var.frontend_domain}" : "",
      var.frontend_domain != "" ? "https://${var.frontend_domain}/login" : ""
    ]),
    var.enable_local_development ? [
      for port in var.local_development_ports : "http://localhost:${port}"
    ] : []
  ))

  supported_identity_providers = ["COGNITO"]

  explicit_auth_flows = [
    "ALLOW_USER_SRP_AUTH",
    "ALLOW_REFRESH_TOKEN_AUTH",
    "ALLOW_CUSTOM_AUTH"
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