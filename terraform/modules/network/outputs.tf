#--------------------------------------------------------------
# VPC Resources
# These outputs expose the VPC identifiers for use in other modules
#--------------------------------------------------------------
output "vpc_id" {
  value       = aws_vpc.vpc.id
  description = "The ID of the VPC"
}

#--------------------------------------------------------------
# Subnet Resources
# These outputs expose the subnet identifiers to enable resources
# to be created in the appropriate network segments
#--------------------------------------------------------------
output "public_subnet_ids" {
  value       = [aws_subnet.public_subnet_a.id, aws_subnet.public_subnet_b.id]
  description = "List of public subnet IDs"
}

output "private_app_subnet_a_id" {
  value       = aws_subnet.private_app_subnet_a.id
  description = "ID of private application subnet in availability zone A"
}

output "private_lambda_subnet_ids" {
  value       = [aws_subnet.private_lambda_subnet_a.id, aws_subnet.private_lambda_subnet_b.id]
  description = "List of lambda subnet IDs"
}

#--------------------------------------------------------------
# Security Group Resources
# These outputs expose security group identifiers for attaching
# to various resources requiring network access controls
#--------------------------------------------------------------
output "ecs_tasks_sg_id" {
  value       = aws_security_group.ecs_tasks_sg.id
  description = "Security group ID for ECS tasks"
}

output "lb_sg_id" {
  value       = aws_security_group.lb_sg.id
  description = "Security group ID for load balancer"
}

output "db_sg_id" {
  value       = aws_security_group.db_sg.id
  description = "Security group ID for database"
}

output "db_proxy_sg_id" {
  value       = aws_security_group.db_proxy_sg.id
  description = "Security group ID for database proxy"
}

output "lambda_sg_id" {
  value       = aws_security_group.lambda_sg.id
  description = "Security group ID for Lambda functions"
}


#--------------------------------------------------------------
# Database Subnet Resources
# These outputs expose database subnet configuration for RDS instances
#--------------------------------------------------------------
output "db_subnet_group_name" {
  value       = aws_db_subnet_group.db_subnet_group.name
  description = "Name of the database subnet group"
}

output "db_subnet_group_ids" {
  value       = aws_db_subnet_group.db_subnet_group.subnet_ids
  description = "List of subnet IDs in the database subnet group"
}

# output "public_db_subnet_group_name" {
#   value       = aws_db_subnet_group.public_db_subnet_group.name
#   description = "Name of the public database subnet group for testing purposes"
# }

output "nat_gateway_id" {
  value       = aws_nat_gateway.nat.id
  description = "The ID of the NAT Gateway"
}

output "elasticache_sg_id" {
  value       = aws_security_group.elasticache_sg.id
  description = "Security group ID for ElastiCache"
}
