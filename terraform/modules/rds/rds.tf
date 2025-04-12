#----------------------------------------
# Aurora PostgreSQL Clusters
# Creates a cluster for each application defined in var.applications
# Uses PostgreSQL 15.4 with encryption enabled
#----------------------------------------
resource "aws_rds_cluster" "aurora_cluster" {
  for_each               = var.applications
  cluster_identifier     = "${each.value.identifier}-cluster"
  engine                 = "aurora-postgresql"
  engine_mode            = "provisioned"
  engine_version         = "15.4"
  db_subnet_group_name   = var.db_subnet_group_name
  database_name          = var.database_name
  master_username        = var.database_username
  master_password        = var.database_password
  storage_encrypted      = true
  kms_key_id             = aws_kms_key.rds_encryption_key.arn
  skip_final_snapshot    = true
  vpc_security_group_ids = [var.db_security_group_id]
}

#----------------------------------------
# Database Instances - Writers
# Creates a primary DB instance in ap-southeast-1a for each cluster
# These instances handle write operations and serve as the primary endpoint
#----------------------------------------
resource "aws_rds_cluster_instance" "aurora_writer" {
  for_each           = var.applications
  identifier         = "${each.value.identifier}-writer"
  cluster_identifier = aws_rds_cluster.aurora_cluster[each.key].id
  instance_class     = "db.t3.medium"
  engine             = aws_rds_cluster.aurora_cluster[each.key].engine
  engine_version     = aws_rds_cluster.aurora_cluster[each.key].engine_version
  # publicly_accessible = true  # For testing
  publicly_accessible = false
  availability_zone   = "ap-southeast-1a"
  promotion_tier      = 0 # Primary instance with highest priority for promotion

  # Enable Performance Insights with default 7-day retention (free tier)
  performance_insights_enabled    = true
  performance_insights_kms_key_id = aws_kms_key.rds_encryption_key.arn
}

#----------------------------------------
# Database Instances - Readers
# Creates read replicas in ap-southeast-1b
# These replicas help distribute read load across multiple instances
# and provide high availability
#----------------------------------------
resource "aws_rds_cluster_instance" "aurora_readers" {
  for_each = var.applications

  identifier          = "${each.value.identifier}-reader"
  cluster_identifier  = aws_rds_cluster.aurora_cluster[each.key].id
  instance_class      = "db.t3.medium"
  engine              = aws_rds_cluster.aurora_cluster[each.key].engine
  engine_version      = aws_rds_cluster.aurora_cluster[each.key].engine_version
  publicly_accessible = false
  availability_zone   = "ap-southeast-1b"
  promotion_tier      = 1

  # Enable Performance Insights with default 7-day retention (free tier)
  performance_insights_enabled    = true
  performance_insights_kms_key_id = aws_kms_key.rds_encryption_key.arn
}

#----------------------------------------
# Secrets Manager - Database Credentials
# Stores the database credentials securely for RDS Proxy
#----------------------------------------
resource "aws_secretsmanager_secret" "db_credentials" {
  for_each = var.applications
  name     = "${each.value.identifier}-db-credentials"
}

resource "aws_secretsmanager_secret_version" "db_credentials" {
  for_each  = var.applications
  secret_id = aws_secretsmanager_secret.db_credentials[each.key].id
  secret_string = jsonencode({
    username = var.database_username
    password = var.database_password
  })
}

#----------------------------------------
# IAM Role for RDS Proxy
# Allows RDS Proxy to access database credentials in Secrets Manager
#----------------------------------------
resource "aws_iam_role" "rds_proxy_role" {
  name = "rds-proxy-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "rds.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_policy" "rds_proxy_policy" {
  name = "rds-proxy-policy"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = [
          "secretsmanager:GetSecretValue",
          "secretsmanager:DescribeSecret"
        ]
        Effect   = "Allow"
        Resource = [for secret in aws_secretsmanager_secret.db_credentials : secret.arn]
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "rds_proxy_attach" {
  role       = aws_iam_role.rds_proxy_role.name
  policy_arn = aws_iam_policy.rds_proxy_policy.arn
}

#----------------------------------------
# RDS Proxy
# Creates a proxy for each Aurora cluster to improve connection management
# and application resilience
#----------------------------------------
resource "aws_db_proxy" "aurora_proxy" {
  for_each               = var.applications
  name                   = "${each.value.identifier}-proxy"
  engine_family          = "POSTGRESQL"
  idle_client_timeout    = 1800
  require_tls            = true
  role_arn               = aws_iam_role.rds_proxy_role.arn
  vpc_security_group_ids = [var.proxy_security_group_id]
  vpc_subnet_ids         = var.db_subnet_group_ids
  debug_logging          = false

  auth {
    auth_scheme = "SECRETS"
    description = "Proxy authentication"
    iam_auth    = "DISABLED"
    secret_arn  = aws_secretsmanager_secret.db_credentials[each.key].arn
  }
}

#----------------------------------------
# RDS Proxy Target Group
# Associates the proxy with the RDS cluster
#----------------------------------------
resource "aws_db_proxy_default_target_group" "aurora_proxy_target" {
  for_each      = var.applications
  db_proxy_name = aws_db_proxy.aurora_proxy[each.key].name

  connection_pool_config {
    max_connections_percent      = 100
    max_idle_connections_percent = 50
    connection_borrow_timeout    = 120
  }
}

resource "aws_db_proxy_target" "aurora_proxy_cluster_target" {
  for_each              = var.applications
  db_proxy_name         = aws_db_proxy.aurora_proxy[each.key].name
  target_group_name     = aws_db_proxy_default_target_group.aurora_proxy_target[each.key].name
  db_cluster_identifier = aws_rds_cluster.aurora_cluster[each.key].id
}
