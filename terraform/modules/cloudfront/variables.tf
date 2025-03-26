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

variable "certificate_domain" {
  description = "Domain name for SSL certificate"
  type        = string
  default     = ""
}

variable "route53_zone_id" {
  description = "Route53 zone ID for certificate validation"
  type        = string
  default     = "Z03081603VBT4ADFWB3RC"
}
