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