module "network" {
  source = "./modules/network"
}


module "elasticache" {
  source              = "./modules/elasticache"
  security_group_id   = module.network.db_sg_id
  db_subnet_group_ids = module.network.db_subnet_group_ids

  applications = var.applications
}

# module "rds" {
#   source            = "./modules/rds"
#   security_group_id = module.network.db_sg_id
#   # For testing purposes, change back to module.network.db_subnet_group_name on prod
#   db_subnet_group_name = module.network.db_subnet_group_name

#   # Database Connection Credentials
#   database_name     = var.DATABASE_NAME
#   database_username = var.DATABASE_USERNAME
#   database_password = var.DATABASE_PASSWORD

#   applications = = var.applications
# }

# module "ecs" {
#   source            = "./modules/ecs"
#   lb_sg_ids         = [module.network.lb_sg_id]
#   vpc_id            = module.network.vpc_id
#   ecs_tasks_sg_ids  = [module.network.ecs_tasks_sg_id]
#   public_subnet_ids = module.network.public_subnet_ids

#   # Database Connection Credentials
#   database_name     = var.DATABASE_NAME
#   database_username = var.DATABASE_USERNAME
#   database_password = var.DATABASE_PASSWORD

#   services = {
#     account = {
#       cluster_name = "account-cluster"
#       db_endpoint  = module.rds.users_db_endpoint
#       app_image    = "vincetyy/kickoff-users:latest"
#       app_port     = 8081
#       path_pattern = ["/api/v1/users*", "/api/v1/playerProfiles*"]
#     }
#     client = {
#       cluster_name = "client-cluster"
#       db_endpoint  = module.rds.tournaments_db_endpoint
#       app_image    = "vincetyy/kickoff-tournaments:latest"
#       app_port     = 8080
#       path_pattern = ["/api/v1/tournaments*", "/api/v1/locations*"]
#     }
#   }
# }
