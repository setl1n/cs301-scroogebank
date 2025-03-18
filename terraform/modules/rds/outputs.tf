# General cluster endpoints that can be used by all applications
output "client_db_endpoint" {
  value = aws_rds_cluster.aurora_cluster.endpoint
  description = "Writer endpoint for client database"
}

output "account_db_endpoint" {
  value = aws_rds_cluster.aurora_cluster.endpoint
  description = "Writer endpoint for account database"
}

output "transaction_db_endpoint" {
  value = aws_rds_cluster.aurora_cluster.endpoint
  description = "Writer endpoint for transaction database"
}

# Primary writer endpoint (all applications will use the same Aurora cluster)
output "writer_endpoint" {
  value = aws_rds_cluster.aurora_cluster.endpoint
  description = "The endpoint for the Aurora cluster writer instance"
}

# Reader endpoint for read-heavy operations
output "reader_endpoint" {
  value = aws_rds_cluster.aurora_cluster.reader_endpoint
  description = "The reader endpoint for the Aurora cluster (load-balanced across read replicas)"
}

# Database port
output "port" {
  value = aws_rds_cluster.aurora_cluster.port
  description = "The database port"
}