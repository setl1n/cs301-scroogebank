resource "aws_rds_cluster" "aurora_cluster" {
  cluster_identifier     = "kickoff-cluster"
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
  availability_zones     = ["ap-southeast-1a", "ap-southeast-1b", "ap-southeast-1c"] # Enable Multi-AZ deployment
}

# Primary writer instance
resource "aws_rds_cluster_instance" "aurora_writer" {
  identifier          = "db-writer"
  cluster_identifier  = aws_rds_cluster.aurora_cluster.id
  instance_class      = "db.t3.medium"
  engine              = aws_rds_cluster.aurora_cluster.engine
  engine_version      = aws_rds_cluster.aurora_cluster.engine_version
  publicly_accessible = true
  availability_zone   = "ap-southeast-1a"
  promotion_tier      = 0  # Primary instance with highest priority for promotion
}

# Reader replicas in different AZs for high availability
resource "aws_rds_cluster_instance" "aurora_readers" {
  count               = 1  # Creating 2 reader replicas
  identifier          = "db-reader-${count.index + 1}"
  cluster_identifier  = aws_rds_cluster.aurora_cluster.id
  instance_class      = "db.t3.medium"
  engine              = aws_rds_cluster.aurora_cluster.engine
  engine_version      = aws_rds_cluster.aurora_cluster.engine_version
  publicly_accessible = true
  availability_zone   = count.index == 0 ? "ap-southeast-1b" : "ap-southeast-1c"  # Distribute across different AZs
  promotion_tier      = count.index + 1  # Sets promotion priority (lower number = higher priority)
}