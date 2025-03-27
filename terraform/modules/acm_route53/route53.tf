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
    for dvo in aws_acm_certificate.us_cert.domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      record = dvo.resource_record_value
      type   = dvo.resource_record_type
    }
  }

  allow_overwrite = true
  name            = each.value.name
  records         = [each.value.record]
  ttl             = 60
  type            = each.value.type
  zone_id         = data.aws_route53_zone.zone.zone_id
}
