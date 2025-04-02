resource "aws_security_group" "sftp_sg" {
  name        = "sftp-sg"
  description = "Security group for SFTP server"
  vpc_id      = var.vpc_id

  ingress {
    from_port       = 22
    to_port         = 22
    protocol        = "tcp"
    security_groups = [var.lambda_sg_id] # Allow access from Lambda SG
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