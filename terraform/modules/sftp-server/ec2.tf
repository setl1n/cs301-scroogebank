#--------------------------------------------------------------
# SSH Key Management
# Generate RSA key pair for secure SSH access to the SFTP server
#--------------------------------------------------------------
resource "tls_private_key" "sftp_key" {
  algorithm = "RSA"
  rsa_bits  = 4096
}

resource "aws_key_pair" "sftp_key_pair" {
  key_name   = "sftp-key-pair"
  public_key = tls_private_key.sftp_key.public_key_openssh
}

#--------------------------------------------------------------
# SFTP Server Instance
# Creates and configures an EC2 instance with SFTP capabilities
#--------------------------------------------------------------
resource "aws_instance" "sftp_server" {
  ami                    = var.ami_id
  instance_type          = var.instance_type
  subnet_id              = aws_subnet.sftp_public_subnet.id
  key_name               = aws_key_pair.sftp_key_pair.key_name
  vpc_security_group_ids = [aws_security_group.sftp_sg.id]

  tags = {
    Name = "sftp-server"
  }

  #--------------------------------------------------------------
  # Server Configuration
  # Bootstrap script to install SFTP and set up required directories
  #--------------------------------------------------------------
  user_data = <<-EOF
              #!/bin/bash
              # Update package repositories and install vsftpd
              sudo apt-get update -y
              sudo apt-get install -y vsftpd

              # Create required directories
              sudo mkdir -p /sftp/target
              sudo mkdir -p /sftp/.done
              sudo mkdir -p /sftp/.error

              # Set permissions for the directories
              sudo chmod -R 755 /sftp
              sudo chown -R ubuntu:ubuntu /sftp

              sudo systemctl restart vsftpd
              EOF

  # Connection details for provisioners
  connection {
    type        = "ssh"
    user        = "ubuntu" # Ubuntu uses 'ubuntu' as default user
    private_key = tls_private_key.sftp_key.private_key_pem
    host        = self.public_ip
  }

  #--------------------------------------------------------------
  # Directory Setup
  # Creates and sets permissions for SFTP directories
  #--------------------------------------------------------------
  provisioner "remote-exec" {
    inline = [
      "sudo mkdir -p /sftp/target",
      "sudo mkdir -p /sftp/.done",
      "sudo mkdir -p /sftp/.error",
      "sudo chmod -R 755 /sftp",
      "sudo chown -R ubuntu:ubuntu /sftp"
    ]
  }

  #--------------------------------------------------------------
  # File Transfer
  # Uploads initial CSV file to the SFTP target directory
  #--------------------------------------------------------------
  provisioner "file" {
    source      = var.csv_file_path
    destination = "/sftp/target/${basename(var.csv_file_path)}"
  }
}
