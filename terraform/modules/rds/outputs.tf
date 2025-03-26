# Dynamic outputs for all configured databases
output "db_endpoints" {
  value = {
    for app_key, app in var.applications :
    app_key => aws_rds_cluster.aurora_cluster[app_key].endpoint
  }
  description = "Map of writer endpoints for all databases"
}