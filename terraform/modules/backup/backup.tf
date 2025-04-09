#--------------------------------------------------------------
# AWS Backup vault and plan for Aurora and DynamoDB backups
#--------------------------------------------------------------

# Create AWS Backup vault
resource "aws_backup_vault" "backup_vault" {
  name = "${var.environment}-backup-vault"
  tags = var.tags
}

# Create AWS Backup plan
resource "aws_backup_plan" "backup_plan" {
  name = "${var.environment}-backup-plan"

  rule {
    rule_name         = "monthly_backup_rule"
    target_vault_name = aws_backup_vault.backup_vault.name
    schedule          = "cron(0 0 1 * ? *)" # Run at midnight on the 1st of every month
    lifecycle {
      delete_after = var.backup_retention_days
    }

    # Backup copy configuration (optional)
    # copy_action {
    #   destination_vault_arn = aws_backup_vault.backup_vault.arn
    # }
  }

  # Add tags for better resource management
  tags = var.tags
}

# Create IAM role for AWS Backup
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

# Attach necessary policies to the backup role
resource "aws_iam_role_policy_attachment" "backup_policy" {
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSBackupServiceRolePolicyForBackup"
  role       = aws_iam_role.backup_role.name
}

resource "aws_iam_role_policy_attachment" "restore_policy" {
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSBackupServiceRolePolicyForRestores"
  role       = aws_iam_role.backup_role.name
}

# Create selection for Aurora clusters
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

# Create selection for DynamoDB tables
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
