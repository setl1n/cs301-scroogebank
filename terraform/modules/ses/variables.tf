#----------------------------------------
# SES Module Variables
# Defines input variables for the SES module configuration
# Includes domain settings, mail configuration, and verification options
#----------------------------------------

variable "domain" {
  description = "The domain to use for sending emails"
  type        = string
}

variable "mail_from_domain" {
  description = "The Mail From domain (subdomain of the primary domain)"
  type        = string
  default     = null
}

variable "zone_id" {
  description = "Route53 zone ID for the domain"
  type        = string
}

variable "create_domain_mail_from" {
  description = "Whether to configure the MAIL FROM domain"
  type        = bool
  default     = true
}

variable "enable_verification" {
  description = "Whether to create Route53 records for domain verification"
  type        = bool
  default     = true
}

variable "emails" {
  description = "List of email addresses to verify"
  type        = list(string)
  default     = []
}

variable "tags" {
  description = "Tags to apply to resources"
  type        = map(string)
  default     = {}
}
