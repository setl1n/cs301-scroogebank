#--------------------------------------------------------------
# Route53 DNS Configuration for ACM Certificate Validation
# This file manages DNS records needed to validate ACM certificates
#--------------------------------------------------------------

#--------------------------------------------------------------
# Route53 Hosted Zone
# Reference to existing DNS zone where validation records will be created
#--------------------------------------------------------------
data "aws_route53_zone" "zone" {
  zone_id = var.route53_zone_id
}

#--------------------------------------------------------------
# US East Region Certificate Validation Records
# Creates DNS records required to validate the CloudFront certificate
#--------------------------------------------------------------
resource "aws_route53_record" "us_cert_validation" {
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
  zone_id         = var.route53_zone_id
}

#--------------------------------------------------------------
# AP Southeast Region Certificate Validation Records
# Creates DNS records required to validate the ALB certificate
#--------------------------------------------------------------
resource "aws_route53_record" "ap_cert_validation" {
  for_each = {
    for dvo in aws_acm_certificate.ap_cert.domain_validation_options : dvo.domain_name => {
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
  zone_id         = var.route53_zone_id
}