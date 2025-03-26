# ACM Certificate for CloudFront distributions
# Must be provisioned in us-east-1 region for use with CloudFront
resource "aws_acm_certificate" "cert" {
  provider          = aws.us-east-1
  domain_name       = "*.${var.certificate_domain}"
  validation_method = "DNS"

  lifecycle {
    create_before_destroy = true
  }

  tags = {
    Name = "cloudfront-certificate"
  }
}

# Certificate validation to ensure ACM certificate is validated before use
resource "aws_acm_certificate_validation" "cert_validation" {
  provider                = aws.us-east-1
  certificate_arn         = aws_acm_certificate.cert.arn
  validation_record_fqdns = [for record in aws_route53_record.cert_validation : record.fqdn]
}