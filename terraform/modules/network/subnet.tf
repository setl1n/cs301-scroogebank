#--------------------------------------------------------------
# Network Module - Subnet Configuration
# This file defines all subnets across multiple availability zones
# and associates them with appropriate route tables
#--------------------------------------------------------------

#--------------------------------------------------------------
# Public Subnets
# These subnets have direct internet access and are used for 
# internet-facing resources like load balancers
#--------------------------------------------------------------
resource "aws_subnet" "public_subnet_a" {
  vpc_id                  = aws_vpc.vpc.id
  availability_zone       = "ap-southeast-1a"
  cidr_block              = cidrsubnet(aws_vpc.vpc.cidr_block, 4, 1)
  map_public_ip_on_launch = true

  tags = {
    Name = "public-subnet-a"
  }
}

resource "aws_subnet" "public_subnet_b" {
  vpc_id                  = aws_vpc.vpc.id
  availability_zone       = "ap-southeast-1b"
  cidr_block              = cidrsubnet(aws_vpc.vpc.cidr_block, 4, 2)
  map_public_ip_on_launch = true

  tags = {
    Name = "public-subnet-b"
  }
}

#--------------------------------------------------------------
# Private Application Subnets
# These subnets host application containers/instances
# with no direct internet access
#--------------------------------------------------------------
resource "aws_subnet" "private_app_subnet_a" {
  vpc_id                  = aws_vpc.vpc.id
  availability_zone       = "ap-southeast-1a"
  cidr_block              = cidrsubnet(aws_vpc.vpc.cidr_block, 4, 3)
  map_public_ip_on_launch = false

  tags = {
    Name = "private-app-subnet-a"
  }
}

resource "aws_subnet" "private_app_subnet_b" {
  vpc_id                  = aws_vpc.vpc.id
  availability_zone       = "ap-southeast-1b"
  cidr_block              = cidrsubnet(aws_vpc.vpc.cidr_block, 4, 5)
  map_public_ip_on_launch = false

  tags = {
    Name = "private-app-subnet-b"
  }
}

#--------------------------------------------------------------
# Private Database Subnets
# Isolated subnets for database instances with additional
# security through network isolation
#--------------------------------------------------------------
resource "aws_subnet" "private_database_subnet_a" {
  vpc_id                  = aws_vpc.vpc.id
  availability_zone       = "ap-southeast-1a"
  cidr_block              = cidrsubnet(aws_vpc.vpc.cidr_block, 4, 6)
  map_public_ip_on_launch = false

  tags = {
    Name = "private-database-subnet-a"
  }
}

resource "aws_subnet" "private_database_subnet_b" {
  vpc_id                  = aws_vpc.vpc.id
  availability_zone       = "ap-southeast-1b"
  cidr_block              = cidrsubnet(aws_vpc.vpc.cidr_block, 4, 7)
  map_public_ip_on_launch = false

  tags = {
    Name = "private-database-subnet-b"
  }
}

#--------------------------------------------------------------
# Private Lambda Subnets
# Dedicated subnets for Lambda functions that run in VPC mode
#--------------------------------------------------------------
resource "aws_subnet" "private_lambda_subnet_a" {
  vpc_id                  = aws_vpc.vpc.id
  availability_zone       = "ap-southeast-1a"
  cidr_block              = cidrsubnet(aws_vpc.vpc.cidr_block, 4, 8)
  map_public_ip_on_launch = false # Intentionally enabled for load balancers and NAT gateways

  tags = {
    Name = "private-lambda-subnet-a"
  }
}

resource "aws_subnet" "private_lambda_subnet_b" {
  vpc_id                  = aws_vpc.vpc.id
  availability_zone       = "ap-southeast-1b"
  cidr_block              = cidrsubnet(aws_vpc.vpc.cidr_block, 4, 9)
  map_public_ip_on_launch = false # Intentionally enabled for load balancers and NAT gateways

  tags = {
    Name = "private-lambda-subnet-b"
  }
}

#--------------------------------------------------------------
# Database Subnet Group
# Groups database subnets for RDS multi-AZ deployment
#--------------------------------------------------------------
resource "aws_db_subnet_group" "db_subnet_group" {
  name = "db-subnet-group"
  subnet_ids = [
    aws_subnet.private_database_subnet_a.id,
    aws_subnet.private_database_subnet_b.id
  ]

  tags = {
    Name = "db-subnet-group"
  }
}

#--------------------------------------------------------------
# Public Database Subnet Group
# Groups public subnets for RDS testing (not for production use)
#--------------------------------------------------------------
resource "aws_db_subnet_group" "public_db_subnet_group" {
  name = "public-db-subnet-group"
  subnet_ids = [
    aws_subnet.public_subnet_a.id,
    aws_subnet.public_subnet_b.id
  ]

  tags = {
    Name        = "public-db-subnet-group"
    Environment = "testing"
  }
}

#--------------------------------------------------------------
# Route Table Associations
# Associates subnets with their respective route tables
#--------------------------------------------------------------
# Public subnet associations
resource "aws_route_table_association" "public_subnet_a" {
  subnet_id      = aws_subnet.public_subnet_a.id
  route_table_id = aws_route_table.public_route_table.id
}

resource "aws_route_table_association" "public_subnet_b" {
  subnet_id      = aws_subnet.public_subnet_b.id
  route_table_id = aws_route_table.public_route_table.id
}

# Private subnet associations
resource "aws_route_table_association" "private_app_subnet_a_association" {
  subnet_id      = aws_subnet.private_app_subnet_a.id
  route_table_id = aws_route_table.private_route_table.id
}

resource "aws_route_table_association" "private_app_subnet_b_association" {
  subnet_id      = aws_subnet.private_app_subnet_b.id
  route_table_id = aws_route_table.private_route_table.id
}

resource "aws_route_table_association" "private_database_subnet_a_association" {
  subnet_id      = aws_subnet.private_database_subnet_a.id
  route_table_id = aws_route_table.private_route_table.id
}

resource "aws_route_table_association" "private_database_subnet_b_association" {
  subnet_id      = aws_subnet.private_database_subnet_b.id
  route_table_id = aws_route_table.private_route_table.id
}

resource "aws_route_table_association" "private_lambda_subnet_a_association" {
  subnet_id      = aws_subnet.private_lambda_subnet_a.id
  route_table_id = aws_route_table.private_route_table.id
}

resource "aws_route_table_association" "private_lambda_subnet_b_association" {
  subnet_id      = aws_subnet.private_lambda_subnet_b.id
  route_table_id = aws_route_table.private_route_table.id
}