# VPC Resources
output "vpc_id" {
  value       = aws_vpc.vpc.id
  description = "The ID of the VPC"
}

# Subnet Resources
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

# Security Group Resources
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

output "lambda_sg_id" {
  value       = aws_security_group.lambda_sg.id
  description = "Security group ID for Lambda functions"
}

# Database Subnet Resources
output "db_subnet_group_name" {
  value       = aws_db_subnet_group.db_subnet_group.name
  description = "Name of the database subnet group"
}

output "db_subnet_group_ids" {
  value       = aws_db_subnet_group.db_subnet_group.subnet_ids
  description = "List of subnet IDs in the database subnet group"
}
