#--------------------------------------------------------------
# AWS Certificate Manager (ACM) Module
# This module creates and manages SSL/TLS certificates for various AWS services
# including CloudFront distributions and application load balancers
#--------------------------------------------------------------

#--------------------------------------------------------------
# CloudFront Certificate (US East 1)
# CloudFront requires certificates in the us-east-1 region
# regardless of where your application is deployed
#--------------------------------------------------------------
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

#--------------------------------------------------------------
# Application Certificate (AP Southeast 1)
# Certificate for resources in the Singapore region
# Used for ALBs and other regional services
#--------------------------------------------------------------
resource "aws_acm_certificate" "ap_cert" {
  provider                  = aws.ap-southeast-1
  domain_name               = var.certificate_domain
  subject_alternative_names = ["*.${var.certificate_domain}", "alb.${var.certificate_domain}"]
  validation_method         = "DNS"

  lifecycle {
    create_before_destroy = true
  }

  tags = {
    Name = "ap-southeast-1-certificate"
  }
}

#--------------------------------------------------------------
# Certificate Validation
# DNS validation creates Route53 records to prove domain ownership
# Certificates must be validated before they can be used
#--------------------------------------------------------------
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