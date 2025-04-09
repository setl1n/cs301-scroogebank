#--------------------------------------------------------------
# Module Outputs
# Values exposed for use by other Terraform modules
#--------------------------------------------------------------
output "sftp_server_public_ip" {
  value       = aws_instance.sftp_server.public_ip
  description = "Public IP of the SFTP server"
}