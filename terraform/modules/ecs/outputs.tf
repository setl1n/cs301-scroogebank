#----------------------------------------
# Output Variables
# Exposes important values from this module for use elsewhere
#----------------------------------------

#----------------------------------------
# ALB Hostname
# This hostname can be used to access the application via a web browser or API calls
#----------------------------------------
output "users_alb_hostname" {
  value = "${aws_alb.main.dns_name}:3000"
}

#----------------------------------------
# ALB DNS Name
# For Cognito to dynamically set the callback and signout URLs
#----------------------------------------
output "alb_dns_name" {
  description = "The DNS name of the application load balancer"
  value       = aws_alb.main.dns_name
}

#----------------------------------------
# Cognito Authentication URLs
# Endpoints for authentication flows and callbacks
#----------------------------------------
output "alb_callback_url" {
  description = "The callback URL for Cognito authentication"
  value       = "https://${aws_alb.main.dns_name}/oauth2/idpresponse" # CHANGED: Using ALB's default callback path
}

output "alb_callback_url_custom" {
  description = "Custom callback URL for Cognito authentication (if using Route53)"
  value       = "https://${aws_route53_record.alb.fqdn}/login/oauth2/code/cognito"
}

output "alb_logout_url" {
  description = "The logout URL for Cognito authentication"
  value       = "https://${aws_route53_record.alb.fqdn}/logout"
}