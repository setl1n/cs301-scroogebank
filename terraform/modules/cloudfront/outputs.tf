output "distribution_ids" {
  description = "Map of CloudFront distribution IDs"
  value = {
    for k, v in aws_cloudfront_distribution.s3_distribution : k => v.id
  }
}

output "distribution_domains" {
  description = "Map of CloudFront distribution domain names"
  value = {
    for k, v in aws_cloudfront_distribution.s3_distribution : k => v.domain_name
  }
}

output "certificate_arn" {
  description = "The ARN of the certificate"
  value       = aws_acm_certificate.cert.arn
}