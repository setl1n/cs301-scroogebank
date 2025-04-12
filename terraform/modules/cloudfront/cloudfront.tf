#----------------------------------------
# CloudFront Distributions
# CloudFront is AWS's Content Delivery Network (CDN) that speeds up distribution of static and dynamic web content
#----------------------------------------
resource "aws_cloudfront_response_headers_policy" "cors_policy" {
  name    = "cors-policy"
  comment = "Policy to enable CORS for CloudFront distributions"

  cors_config {
    access_control_allow_credentials = true
    
    access_control_allow_headers {
      items = ["Authorization", "Content-Type", "Origin", "Accept"]
    }
    
    access_control_allow_methods {
      items = ["HEAD", "POST", "PATCH", "DELETE", "PUT", "GET", "OPTIONS"]
    }
    
    access_control_allow_origins {
      items = ["https://main-frontend.itsag2t1.com", "http://localhost:5173"] # Consider restricting this to specific origins in production
    }
    
    origin_override = true
  }
}

resource "aws_cloudfront_distribution" "s3_distribution" {
  for_each = var.s3_website_buckets

  enabled             = true
  is_ipv6_enabled     = true
  default_root_object = each.value.default_root_object
  price_class         = each.value.price_class
  web_acl_id          = aws_wafv2_web_acl.waf_acl.arn
  aliases             = [each.value.domain_name]

  #----------------------------------------
  # S3 Website Origin Configuration
  # This defines the source of content for the CloudFront distribution
  # Using S3 website endpoint allows for index/error documents but requires public bucket access
  #----------------------------------------
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

  #----------------------------------------
  # Default Cache Behavior
  # Controls how CloudFront handles and caches requests for content
  # These settings apply to all paths that don't have specific cache behaviors defined
  #----------------------------------------
  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "S3-Website-${each.value.bucket_id}"
    
    response_headers_policy_id = aws_cloudfront_response_headers_policy.cors_policy.id

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

  #----------------------------------------
  # SSL Certificate Configuration
  # Uses ACM certificate to enable HTTPS for the CloudFront distribution
  # SNI allows multiple SSL certificates to be used on a single IP address
  #----------------------------------------
  viewer_certificate {
    acm_certificate_arn      = var.certificate_arn
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.2_2021"
  }

  #----------------------------------------
  # Geo Restriction Settings
  # Can be used to restrict access to content based on viewer location
  #----------------------------------------
  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  tags = {
    Name = "cloudfront-${replace(each.key, "_", "-")}"
  }
}