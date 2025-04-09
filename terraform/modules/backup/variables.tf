variable "environment" {
  description = "Environment name (e.g., development, production)"
  type        = string
}

variable "backup_retention_days" {
  description = "Number of days to retain backups"
  type        = number
  default     = 30
}

variable "aurora_cluster_arns" {
  description = "List of Aurora cluster ARNs to backup"
  type        = list(string)
}

variable "dynamodb_table_arns" {
  description = "List of DynamoDB table ARNs to backup"
  type        = list(string)
}

variable "tags" {
  description = "Tags to apply to backup resources"
  type        = map(string)
  default = {
    ManagedBy = "terraform"
  }
}
