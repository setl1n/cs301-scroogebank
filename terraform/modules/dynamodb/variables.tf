variable "table_name" {
  description = "Name of the DynamoDB table for logging service"
  type        = string
  default     = "application-logs"
}

variable "billing_mode" {
  description = "DynamoDB billing mode (PROVISIONED or PAY_PER_REQUEST)"
  type        = string
  default     = "PROVISIONED"
}

variable "read_capacity" { # baseline, not peak capacity
  description = "Read capacity units for the table (only used in PROVISIONED mode)"
  type        = number
  default     = 1
}

variable "write_capacity" { # baseline, not peak capacity
  description = "Write capacity units for the table (only used in PROVISIONED mode)"
  type        = number
  default     = 1
}

variable "hash_key" {
  description = "Hash key (partition key) name for the DynamoDB table"
  type        = string
  default     = "logId"
}

variable "range_key" {
  description = "Range key (sort key) name for the DynamoDB table"
  type        = string
  default     = "timestamp"
}

variable "ttl_attribute" {
  description = "TTL attribute name for log expiration"
  type        = string
  default     = "expireAt"
}

variable "ttl_enabled" {
  description = "Enable TTL for automatic log expiration"
  type        = bool
  default     = true
}

variable "tags" {
  description = "Tags to apply to all resources"
  type        = map(string)
  default     = {}
}