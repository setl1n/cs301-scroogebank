# Dynamic outputs for all configured databases
# These endpoints are used for connecting application services to their respective databases
# Each application gets its own database endpoint based on the configuration
output "db_endpoints" {
  value = {
    for app_key, app in var.applications :
    app_key => aws_db_proxy.aurora_proxy[app_key].endpoint
  }
  description = "Map of proxy endpoints for all databases"
}

# Optional: Keep direct DB endpoints for reference
output "direct_db_endpoints" {
  value = {
    for app_key, app in var.applications :
    app_key => aws_rds_cluster.aurora_cluster[app_key].endpoint
  }
  description = "Map of direct writer endpoints for all databases (for reference only)"
}

output "db_arns" {
  value = {
    for app_key, app in var.applications :
    app_key => aws_rds_cluster.aurora_cluster[app_key].arn
  }
  description = "Map of ARNs for all databases"
}