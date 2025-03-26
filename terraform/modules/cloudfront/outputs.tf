output "distribution_ids" {
  description = "Map of CloudFront distribution IDs keyed by configuration name"
  value = {
    for k, v in aws_cloudfront_distribution.s3_distribution : k => v.id
  }
}

output "distribution_domains" {
  description = "Map of CloudFront distribution domain names keyed by configuration name"
  value = {
    for k, v in aws_cloudfront_distribution.s3_distribution : k => v.domain_name
  }
}

output "certificate_arn" {
  description = "ARN of the ACM certificate used by CloudFront distributions"
  value       = aws_acm_certificate.cert.arn
}

output "waf_acl_arn" {
  description = "ARN of the WAF Web ACL protecting the CloudFront distributions"
  value       = aws_wafv2_web_acl.waf_acl.arn
}