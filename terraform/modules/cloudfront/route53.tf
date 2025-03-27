# ---------------------------------------------------------------------------------------------------------------------
# Route53 DNS configuration for CloudFront and certificate validation
# ---------------------------------------------------------------------------------------------------------------------

# Get Route53 hosted zone data for DNS record management
# This data source retrieves information about an existing hosted zone
data "aws_route53_zone" "zone" {
  zone_id = var.route53_zone_id
}

# Certificate validation DNS records
# These CNAME records are created automatically based on the ACM certificate validation options
# They prove domain ownership to AWS Certificate Manager
resource "aws_route53_record" "cert_validation" {
  for_each = {
    for dvo in aws_acm_certificate.cert.domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      record = dvo.resource_record_value
      type   = dvo.resource_record_type
    }
  }

  zone_id = var.route53_zone_id
  name    = each.value.name
  type    = each.value.type
  records = [each.value.record]
  ttl     = 60
}

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