#--------------------------------------------------------------
# Network Module - VPC Configuration
# This file defines the Virtual Private Cloud and core networking components
# including internet gateway and route tables
#--------------------------------------------------------------

# Primary VPC with a /16 CIDR block (65,536 IP addresses)
resource "aws_vpc" "vpc" {
  cidr_block           = "10.10.0.0/16"
  enable_dns_hostnames = true

  tags = {
    Name = "main-vpc"
  }
}

# Internet Gateway to allow communication between VPC and the internet
resource "aws_internet_gateway" "igw" {
  vpc_id = aws_vpc.vpc.id

  tags = {
    Name = "main-igw"
  }
}

# NAT Gateway for outbound requests from private subnets in VPC
resource "aws_eip" "nat" {
  
  tags = {
    Name = "nat-eip"
  }
}

# Public route table for subnets that need direct internet access
resource "aws_route_table" "public_route_table" {
  vpc_id = aws_vpc.vpc.id

  tags = {
    Name = "public-route-table"
  }
}

# Default route to direct traffic to the internet gateway
resource "aws_route" "internet_access" {
  route_table_id         = aws_route_table.public_route_table.id
  destination_cidr_block = "0.0.0.0/0"
  gateway_id             = aws_internet_gateway.igw.id
}

# Private route table for subnets that should not be directly accessible from the internet
resource "aws_route_table" "private_route_table" {
  vpc_id = aws_vpc.vpc.id

  tags = {
    Name = "private-route-table"
  }
}

# Route in the private route table to direct traffic to the NAT Gateway
resource "aws_route" "private_to_nat" {
  route_table_id         = aws_route_table.private_route_table.id
  destination_cidr_block = "0.0.0.0/0"
  nat_gateway_id         = module.nat.nat_gateway_id
}