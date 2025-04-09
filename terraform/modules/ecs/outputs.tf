# Output variables exposed by this module
# This hostname can be used to access the application via a web browser or API calls
output "users_alb_hostname" {
  value = "${aws_alb.main.dns_name}:3000"
}