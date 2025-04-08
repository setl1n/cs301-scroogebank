#--------------------------------------------------------------
# AWS Secrets Manager Configuration
# Stores the SSH private key securely for use by Lambda functions
#--------------------------------------------------------------
resource "aws_secretsmanager_secret" "sftp_private_key" {
  name                    = var.sftp_private_key_secret_name
  description             = "SSH private key for SFTP server access"
  recovery_window_in_days = 0
}

resource "aws_secretsmanager_secret_version" "sftp_private_key_value" {
  secret_id     = aws_secretsmanager_secret.sftp_private_key.id
  secret_string = tls_private_key.sftp_key.private_key_pem
}
