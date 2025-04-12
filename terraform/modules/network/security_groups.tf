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

  # Allow PostgreSQL access from ECS application containers
  ingress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.ecs_tasks_sg.id]
    description     = "Allow PostgreSQL access from ECS tasks"
  }

  # Allow PostgreSQL access from Lambda functions
  ingress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.lambda_sg.id]
    description     = "Allow PostgreSQL access from Lambda functions"
  }

  # Uncomment to allow PostgreSQL access from anywhere
  # ingress {
  #   from_port   = 5432
  #   to_port     = 5432
  #   protocol    = "tcp"
  #   cidr_blocks = ["0.0.0.0/0"]
  #   description = "Allow PostgreSQL access from anywhere"
  # }

  tags = {
    Name = "database-security-group"
  }
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

  # Allow HTTP from internet to load balancer
  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Allow HTTP traffic from anywhere"
  }

  # Allow HTTPS from internet to load balancer
  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Allow HTTPS traffic from anywhere"
  }

  # Allow all outbound traffic from load balancer
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Allow all outbound traffic from ALB (including port 443)"
  }

  tags = {
    Name = "loadbalancer-security-group"
  }
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

  # Allow all traffic from load balancer to ECS tasks
  ingress {
    from_port       = 0
    to_port         = 0
    protocol        = "-1"
    security_groups = [aws_security_group.lb_sg.id]
    description     = "Allow all traffic from load balancer"
  }

  # Allow all traffic from Lambda to ECS tasks
  ingress {
    from_port       = 0
    to_port         = 0
    protocol        = "-1"
    security_groups = [aws_security_group.lambda_sg.id]
    description     = "Allow all traffic from Lambda functions"
  }

  # Commented HTTP access from anywhere
  # ingress {
  #   from_port   = 80
  #   to_port     = 80
  #   protocol    = "tcp"
  #   cidr_blocks = ["0.0.0.0/0"]
  #   description = "Allow HTTP traffic from anywhere"
  # }

  # Commented HTTP port 8080 access from anywhere
  # ingress {
  #   from_port   = 8080
  #   to_port     = 8080
  #   protocol    = "tcp"
  #   cidr_blocks = ["0.0.0.0/0"]
  #   description = "Allow HTTP traffic from anywhere"
  # }

  # Allow all outbound traffic from ECS tasks
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Allow all outbound traffic from ECS tasks"
  }

  tags = {
    Name = "ecs-tasks-security-group"
  }
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

  # Allow all traffic from load balancer to Lambda
  ingress {
    from_port       = 0
    to_port         = 0
    protocol        = "-1"
    security_groups = [aws_security_group.lb_sg.id]
    description     = "Allow all traffic from load balancer"
  }

  # Allow all outbound traffic from Lambda
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Allow all outbound traffic from Lambda functions"
  }

  tags = {
    Name = "lambda-security-group"
  }
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
    cidr_blocks = ["0.0.0.0/0"]
    # security_groups = [aws_security_group.lambda_sg.id] # Allow access from Lambda SG
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

# ElastiCache Security Group
resource "aws_security_group" "elasticache_sg" {
  name        = "elasticache-sg"
  description = "Security group for elasticache instances"
  vpc_id      = aws_vpc.vpc.id

  # Allow Redis access from ECS application containers
  ingress {
    from_port       = 6379
    to_port         = 6379
    protocol        = "tcp"
    security_groups = [aws_security_group.ecs_tasks_sg.id]
    description     = "Allow Elasticache access from ECS tasks"
  }

  tags = {
    Name = "elasticache-security-group"
  }
}