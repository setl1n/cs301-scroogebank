# Store the private key in AWS Secrets Manager for secure Lambda access
resource "aws_secretsmanager_secret" "sftp_private_key" {
  name        = var.sftp_private_key_secret_name
  description = "SSH private key for SFTP server access"
}

resource "aws_secretsmanager_secret_version" "sftp_private_key_value" {
  secret_id     = aws_secretsmanager_secret.sftp_private_key.id
  secret_string = tls_private_key.sftp_key.private_key_pem
}
