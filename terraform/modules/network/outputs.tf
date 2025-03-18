output "ecs_tasks_sg_id" {
  value = aws_security_group.ecs_tasks_sg.id
}

output "lb_sg_id" {
  value = aws_security_group.lb_sg.id
}

output "db_sg_id" {
  value = aws_security_group.db_sg.id
}

output "db_subnet_group_name" {
  value = aws_db_subnet_group.db_subnet_group.name
}

output "vpc_id" {
  value = aws_vpc.vpc.id
}

output "public_subnet_ids" {
  value = [aws_subnet.public_subnet_1.id, aws_subnet.public_subnet_2.id]
}
