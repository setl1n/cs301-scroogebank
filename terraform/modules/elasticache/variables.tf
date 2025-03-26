# Input variables for the ElastiCache module
# These variables control networking, security, and application-specific settings

# Security group to control access to the ElastiCache instances
variable "security_group_id" {
  type        = string
  description = "Security Group ID to be used by the DB"
}

# Subnets where the ElastiCache instances will be deployed
variable "db_subnet_group_ids" {
  type        = list(any)
  description = "Subnet Group IDs to be used by the DB"
}

# Map of applications that will use ElastiCache
# Each application gets its own ElastiCache instance with unique identifier
variable "applications" {
  description = "Map of applications with their configurations"
  type = map(object({
    identifier = string
  }))
  default = {}
}
