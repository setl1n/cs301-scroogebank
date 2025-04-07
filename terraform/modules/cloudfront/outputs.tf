# ---------------------------------------------------------------------------------------------------------------------
# Module outputs - These values can be used by other modules or the root module
# ---------------------------------------------------------------------------------------------------------------------

# CloudFront distribution IDs are used for invalidations and other CloudFront API operations
output "distribution_ids" {
  description = "Map of CloudFront distribution IDs keyed by configuration name"
  value = {
    for k, v in aws_cloudfront_distribution.s3_distribution : k => v.id
  }
}

# Distribution domains can be used for CNAME records or for direct access to the distributions
output "distribution_domains" {
  description = "Map of CloudFront distribution domain names keyed by configuration name"
  value = {
    for k, v in aws_cloudfront_distribution.s3_distribution : k => v.domain_name
  }
}

# Certificate ARN may be needed for other resources that require SSL certificates
output "certificate_arn" {
  description = "ARN of the ACM certificate used by CloudFront distributions"
  value       = module.acm.us_certificate_arn
}

# WAF ACL ARN may be needed for monitoring or to attach to other resources
output "waf_acl_arn" {
  description = "ARN of the WAF Web ACL protecting the CloudFront distributions"
  value       = aws_wafv2_web_acl.waf_acl.arn
}