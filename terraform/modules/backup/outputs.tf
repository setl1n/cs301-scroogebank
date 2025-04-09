output "backup_vault_arn" {
  description = "ARN of the backup vault"
  value       = aws_backup_vault.backup_vault.arn
}

output "backup_vault_name" {
  description = "Name of the backup vault"
  value       = aws_backup_vault.backup_vault.name
}

output "backup_plan_arn" {
  description = "ARN of the backup plan"
  value       = aws_backup_plan.backup_plan.arn
}

output "backup_plan_version" {
  description = "Unique, randomly generated, Unicode, UTF-8 encoded string that serves as the version ID of the backup plan"
  value       = aws_backup_plan.backup_plan.version
}
