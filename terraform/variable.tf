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

variable "applications" {
  description = "Map of applications with their configurations"
  type = map(object({
    identifier = string
  }))
  default = {
    client = {
      identifier = "client-db"
    },
    account = {
      identifier = "account-db"
    },
    transaction = {
      identifier = "transaction-db"
    },
  }
}