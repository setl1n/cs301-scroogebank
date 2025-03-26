# ACM Certificate for CloudFront distributions
# AWS Certificate Manager (ACM) provides SSL/TLS certificates for use with AWS services
# CloudFront requires certificates to be created in the us-east-1 region regardless of your application's region
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
# DNS validation creates DNS records in Route53 to prove domain ownership
# This validation must complete successfully before the certificate can be used with CloudFront
resource "aws_acm_certificate_validation" "cert_validation" {
  provider                = aws.us-east-1
  certificate_arn         = aws_acm_certificate.cert.arn
  validation_record_fqdns = [for record in aws_route53_record.cert_validation : record.fqdn]
}