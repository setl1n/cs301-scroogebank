variable "rule_name" {
  description = "The name of the EventBridge rule"
  type        = string
}

variable "rule_description" {
  description = "The description of the EventBridge rule"
  type        = string
  default     = "An example EventBridge rule"
}

variable "target_arn" {
  description = "The ARN of the target for the EventBridge rule"
  type        = string
}

variable "role_name" {
  description = "The name of the IAM role for EventBridge"
  type        = string
}

variable "role_policy" {
  description = "The policy document for the IAM role"
  type        = string
}