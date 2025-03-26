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

resource "aws_subnet" "private_lambda_subnet_a" {
  vpc_id                  = aws_vpc.vpc.id
  availability_zone       = "ap-southeast-1a"
  cidr_block              = cidrsubnet(aws_vpc.vpc.cidr_block, 4, 8) # Using CIDR block 8
  map_public_ip_on_launch = false

  tags = {
    Name = "private-lambda-subnet-a"
  }
}

resource "aws_subnet" "private_lambda_subnet_b" {
  vpc_id                  = aws_vpc.vpc.id
  availability_zone       = "ap-southeast-1b"
  cidr_block              = cidrsubnet(aws_vpc.vpc.cidr_block, 4, 9) # Using CIDR block 9
  map_public_ip_on_launch = false

  tags = {
    Name = "private-lambda-subnet-b"
  }
}

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

resource "aws_route_table_association" "public_subnet_a" {
  subnet_id      = aws_subnet.public_subnet_a.id
  route_table_id = aws_route_table.public_route_table.id
}

resource "aws_route_table_association" "public_subnet_b" {
  subnet_id      = aws_subnet.public_subnet_b.id
  route_table_id = aws_route_table.public_route_table.id
}

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