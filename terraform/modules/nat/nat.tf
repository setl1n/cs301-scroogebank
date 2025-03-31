resource "aws_nat_gateway" "nat" {
  allocation_id = aws_eip.nat.id
  subnet_id     = aws_subnet.public_subnet_a.id
  
  # Explicitly depend on the Internet Gateway
  depends_on = [aws_internet_gateway.igw]
  
  tags = {
    Name = "main-nat-gateway"
  }
}