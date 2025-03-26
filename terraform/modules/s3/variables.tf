# Map of S3 buckets configuration
# Each entry creates a separate S3 bucket with specified properties
# is_website determines if the bucket should be configured as a static website
variable "buckets" {
  description = "Map of S3 buckets to create"
  type = map(object({
    name            = string
    is_website      = bool
    index_document  = optional(string, "index.html")
    error_document  = optional(string, "index.html")
    prevent_destroy = optional(bool, false)
  }))

  validation {
    condition     = length(var.buckets) > 0
    error_message = "At least one bucket must be defined."
  }
}

# AWS region configuration
variable "region" {
  description = "AWS region for the S3 buckets"
  type        = string
  default     = "ap-southeast-1"
}
