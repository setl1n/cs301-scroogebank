resource "aws_instance" "sftp_server" {
  ami                    = var.ami_id
  instance_type          = var.instance_type
  subnet_id              = var.public_subnet_id
  key_name               = var.key_name
  vpc_security_group_ids = [var.security_group_id]

  tags = {
    Name = "sftp-server"
  }

  # User data to configure the SFTP server and create directories
  user_data = <<-EOF
              #!/bin/bash
              sudo yum update -y
              sudo yum install -y vsftpd
              sudo systemctl start vsftpd
              sudo systemctl enable vsftpd

              # Create required directories
              sudo mkdir -p /sftp/target
              sudo mkdir -p /sftp/.done
              sudo mkdir -p /sftp/.error

              # Set permissions for the directories
              sudo chmod -R 755 /sftp
              sudo chown -R ec2-user:ec2-user /sftp
              EOF
}