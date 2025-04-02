output "sftp_server_public_ip" {
  value       = aws_instance.sftp_server.public_ip
  description = "Public IP of the SFTP server"
}

output "sftp_sg_id" {
  value       = aws_security_group.sftp_sg.id
  description = "Security group ID for the SFTP server"
}