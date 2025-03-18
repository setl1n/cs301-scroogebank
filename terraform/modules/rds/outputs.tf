output "users_db_endpoint" {
  value = aws_db_instance.db_instance["users"].address
}

output "tournaments_db_endpoint" {
  value = aws_db_instance.db_instance["tournaments"].address
}

output "clubs_db_endpoint" {
  value = aws_db_instance.db_instance["clubs"].address
}
