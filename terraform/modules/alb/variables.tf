#--------------------------------------------------------------
# ALB Module Variables
#--------------------------------------------------------------

variable "public_subnet_ids" {
  description = "List of public subnet IDs for the ALB"
  type        = list(string)
}

variable "lb_sg_ids" {
  description = "List of security group IDs for the ALB"
  type        = list(string)
}

variable "certificate_arn" {
  description = "ARN of the SSL certificate for HTTPS listener"
  type        = string
}

variable "route53_zone_id" {
  description = "Route53 hosted zone ID"
  type        = string
}

variable "certificate_domain" {
  description = "Domain name for the certificate"
  type        = string
}
