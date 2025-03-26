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
  description = "ARN of the created ACM certificate"
  value       = var.create_certificate && length(aws_acm_certificate.cert) > 0 ? aws_acm_certificate.cert[0].arn : null
}

output "domain_names" {
  description = "Domain names being used for each distribution"
  value = {
    for key, value in var.s3_website_buckets : key => {
      domain_name = value.domain_name
      valid_domain = value.domain_name != null && value.domain_name != "" && (endswith(value.domain_name, var.certificate_domain) || value.domain_name == var.certificate_domain)
      aliases_check =( value.domain_name != null && 
                     value.domain_name != "" && 
                     var.create_certificate && 
                     length(aws_acm_certificate.cert) > 0 && 
                     length(aws_acm_certificate_validation.cert_validation) > 0)
    }
  }
}

output "certificate_domain" {
  description = "The domain name for which the certificate is issued"
  value       = var.certificate_domain
}

output "cloudfront_distributions" {
  description = "CloudFront distribution details"
  value = {
    for key, distribution in aws_cloudfront_distribution.s3_distribution : key => {
      id = distribution.id
      domain_name = distribution.domain_name
      aliases = distribution.aliases
    }
  }
}
