provider "aws" {
  alias  = "us-east-1"
  region = "us-east-1"
}

# ACM Certificate (must be in us-east-1 for CloudFront)
resource "aws_acm_certificate" "cert" {
  provider          = aws.us-east-1
  domain_name       = "*.${var.certificate_domain}"
  validation_method = "DNS"

  lifecycle {
    create_before_destroy = true
  }

  tags = {
    Name = "CloudFront Certificate"
  }
}

# Certificate validation resource
resource "aws_acm_certificate_validation" "cert_validation" {
  provider                = aws.us-east-1
  certificate_arn         = aws_acm_certificate.cert.arn
  validation_record_fqdns = [for record in aws_route53_record.cert_validation : record.fqdn]
}