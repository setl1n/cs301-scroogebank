provider "aws" {
  alias  = "us-east-1"
  region = "us-east-1"
}

# ACM Certificate (must be in us-east-1 for CloudFront)
resource "aws_acm_certificate" "cert" {
  count             = var.create_certificate ? 1 : 0
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

# Get Route53 zone data
data "aws_route53_zone" "zone" {
  count = var.create_certificate && var.route53_zone_id != "" ? 1 : 0
  zone_id = var.route53_zone_id
}

resource "aws_route53_record" "cert_validation" {
  for_each = var.create_certificate && var.route53_zone_id != "" ? {
    for dvo in aws_acm_certificate.cert[0].domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      record = dvo.resource_record_value
      type   = dvo.resource_record_type
    }
  } : {}
  
  zone_id = var.route53_zone_id
  name    = each.value.name
  type    = each.value.type
  records = [each.value.record]
  ttl     = 60
}

# Update the certificate validation resource too
resource "aws_acm_certificate_validation" "cert_validation" {
  count              = var.create_certificate && var.route53_zone_id != "" ? 1 : 0
  provider           = aws.us-east-1
  certificate_arn    = aws_acm_certificate.cert[0].arn
  
  # Include validation records when using Route53
  validation_record_fqdns = [for record in aws_route53_record.cert_validation : record.fqdn]
}

# CloudFront Origin Access Identity for S3
resource "aws_cloudfront_origin_access_identity" "oai" {
  comment = "OAI for S3 buckets"
}

# CloudFront distributions for each website bucket
resource "aws_cloudfront_distribution" "s3_distribution" {
  for_each = var.s3_website_buckets

  enabled             = true
  is_ipv6_enabled     = true
  default_root_object = each.value.default_root_object
  price_class         = each.value.price_class

  # S3 website origin
  origin {
    domain_name = each.value.website_endpoint
    origin_id   = "S3-Website-${each.value.bucket_id}"
    
    custom_origin_config {
      http_port                = 80
      https_port               = 443
      origin_protocol_policy   = "http-only"
      origin_ssl_protocols     = ["TLSv1.2"]
    }
  }

  # Default cache behavior
  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "S3-Website-${each.value.bucket_id}"

    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 3600
    max_ttl                = 86400
  }

  # Single viewer certificate block with conditional logic
  viewer_certificate {
    # Use custom certificate when all conditions are met
    acm_certificate_arn      = (var.create_certificate && length(aws_acm_certificate.cert) > 0 && 
                               length(aws_acm_certificate_validation.cert_validation) > 0 && 
                               each.value.domain_name != null) ? aws_acm_certificate.cert[0].arn : null
    
    ssl_support_method       = (var.create_certificate && length(aws_acm_certificate.cert) > 0 && 
                               length(aws_acm_certificate_validation.cert_validation) > 0 && 
                               each.value.domain_name != null) ? "sni-only" : null
                               
    minimum_protocol_version = (var.create_certificate && length(aws_acm_certificate.cert) > 0 && 
                               length(aws_acm_certificate_validation.cert_validation) > 0 && 
                               each.value.domain_name != null) ? "TLSv1.2_2021" : null
    
    # Use default certificate if any condition fails
    cloudfront_default_certificate = !(var.create_certificate && length(aws_acm_certificate.cert) > 0 && 
                                      length(aws_acm_certificate_validation.cert_validation) > 0 && 
                                      each.value.domain_name != null)
  }

  # Restrictions
  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  # Only use aliases when the certificate is validated - fixed multi-line syntax
  aliases = (
    each.value.domain_name != null && var.create_certificate && 
    length(aws_acm_certificate.cert) > 0 && 
    length(aws_acm_certificate_validation.cert_validation) > 0 
    ? [each.value.domain_name] 
    : []
  )

  tags = {
    Name = "CloudFront-${each.key}"
  }

  depends_on = [
    aws_acm_certificate_validation.cert_validation
  ]
}

# Create domain to CloudFront distribution mapping
locals {
  cloudfront_domain_mappings = var.route53_zone_id != "" ? {
    for key, value in var.s3_website_buckets :
      value.domain_name => aws_cloudfront_distribution.s3_distribution[key].domain_name
      if value.domain_name != null
  } : {}
}

resource "aws_route53_record" "cloudfront_records" {
  for_each = local.cloudfront_domain_mappings

  zone_id = var.route53_zone_id
  name    = each.key
  type    = "A"

  alias {
    name                   = each.value
    zone_id                = "Z2FDTNDATAQYW2"  # Fixed CloudFront hosted zone ID
    evaluate_target_health = false
  }
}