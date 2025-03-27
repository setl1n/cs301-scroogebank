variable "certificate_domain" {
  description = "The base domain for the certificate (e.g., example.com)"
  type        = string
}

variable "route53_zone_id" {
  description = "The Route53 zone ID where DNS records should be created"
  type        = string
}
