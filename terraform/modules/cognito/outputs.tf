#----------------------------------------
# Cognito Output Values
# Exposes Cognito resources for use in other modules
#----------------------------------------

#----------------------------------------
# User Pool Identifiers
# Core IDs and ARNs for the Cognito User Pool
#----------------------------------------
output "user_pool_id" {
  description = "The ID of the Cognito User Pool"
  value       = aws_cognito_user_pool.user_pool.id
}

output "user_pool_arn" {
  description = "The ARN of the Cognito User Pool"
  value       = aws_cognito_user_pool.user_pool.arn
}

#----------------------------------------
# Client Application Access
# Credentials for client applications to authenticate with Cognito
#----------------------------------------
output "user_pool_client_id" {
  description = "The Client ID of the Cognito User Pool Client"
  value       = aws_cognito_user_pool_client.user_pool_client.id
}

output "user_pool_client_secret" {
  description = "The Client Secret of the Cognito User Pool Client"
  value       = aws_cognito_user_pool_client.user_pool_client.client_secret
  sensitive   = true
}

output "spa_client_id" {
  description = "The Client ID of the Cognito User Pool Client for SPA (no secret)"
  value       = aws_cognito_user_pool_client.spa_client.id
}

#----------------------------------------
# Hosted UI Configuration
# URLs and endpoints for the Cognito Hosted UI
#----------------------------------------
output "user_pool_domain" {
  description = "The domain for the Cognito User Pool"
  value       = aws_cognito_user_pool_domain.user_pool_domain.domain
}

output "hosted_ui_url" {
  description = "URL for the Cognito Hosted UI login page"
  value       = "https://${aws_cognito_user_pool_domain.user_pool_domain.domain}.auth.${var.aws_region}.amazoncognito.com/login"
}

#----------------------------------------
# JWT Verification
# Endpoints for verifying JWT tokens issued by Cognito
#----------------------------------------
output "jwks_url" {
  description = "The JWKS URL for verifying JWT tokens"
  value       = "https://cognito-idp.${var.aws_region}.amazonaws.com/${aws_cognito_user_pool.user_pool.id}/.well-known/jwks.json"
}

output "issuer_url" {
  description = "The issuer URL for the Cognito User Pool (for JWT verification)"
  value       = "https://cognito-idp.${var.aws_region}.amazonaws.com/${aws_cognito_user_pool.user_pool.id}"
}

#----------------------------------------
# User Groups
# Names of the predefined user groups
#----------------------------------------
output "admin_group_name" {
  description = "Name of the admin user group"
  value       = aws_cognito_user_group.admin_group.name
}

output "agent_group_name" {
  description = "Name of the agent user group"
  value       = aws_cognito_user_group.agent_group.name
}