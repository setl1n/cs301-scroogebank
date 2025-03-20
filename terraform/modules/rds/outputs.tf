# General cluster endpoints that can be used by all applications
output "client_db_endpoint" {
  value       = aws_rds_cluster.aurora_cluster["client"].endpoint
  description = "Writer endpoint for client database"
}

output "account_db_endpoint" {
  value       = aws_rds_cluster.aurora_cluster["account"].endpoint
  description = "Writer endpoint for account database"
}

output "transaction_db_endpoint" {
  value       = aws_rds_cluster.aurora_cluster["transaction"].endpoint
  description = "Writer endpoint for transaction database"
}