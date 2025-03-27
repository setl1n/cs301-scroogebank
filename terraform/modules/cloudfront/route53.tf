# ---------------------------------------------------------------------------------------------------------------------
# Route53 DNS configuration for CloudFront distributions
# Certificate validation has been moved to the acm_route53 module
# ---------------------------------------------------------------------------------------------------------------------

# DNS records pointing to CloudFront distributions
# These alias records map your custom domain names to the CloudFront distribution domains
# The special CloudFront zone ID "Z2FDTNDATAQYW2" is required for all CloudFront aliases
resource "aws_route53_record" "cloudfront_records" {
  for_each = var.s3_website_buckets

  zone_id = var.route53_zone_id
  name    = each.value.domain_name
  type    = "A"

  alias {
    name                   = aws_cloudfront_distribution.s3_distribution[each.key].domain_name
    zone_id                = "Z2FDTNDATAQYW2" # Fixed CloudFront hosted zone ID
    evaluate_target_health = false
  }
}