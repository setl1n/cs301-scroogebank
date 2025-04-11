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
  skip_final_snapshot    = true
  vpc_security_group_ids = [var.security_group_id]
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
}
