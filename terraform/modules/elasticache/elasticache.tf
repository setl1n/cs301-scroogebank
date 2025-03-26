# Create a subnet group for ElastiCache, which defines which subnets ElastiCache instances can be deployed in
resource "aws_elasticache_subnet_group" "elasticache_subnet_group" {
  name       = "elasticache-subnet-group"
  subnet_ids = var.db_subnet_group_ids
}

# Commented out Redis cluster configuration in favor of the replication group below
# resource "aws_elasticache_cluster" "redis" {
#   for_each             = var.applications
#   cluster_id           = "${each.value.identifier}-cluster"
#   engine               = "redis"
#   node_type            = "cache.t2.micro"
#   num_cache_nodes      = 1
#   port                 = 6379
#   parameter_group_name = "default.redis7"
#   subnet_group_name    = aws_elasticache_subnet_group.elasticache_subnet_group.name
#   security_group_ids   = [var.security_group_id]
# }

# Using Valkey replication group instead of Redis cluster for cost optimization
# Valkey is a Redis-compatible in-memory data store offered by AWS
resource "aws_elasticache_replication_group" "valkey" {
  for_each             = var.applications
  replication_group_id = "${each.value.identifier}-rg"
  description          = "Redis replication group for ${each.value.identifier}"
  engine               = "valkey"
  node_type            = "cache.t2.micro"
  num_cache_clusters   = 1
  port                 = 6379
  subnet_group_name    = aws_elasticache_subnet_group.elasticache_subnet_group.name
  security_group_ids   = [var.security_group_id]

  # Disabled since we're using a single node configuration
  automatic_failover_enabled = false
}
