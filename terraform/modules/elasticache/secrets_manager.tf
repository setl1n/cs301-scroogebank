
#--------------------------------------------------------------
# Generate Random Auth Token and Store in Secrets Manager
#--------------------------------------------------------------

# Generate a secure random password for ElastiCache auth token
resource "random_password" "elasticache_auth_token" {
  for_each         = var.applications
  length           = 32
  special          = true
  override_special = "!#$%&*()-_=+[]{}<>:?"
}

# Store the auth token in AWS Secrets Manager
resource "aws_secretsmanager_secret" "elasticache_auth_token" {
  for_each = var.applications
  name     = "${each.value.identifier}-elasticache-auth-token"
}

resource "aws_secretsmanager_secret_version" "elasticache_auth_token" {
  for_each      = var.applications
  secret_id     = aws_secretsmanager_secret.elasticache_auth_token[each.key].id
  secret_string = random_password.elasticache_auth_token[each.key].result
}