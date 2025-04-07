# Generate a key pair for SSH access
resource "tls_private_key" "sftp_key" {
  algorithm = "RSA"
  rsa_bits  = 4096
}

# Create an AWS key pair using the generated public key
resource "aws_key_pair" "sftp_key_pair" {
  key_name   = "sftp-key-pair"
  public_key = tls_private_key.sftp_key.public_key_openssh
}

resource "aws_instance" "sftp_server" {
  ami                    = var.ami_id
  instance_type          = var.instance_type
  subnet_id              = var.public_subnet_id
  key_name               = aws_key_pair.sftp_key_pair.key_name
  vpc_security_group_ids = [var.security_group_id]

  tags = {
    Name = "sftp-server"
  }

  # User data to configure the SFTP server and create directories
  # Updated for Ubuntu system
  user_data = <<-EOF
              #!/bin/bash
              # Update package repositories and install vsftpd
              sudo apt-get update -y
              sudo apt-get install -y vsftpd
              sudo systemctl start vsftpd
              sudo systemctl enable vsftpd

              # Create required directories
              sudo mkdir -p /sftp/target
              sudo mkdir -p /sftp/.done
              sudo mkdir -p /sftp/.error

              # Set permissions for the directories
              sudo chmod -R 755 /sftp
              sudo chown -R ubuntu:ubuntu /sftp
              EOF

  # Connection details for provisioners
  connection {
    type        = "ssh"
    user        = "ubuntu"  # Ubuntu uses 'ubuntu' as default user
    private_key = tls_private_key.sftp_key.private_key_pem
    host        = self.public_ip
  }

    provisioner "remote-exec" {
    inline = [
      "sudo mkdir -p /sftp/target",
      "sudo mkdir -p /sftp/.done",
      "sudo mkdir -p /sftp/.error",
      "sudo chmod -R 755 /sftp",
      "sudo chown -R ubuntu:ubuntu /sftp"
    ]
  }

  # Upload CSV file to the instance
  provisioner "file" {
    source      = var.csv_file_path
    destination = "/sftp/target/${basename(var.csv_file_path)}"
  }
}

# Save the private key to a local file for future SSH access
resource "local_file" "private_key" {
  content         = tls_private_key.sftp_key.private_key_pem
  filename        = "${path.module}/sftp_private_key.pem"
  file_permission = "0600"
}