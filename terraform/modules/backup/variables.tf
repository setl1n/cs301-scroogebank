#----------------------------------------
# Backup Module Variables
# Configuration parameters for the AWS Backup resources
#----------------------------------------

#----------------------------------------
# Environment Settings
# Defines deployment environment for resource naming
#----------------------------------------
variable "environment" {
  description = "Environment name (e.g., development, production)"
  type        = string
}

#----------------------------------------
# Backup Policies
# Controls retention periods and lifecycle settings
#----------------------------------------
variable "backup_retention_days" {
  description = "Number of days to retain backups"
  type        = number
  default     = 30
}

#----------------------------------------
# Resource Specifications
# Defines which database resources to back up
#----------------------------------------
variable "aurora_cluster_arns" {
  description = "List of Aurora cluster ARNs to backup"
  type        = list(string)
}

variable "dynamodb_table_arns" {
  description = "List of DynamoDB table ARNs to backup"
  type        = list(string)
}

#----------------------------------------
# Resource Tagging
# Tags to apply to all backup resources
#----------------------------------------
variable "tags" {
  description = "Tags to apply to backup resources"
  type        = map(string)
  default = {
    ManagedBy = "terraform"
  }
}
