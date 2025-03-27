# ACM Certificate for CloudFront distributions
# AWS Certificate Manager (ACM) provides SSL/TLS certificates for use with AWS services
# CloudFront requires certificates to be created in the us-east-1 region regardless of your application's region
resource "aws_acm_certificate" "us_cert" {
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

# ACM Certificate for resources in ap-southeast-1 region
resource "aws_acm_certificate" "ap_cert" {
  provider                  = aws.ap-southeast-1
  domain_name       = var.certificate_domain
  subject_alternative_names = ["*.${var.certificate_domain}", "alb.${var.certificate_domain}"]
  validation_method = "DNS"

  lifecycle {
    create_before_destroy = true
  }

  tags = {
    Name = "ap-southeast-1-certificate"
  }
}

# Certificate validation to ensure ACM certificate is validated before use
# DNS validation creates DNS records in Route53 to prove domain ownership
# This validation must complete successfully before the certificate can be used with CloudFront
resource "aws_acm_certificate_validation" "us_cert_validation" {
  provider                = aws.us-east-1
  certificate_arn         = aws_acm_certificate.us_cert.arn
  validation_record_fqdns = [for record in aws_route53_record.us_cert_validation : record.fqdn]
}

resource "aws_acm_certificate_validation" "ap_cert_validation" {
  provider                = aws.ap-southeast-1
  certificate_arn         = aws_acm_certificate.ap_cert.arn
  validation_record_fqdns = [for record in aws_route53_record.ap_cert_validation : record.fqdn]
}