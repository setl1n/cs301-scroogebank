#--------------------------------------------------------------
# ALB Module Outputs
#--------------------------------------------------------------

output "alb_id" {
  description = "ID of the ALB"
  value       = aws_alb.main.id
}

output "alb_arn" {
  description = "ARN of the ALB"
  value       = aws_alb.main.arn
}

output "alb_dns_name" {
  description = "DNS name of the ALB"
  value       = aws_alb.main.dns_name
}

output "alb_zone_id" {
  description = "Zone ID of the ALB"
  value       = aws_alb.main.zone_id
}

output "http_listener_arn" {
  description = "ARN of the HTTP listener"
  value       = aws_alb_listener.alb_http_listener.arn
}

output "https_listener_arn" {
  description = "ARN of the HTTPS listener"
  value       = aws_alb_listener.alb_https_listener.arn
}

output "alb_dns_record" {
  description = "DNS record for the ALB"
  value       = aws_route53_record.alb.fqdn
}
