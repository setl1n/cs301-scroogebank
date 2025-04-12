#----------------------------------------
# KMS Key for RDS Storage Encryption
# Creates a customer-managed key for enhanced security
#----------------------------------------
resource "aws_kms_key" "rds_encryption_key" {
  description             = "KMS key for RDS storage encryption"
  deletion_window_in_days = 10
  enable_key_rotation     = true
  tags = {
    Name = "rds-encryption-key"
  }
}

resource "aws_kms_alias" "rds_encryption_key_alias" {
  name          = "alias/rds-encryption-key"
  target_key_id = aws_kms_key.rds_encryption_key.key_id
}