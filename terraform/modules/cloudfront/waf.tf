# AWS WAF Web ACL with AWS Managed Rules for CloudFront protection
# Web Application Firewall (WAF) helps protect web applications from common web exploits
# When attached to CloudFront, it filters malicious traffic before it reaches your origin
resource "aws_wafv2_web_acl" "waf_acl" {
  provider    = aws.us-east-1
  name        = "cloudfront-waf"
  description = "WAF Web ACL protecting CloudFront distributions with AWS managed rules"
  scope       = "CLOUDFRONT"

  default_action {
    allow {}
  }

  # Core rule set - Provides protection against common web exploits
  # Includes rules for XSS, path traversal, remote code execution, and other OWASP Top 10 vulnerabilities
  rule {
    name     = "AWS-AWSManagedRulesCommonRuleSet"
    priority = 0

    override_action {
      none {}
    }

    statement {
      managed_rule_group_statement {
        name        = "AWSManagedRulesCommonRuleSet"
        vendor_name = "AWS"
      }
    }

    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "AWSManagedRulesCommonRuleSetMetric"
      sampled_requests_enabled   = true
    }
  }

  # SQL Injection rule set - Provides protection against SQL injection attacks
  # Analyzes web requests for malicious SQL code that could extract or modify database data
  rule {
    name     = "AWS-AWSManagedRulesSQLiRuleSet"
    priority = 1

    override_action {
      none {}
    }

    statement {
      managed_rule_group_statement {
        name        = "AWSManagedRulesSQLiRuleSet"
        vendor_name = "AWS"
      }
    }

    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "AWSManagedRulesSQLiRuleSetMetric"
      sampled_requests_enabled   = true
    }
  }

  visibility_config {
    cloudwatch_metrics_enabled = true
    metric_name                = "CloudFront-WAF"
    sampled_requests_enabled   = true
  }

  tags = {
    Name = "cloudfront-waf"
  }
}
