# General variables
variable "environment" {
  description = "Environment name (e.g., dev, staging, prod)"
  type        = string
  default     = "dev"
}

variable "common_tags" {
  description = "Common tags to apply to all resources"
  type        = map(string)
  default     = {}
}

# Domain configuration
variable "certificate_domain" {
  description = "Domain name for SSL certificate (e.g., example.com)"
  type        = string
}

variable "route53_zone_id" {
  description = "Route53 hosted zone ID for DNS records"
  type        = string
}

# S3 Website configuration
variable "s3_website_buckets" {
  description = "Map of S3 website bucket configurations"
  type = map(object({
    bucket_id           = string
    website_endpoint    = string
    default_root_object = string
    price_class         = string
    domain_name         = string
  }))
}
