resource "aws_rds_cluster" "aurora_cluster" {
  for_each               = var.applications
  cluster_identifier     = "${each.value.identifier}-cluster"
  engine                 = "aurora-postgresql"
  engine_mode            = "provisioned"
  engine_version         = "15.4" # PostgreSQL 15.4 compatible version
  db_subnet_group_name   = var.db_subnet_group_name
  database_name          = var.database_name
  master_username        = var.database_username
  master_password        = var.database_password
  storage_encrypted      = true
  skip_final_snapshot    = true
  vpc_security_group_ids = [var.security_group_id]
  availability_zones     = ["ap-southeast-1a", "ap-southeast-1b"] # Enable Multi-AZ deployment
}

# Primary writer instance
resource "aws_rds_cluster_instance" "aurora_writer" {
  for_each            = var.applications
  identifier          = "${each.value.identifier}-writer"
  cluster_identifier  = aws_rds_cluster.aurora_cluster[each.key].id
  instance_class      = "db.t3.medium"
  engine              = aws_rds_cluster.aurora_cluster[each.key].engine
  engine_version      = aws_rds_cluster.aurora_cluster[each.key].engine_version
  publicly_accessible = false
  availability_zone   = "ap-southeast-1a"
  promotion_tier      = 0 # Primary instance with highest priority for promotion
}

# Reader replicas in different AZs for high availability
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