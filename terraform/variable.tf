variable "DATABASE_NAME" {
  description = "Name of the database to create"
  type        = string
  sensitive   = true
}

variable "DATABASE_USERNAME" {
  description = "Username for database access"
  type        = string
  sensitive   = true
}

variable "DATABASE_PASSWORD" {
  description = "Password for database access"
  type        = string
  sensitive   = true
}