module "network" {
  source = "./modules/network"
}

# module "rds" {
#   source            = "./modules/rds"
#   security_group_id = module.network.db_sg_id
#   # For testing purposes, change back to module.network.db_subnet_group_name on prod
#   db_subnet_group_name = module.network.db_public_subnet_group_name

#   # Database Connection Credentials
#   database_name     = var.database_name
#   database_username = var.DATABASE_USERNAME
#   database_password = var.DATABASE_PASSWORD

#   applications = {
#     users = {
#       identifier = "users-db"
#     },
#     tournaments = {
#       identifier = "tournaments-db"
#     },
#     clubs = {
#       identifier = "clubs-db"
#     },
#   }
# }

# module "ecs" {
#   source            = "./modules/ecs"
#   lb_sg_ids         = [module.network.lb_sg_id]
#   vpc_id            = module.network.vpc_id
#   ecs_tasks_sg_ids  = [module.network.ecs_tasks_sg_id]
#   public_subnet_ids = module.network.public_subnet_ids

#   # Database Connection Credentials
#   database_name     = var.database_name
#   database_username = var.DATABASE_USERNAME
#   database_password = var.DATABASE_PASSWORD

#   acm_certificate_arn   = var.ACM_CERTIFICATE_ARN
#   openai_api_key        = var.OPENAI_API_KEY
#   jwt_secret_key        = var.JWT_SECRET_KEY
#   s3_access_key         = var.S3_AWS_ACCESS_KEY
#   s3_secret_key         = var.S3_AWS_SECRET_KEY

#   services = {
#     users = {
#       cluster_name = "users-cluster"
#       db_endpoint  = module.rds.users_db_endpoint
#       app_image    = "vincetyy/kickoff-users:latest"
#       app_port     = 8081
#       path_pattern = ["/api/v1/users*", "/api/v1/playerProfiles*"]
#     }
#     tournaments = {
#       cluster_name = "tournaments-cluster"
#       db_endpoint  = module.rds.tournaments_db_endpoint
#       app_image    = "vincetyy/kickoff-tournaments:latest"
#       app_port     = 8080
#       path_pattern = ["/api/v1/tournaments*", "/api/v1/locations*"]
#     }
#     clubs = {
#       cluster_name = "clubs-cluster"
#       db_endpoint  = module.rds.clubs_db_endpoint
#       app_image    = "vincetyy/kickoff-clubs:latest"
#       app_port     = 8082
#       path_pattern = ["/api/v1/clubs*"]
#     }
#     chatbot = {
#       cluster_name = "chatbot-cluster"
#       db_endpoint  = ""
#       app_image    = "vincetyy/kickoff-chatbot:latest"
#       app_port     = 8000
#       path_pattern = ["/api/v1/chatbot*"]
#     }
#   }
# }
