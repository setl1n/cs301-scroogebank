#--------------------------------------------------------------
# CS301 Group 2 Team 1 Project - Main Terraform Outputs
#
# This file defines the outputs from the Terraform configuration that
# can be used by other systems or in CI/CD pipelines.
#--------------------------------------------------------------

#--------------------------------------------------------------
# Cognito Outputs
# Authentication and identity management details
#--------------------------------------------------------------
output "cognito_user_pool_id" {
  description = "ID of the Cognito User Pool"
  value       = module.cognito.user_pool_id
}

output "cognito_backend_client_id" {
  description = "Client ID for backend applications (with client secret)"
  value       = module.cognito.user_pool_client_id
}

output "cognito_spa_client_id" {
  description = "Client ID for frontend SPA (without client secret)"
  value       = module.cognito.spa_client_id
}

output "cognito_domain" {
  description = "Cognito domain for hosted UI login"
  value       = module.cognito.user_pool_domain
}

output "cognito_hosted_ui_url" {
  description = "URL for the Cognito hosted UI login"
  value       = module.cognito.hosted_ui_url
}

#--------------------------------------------------------------
# API Gateway and ALB Outputs
# Endpoint information for API access
#--------------------------------------------------------------
output "alb_dns_name" {
  description = "DNS name of the load balancer"
  value       = module.alb.alb_dns_name
}

#--------------------------------------------------------------
# Database Outputs
# Database endpoint information
#--------------------------------------------------------------
output "database_endpoints" {
  description = "Endpoints for the databases"
  value       = module.rds.db_endpoints
} 