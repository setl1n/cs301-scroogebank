resource "aws_instance" "sftp_server" {
  ami           = var.ami_id
  instance_type = var.instance_type
  subnet_id     = var.public_subnet_id
  key_name      = var.key_name

  tags = {
    Name = "sftp-server"
  }

  # User data to configure the SFTP server
  user_data = <<-EOF
              #!/bin/bash
              sudo yum update -y
              sudo yum install -y vsftpd
              sudo systemctl start vsftpd
              sudo systemctl enable vsftpd
              EOF
}