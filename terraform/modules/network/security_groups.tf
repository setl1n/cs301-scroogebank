#--------------------------------------------------------------
# Network Module - Security Groups
# This file defines security groups that control traffic flow
# between different components of the application architecture
#--------------------------------------------------------------

#--------------------------------------------------------------
# Database Security Group
# Controls access to database instances, allowing connections
# only from application and lambda tiers
#--------------------------------------------------------------
resource "aws_security_group" "db_sg" {
  name        = "db-sg"
  description = "Security group for database instances"
  vpc_id      = aws_vpc.vpc.id

  tags = {
    Name = "database-security-group"
  }
}

# Allow PostgreSQL access from ECS application containers
resource "aws_vpc_security_group_ingress_rule" "allow_db_ecs" {
  security_group_id            = aws_security_group.db_sg.id
  referenced_security_group_id = aws_security_group.ecs_tasks_sg.id
  from_port                    = 5432
  ip_protocol                  = "tcp"
  to_port                      = 5432
  description                  = "Allow PostgreSQL access from ECS tasks"
}

# Allow PostgreSQL access from Lambda functions
resource "aws_vpc_security_group_ingress_rule" "allow_mysql_lambda" {
  security_group_id            = aws_security_group.db_sg.id
  referenced_security_group_id = aws_security_group.lambda_sg.id
  from_port                    = 5432
  ip_protocol                  = "tcp"
  to_port                      = 5432
  description                  = "Allow PostgreSQL access from Lambda functions"
}

#--------------------------------------------------------------
# Load Balancer Security Group
# Controls traffic to/from the load balancer, allowing public HTTP/HTTPS
# access and restricting outbound traffic to application ports
#--------------------------------------------------------------
resource "aws_security_group" "lb_sg" {
  name        = "lb-sg"
  description = "Security group for load balancers"
  vpc_id      = aws_vpc.vpc.id

  tags = {
    Name = "loadbalancer-security-group"
  }
}

# Allow HTTP from internet to load balancer
resource "aws_vpc_security_group_ingress_rule" "allow_http" {
  security_group_id = aws_security_group.lb_sg.id
  cidr_ipv4         = "0.0.0.0/0"
  from_port         = 80
  ip_protocol       = "tcp"
  to_port           = 80
  description       = "Allow HTTP traffic from anywhere"
}

# Allow HTTPS from internet to load balancer
resource "aws_vpc_security_group_ingress_rule" "allow_https" {
  security_group_id = aws_security_group.lb_sg.id
  cidr_ipv4         = "0.0.0.0/0"
  from_port         = 443
  ip_protocol       = "tcp"
  to_port           = 443
  description       = "Allow HTTPS traffic from anywhere"
}

# Restrict outbound traffic from load balancer to application ports
resource "aws_vpc_security_group_egress_rule" "allow_traffic_ecs" {
  security_group_id = aws_security_group.lb_sg.id
  cidr_ipv4         = "0.0.0.0/0"
  from_port         = 8000
  ip_protocol       = "tcp"
  to_port           = 8082
  description       = "Allow outbound traffic to ECS application ports"
}

#--------------------------------------------------------------
# ECS Tasks Security Group
# Controls traffic to/from ECS containers, allowing ingress only
# from the load balancer and permitting all outbound traffic
#--------------------------------------------------------------
resource "aws_security_group" "ecs_tasks_sg" {
  name        = "ecs-tasks-sg"
  description = "Allow inbound access from the ALB only"
  vpc_id      = aws_vpc.vpc.id

  tags = {
    Name = "ecs-tasks-security-group"
  }
}

# Allow all traffic from load balancer to ECS tasks
resource "aws_vpc_security_group_ingress_rule" "allow_traffic_from_lb" {
  security_group_id            = aws_security_group.ecs_tasks_sg.id
  referenced_security_group_id = aws_security_group.lb_sg.id
  ip_protocol                  = "-1" # all protocols
  description                  = "Allow all traffic from load balancer"
}

# Allow HTTP access from any IP to ECS tasks
resource "aws_vpc_security_group_ingress_rule" "allow_http_from_anywhere" {
  security_group_id = aws_security_group.ecs_tasks_sg.id
  cidr_ipv4         = "0.0.0.0/0"
  from_port         = 80
  ip_protocol       = "tcp"
  to_port           = 80
  description       = "Allow HTTP traffic from anywhere"
}

# Allow HTTP access from any IP to ECS tasks
resource "aws_vpc_security_group_ingress_rule" "allow_http_8080" {
  security_group_id = aws_security_group.ecs_tasks_sg.id
  cidr_ipv4         = "0.0.0.0/0"
  from_port         = 8080
  ip_protocol       = "tcp"
  to_port           = 8080
  description       = "Allow HTTP traffic from anywhere"
}

# Allow all outbound traffic from ECS tasks (for updates, API calls, etc.)
resource "aws_vpc_security_group_egress_rule" "allow_all_traffic_ipv4_ecs" {
  security_group_id = aws_security_group.ecs_tasks_sg.id
  cidr_ipv4         = "0.0.0.0/0"
  ip_protocol       = "-1" # all protocols
  description       = "Allow all outbound traffic from ECS tasks"
}

#--------------------------------------------------------------
# Lambda Security Group
# Controls traffic to/from Lambda functions running in VPC mode,
# permitting all outbound traffic for API calls and dependencies
#--------------------------------------------------------------
resource "aws_security_group" "lambda_sg" {
  name        = "lambda-sg"
  description = "Security group for Lambda functions"
  vpc_id      = aws_vpc.vpc.id

  tags = {
    Name = "lambda-security-group"
  }
}

# Allow all outbound traffic from Lambda functions (for updates, API calls, etc.)
resource "aws_vpc_security_group_egress_rule" "allow_all_traffic_ipv4_lambda" {
  security_group_id = aws_security_group.lambda_sg.id
  cidr_ipv4         = "0.0.0.0/0"
  ip_protocol       = "-1" # all protocols
  description       = "Allow all outbound traffic from Lambda functions"
}

#--------------------------------------------------------------
# SFTP Server Security Group
# Controls traffic to/from SFTP server within the VPC,
# permitting all outbound traffic for API calls and dependencies
# Simulating an external SFTP server for file transfers
#--------------------------------------------------------------

resource "aws_security_group" "sftp_sg" {
  name        = "sftp-sg"
  description = "Security group for SFTP server"
  vpc_id      = aws_vpc.vpc.id

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    security_groups = [aws_security_group.lambda_sg.id] # Allow access from Lambda SG
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "sftp-security-group"
  }
}