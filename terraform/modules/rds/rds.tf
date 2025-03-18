# resource "aws_rds_cluster" "aurora_cluster" {
#   cluster_identifier     = "kickoff-cluster"
#   engine                 = "aurora-mysql"
#   engine_mode            = "provisioned"             # only v1 is serverless, serverless_v2 must be `provisioned`, v2 is not true serverless 
#   engine_version         = "8.0.mysql_aurora.3.05.2" # compatible with mysql8.0
#   db_subnet_group_name   = var.db_subnet_group_name
#   database_name          = var.database_name
#   master_username        = var.database_username
#   master_password        = var.database_password
#   storage_encrypted      = false # set this to false for aurora serverless, default true
#   skip_final_snapshot    = true
#   vpc_security_group_ids = [var.security_group_id]

#   serverlessv2_scaling_configuration {
#     max_capacity = 1.0
#     min_capacity = 0.5
#   }
# }

# resource "aws_rds_cluster_instance" "aurora_instance" {
#   identifier          = "kickoff-instance"
#   cluster_identifier  = aws_rds_cluster.aurora_cluster.id
#   instance_class      = "db.serverless"
#   engine              = aws_rds_cluster.aurora_cluster.engine
#   engine_version      = aws_rds_cluster.aurora_cluster.engine_version
#   publicly_accessible = true
# }

resource "aws_db_instance" "db_instance" {
  for_each = var.applications # iterate over the map

  allocated_storage = 10
  storage_type      = "gp2"
  engine            = "mysql"
  engine_version    = "8.0.36"
  instance_class    = "db.t3.micro"

  # For testing purposes, remove on prod
  publicly_accessible             = true
  identifier                      = each.value.identifier # takes value from the map
  db_name                         = var.database_name
  username                        = var.database_username
  password                        = var.database_password
  parameter_group_name            = "default.mysql8.0"
  skip_final_snapshot             = true
  vpc_security_group_ids          = [var.security_group_id]
  db_subnet_group_name            = var.db_subnet_group_name
  auto_minor_version_upgrade      = true
  storage_encrypted               = true
  copy_tags_to_snapshot           = true
  enabled_cloudwatch_logs_exports = ["general", "error", "slowquery"]
  apply_immediately               = true
}