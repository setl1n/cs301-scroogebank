
resource "aws_elasticache_subnet_group" "elasticache_subnet_group" {
  name       = "elasticache-subnet-group"
  subnet_ids = var.db_subnet_group_ids
}

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

# i think this is cheaper
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

  automatic_failover_enabled = false
}
