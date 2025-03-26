# Get Route53 zone data
data "aws_route53_zone" "zone" {
  zone_id = var.route53_zone_id
}

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