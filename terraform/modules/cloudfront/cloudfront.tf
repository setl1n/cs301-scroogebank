# CloudFront distributions for S3 website buckets
resource "aws_cloudfront_distribution" "s3_distribution" {
  for_each = var.s3_website_buckets

  enabled             = true
  is_ipv6_enabled     = true
  default_root_object = each.value.default_root_object
  price_class         = each.value.price_class
  web_acl_id          = aws_wafv2_web_acl.waf_acl.arn
  aliases             = [each.value.domain_name]

  # S3 website origin configuration
  origin {
    domain_name = each.value.website_endpoint
    origin_id   = "S3-Website-${each.value.bucket_id}"

    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "http-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  # Default cache behavior settings
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

  # SSL certificate configuration
  viewer_certificate {
    acm_certificate_arn      = aws_acm_certificate.cert.arn
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.2_2021"
  }

  # Geo restriction settings (none by default)
  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  tags = {
    Name = "cloudfront-${replace(each.key, "_", "-")}"
  }

  depends_on = [
    aws_acm_certificate_validation.cert_validation
  ]
}