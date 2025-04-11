#----------------------------------------
# AWS Backup Configuration
# Defines vault and plan for Aurora and DynamoDB backups
#----------------------------------------

#----------------------------------------
# Backup Vault
# Secure storage location for all backup recovery points
#----------------------------------------
resource "aws_backup_vault" "backup_vault" {
  name = "${var.environment}-backup-vault"
  tags = var.tags
}

#----------------------------------------
# Backup Plan
# Defines backup frequency, window, and lifecycle policies
#----------------------------------------
resource "aws_backup_plan" "backup_plan" {
  name = "${var.environment}-backup-plan"

  rule {
    rule_name         = "monthly_backup_rule"
    target_vault_name = aws_backup_vault.backup_vault.name
    schedule          = "cron(0 0 * * ? *)" # Run at midnight every day
    lifecycle {
      delete_after       = var.backup_retention_days
      cold_storage_after = 7 # Move to cold storage after 7 days
    }

    # Backup copy configuration (optional)
    # copy_action {
    #   destination_vault_arn = aws_backup_vault.backup_vault.arn
    # }
  }

  # Add tags for better resource management
  tags = var.tags
}

#----------------------------------------
# IAM Configuration
# Service role for AWS Backup to access resources
#----------------------------------------
resource "aws_iam_role" "backup_role" {
  name = "${var.environment}-backup-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "backup.amazonaws.com"
        }
      }
    ]
  })
}

#----------------------------------------
# IAM Policy Attachments
# Permissions for backup and restore operations
#----------------------------------------
resource "aws_iam_role_policy_attachment" "backup_policy" {
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSBackupServiceRolePolicyForBackup"
  role       = aws_iam_role.backup_role.name
}

resource "aws_iam_role_policy_attachment" "restore_policy" {
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSBackupServiceRolePolicyForRestores"
  role       = aws_iam_role.backup_role.name
}

#----------------------------------------
# Resource Selections
# Defines which resources are included in backup plan
#----------------------------------------
resource "aws_backup_selection" "aurora_selection" {
  name         = "aurora-selection"
  iam_role_arn = aws_iam_role.backup_role.arn
  plan_id      = aws_backup_plan.backup_plan.id

  resources = var.aurora_cluster_arns

  selection_tag {
    type  = "STRINGEQUALS"
    key   = "Environment"
    value = var.environment
  }
}

resource "aws_backup_selection" "dynamodb_selection" {
  name         = "dynamodb-selection"
  iam_role_arn = aws_iam_role.backup_role.arn
  plan_id      = aws_backup_plan.backup_plan.id

  resources = var.dynamodb_table_arns

  selection_tag {
    type  = "STRINGEQUALS"
    key   = "Environment"
    value = var.environment
  }
}