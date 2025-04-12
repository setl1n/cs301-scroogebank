#--------------------------------------------------------------
# VPC Configuration
# Creates a dedicated VPC for the SFTP server
#--------------------------------------------------------------
resource "aws_vpc" "sftp_vpc" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_support   = true
  enable_dns_hostnames = true

  tags = {
    Name = "sftp-vpc"
  }
}

#--------------------------------------------------------------
# Subnet Configuration
# Creates public subnet for the SFTP server
#--------------------------------------------------------------
resource "aws_subnet" "sftp_public_subnet" {
  vpc_id                  = aws_vpc.sftp_vpc.id
  cidr_block              = "10.0.1.0/24"
  map_public_ip_on_launch = true
  availability_zone       = "${var.aws_region}a"

  tags = {
    Name = "sftp-public-subnet"
  }
}

#--------------------------------------------------------------
# Internet Gateway
# Enables internet access for resources in the VPC
#--------------------------------------------------------------
resource "aws_internet_gateway" "sftp_igw" {
  vpc_id = aws_vpc.sftp_vpc.id

  tags = {
    Name = "sftp-igw"
  }
}

#--------------------------------------------------------------
# Route Table
# Configures routing for the public subnet
#--------------------------------------------------------------
resource "aws_route_table" "sftp_public_rt" {
  vpc_id = aws_vpc.sftp_vpc.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.sftp_igw.id
  }

  tags = {
    Name = "sftp-public-rt"
  }
}

resource "aws_route_table_association" "sftp_public_rta" {
  subnet_id      = aws_subnet.sftp_public_subnet.id
  route_table_id = aws_route_table.sftp_public_rt.id
}

#--------------------------------------------------------------
# Security Group
# Defines access rules for the SFTP server
#--------------------------------------------------------------
resource "aws_security_group" "sftp_sg" {
  name        = "sftp-security-group"
  description = "Security group for SFTP server"
  vpc_id      = aws_vpc.sftp_vpc.id

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "SSH/SFTP access"
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Allow all outbound traffic"
  }

  tags = {
    Name = "sftp-sg"
  }
}
