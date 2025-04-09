output "us_certificate_arn" {
  description = "The ARN of the us-east-1 certificate"
  value       = aws_acm_certificate.us_cert.arn
}

output "ap_certificate_arn" {
  description = "The ARN of the ap-southeast-1 certificate"
  value       = aws_acm_certificate.ap_cert.arn
}

output "us_certificate_validation_id" {
  description = "The ID of the us-east-1 certificate validation"
  value       = aws_acm_certificate_validation.us_cert_validation.id
}

output "ap_certificate_validation_id" {
  description = "The ID of the ap-southeast-1 certificate validation"
  value       = aws_acm_certificate_validation.ap_cert_validation.id
}

output "us_certificate_validation_records" {
  description = "The us-east-1 certificate validation records created in Route53"
  value       = aws_route53_record.us_cert_validation
}

output "ap_certificate_validation_records" {
  description = "The ap-southeast-1 certificate validation records created in Route53"
  value       = aws_route53_record.ap_cert_validation
}

output "certificate_domain" {
  description = "The domain name for the certificate"
  value       = var.certificate_domain
}
