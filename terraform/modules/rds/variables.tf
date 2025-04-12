#----------------------------------------
# Network Configuration Variables
#----------------------------------------
variable "security_group_id" {
  type        = string
  description = "Security Group ID to be used by the DB"
}

variable "db_subnet_group_name" {
  type        = string
  description = "Subnet Group Name to be used by the DB"
}

variable "db_subnet_group_ids" {
  type        = list(string)
  description = "Subnet Group IDs to be used by the DB"
}

#----------------------------------------
# Database Connection Variables
#----------------------------------------
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

#----------------------------------------
# Application Configuration
# This allows for dynamic creation of multiple database clusters
# based on the applications map provided
#----------------------------------------
variable "applications" {
  description = "Map of applications with their configurations"
  type = map(object({
    identifier = string
  }))
  default = {}
}
