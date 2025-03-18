variable "security_group_id" {
  type        = string
  description = "Security Group ID to be used by the DB"
}

variable "db_subnet_group_name" {
  type        = string
  description = "Subnet Group Name to be used by the DB"
}

variable "database_name" {
  type        = string
  description = "The name of the database"
}

variable "database_username" {
  type        = string
  description = "The username for the database"
}

variable "database_password" {
  type        = string
  description = "value of the password for the database"
}

variable "applications" {
  type = map(object({
    identifier = string
  }))
}
