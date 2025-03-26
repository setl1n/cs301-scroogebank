# module "network" {
#   source = "./modules/network"
# }

# module "rds" {
#   source               = "./modules/rds"
#   security_group_id    = module.network.db_sg_id
#   db_subnet_group_name = module.network.db_subnet_group_name

#   # Database Connection Credentials
#   database_name     = var.DATABASE_NAME
#   database_username = var.DATABASE_USERNAME
#   database_password = var.DATABASE_PASSWORD

#   applications = var.applications
# }

# module "lambda" {
#   source = "./modules/lambda"

#   private_lambda_subnet_ids = module.network.private_lambda_subnet_ids
#   lambda_sg_id              = module.network.lambda_sg_id

#   # Define multiple Lambda functions with different use cases
#   lambda_functions = {
#     for name, config in var.lambda_functions : name => merge(config, {
#       source_code_hash = filebase64sha256(config.filename)

#       # Add dynamic configurations based on service flags
#       rds_config = config.rds_enabled ? {
#         database_host = module.rds.db_endpoints[name]
#         database_name = var.DATABASE_NAME
#         database_user = var.DATABASE_USERNAME
#         database_pass = var.DATABASE_PASSWORD
#       } : null,

#       # Add SES configuration if enabled
#       ses_config = config.ses_enabled ? {
#         region     = "ap-southeast-1"
#         from_email = "notifications@yourdomain.com"
#       } : null,

#       # Add DynamoDB configuration if enabled  
#       dynamodb_config = config.dynamodb_enabled ? {
#         region     = "ap-southeast-1"
#         table_name = "${name}-table"
#       } : null,
#     })
#   }
# }

module "s3" {
  source = "./modules/s3"
  
  buckets = var.s3_buckets
}

/*
module "elasticache" {
  source              = "./modules/elasticache"
  security_group_id   = module.network.db_sg_id
  db_subnet_group_ids = module.network.db_subnet_group_ids

  applications = var.applications
}

module "ecs" {
  source            = "./modules/ecs"
  lb_sg_ids         = [module.network.lb_sg_id]
  vpc_id            = module.network.vpc_id
  ecs_tasks_sg_ids  = [module.network.ecs_tasks_sg_id]
  public_subnet_ids = module.network.public_subnet_ids

  # Database Connection Credentials
  database_name     = var.DATABASE_NAME
  database_username = var.DATABASE_USERNAME
  database_password = var.DATABASE_PASSWORD

  services = {
    account = {
      cluster_name = "account-cluster"
      db_endpoint  = module.rds.db_endpoints["account"]
      app_image    = "vincetyy/kickoff-users:latest"
      app_port     = 8081
      path_pattern = ["/api/v1/users*", "/api/v1/playerProfiles*"]
    }
    client = {
      cluster_name = "client-cluster"
      db_endpoint  = module.rds.db_endpoints["client"]
      app_image    = "vincetyy/kickoff-tournaments:latest"
      app_port     = 8080
      path_pattern = ["/api/v1/tournaments*", "/api/v1/locations*"]
    }
  }
}
*/
