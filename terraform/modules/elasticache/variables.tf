#--------------------------------------------------------------
# ElastiCache Module Input Variables
#--------------------------------------------------------------

#--------------------------------------------------------------
# Networking Configuration
# Variables related to the networking setup of ElastiCache
#--------------------------------------------------------------

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

#--------------------------------------------------------------
# Application Configuration
# Variables that define which applications will use ElastiCache
#--------------------------------------------------------------

# Map of applications that will use ElastiCache
# Each application gets its own ElastiCache instance with unique identifier
variable "applications" {
  description = "Map of applications with their configurations"
  type = map(object({
    identifier = string
  }))
  default = {}
}
