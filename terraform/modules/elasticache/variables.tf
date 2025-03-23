variable "security_group_id" {
  type        = string
  description = "Security Group ID to be used by the DB"
}

variable "db_subnet_group_ids" {
  type        = list(any)
  description = "Subnet Group IDs to be used by the DB"
}

variable "applications" {
  description = "Map of applications with their configurations"
  type = map(object({
    identifier = string
  }))
  default = {}
}
