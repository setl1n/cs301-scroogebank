# AWS Infrastructure Configuration
# This file defines the main infrastructure components used in the application

# Network module - Sets up VPC, subnets, security groups, and other networking resources
# This forms the foundation for all other infrastructure components
module "network" {
  source = "./modules/network"
}

# RDS module - Manages database instances for application data persistence
# Creates database instances for different application components
# module "rds" {
#   source               = "./modules/rds"
#   security_group_id    = module.network.db_sg_id
#   db_subnet_group_name = module.network.db_subnet_group_name

#   # Database Connection Credentials - Passed from variables for security
#   database_name     = var.DATABASE_NAME
#   database_username = var.DATABASE_USERNAME
#   database_password = var.DATABASE_PASSWORD

#   # Applications map defining database requirements for each app component
#   applications = var.applications
# }

# ACM and Route53 module - Manages SSL certificates and DNS records
# Creates and validates certificates for use with CloudFront and other services
module "acm_route53" {
  source             = "./modules/acm_route53"
  certificate_domain = var.DOMAIN_NAME
  route53_zone_id    = var.ROUTE53_ZONE_ID

  providers = {
    aws.us-east-1      = aws.us-east-1
    aws.ap-southeast-1 = aws.ap-southeast-1
  }
}

# # S3 module - Object storage for static assets, backups, and website hosting
# # Creates and configures S3 buckets for different purposes
# module "s3" {
#   source = "./modules/s3"

#   # Configuration for various S3 buckets
#   buckets = var.s3_buckets
# }

# # CloudFront module - Content delivery network for static website hosting
# # Configures CloudFront distributions for S3 website buckets to improve performance and security
# module "cloudfront" {
#   source = "./modules/cloudfront"

#   # Dynamic configuration for CloudFront distributions connected to S3 website buckets
#   # Creates a CloudFront distribution for each website bucket
#   s3_website_buckets = {
#     for name, endpoint in module.s3.website_endpoints : name => {
#       bucket_id        = module.s3.bucket_ids[name]
#       website_endpoint = endpoint

#       domain_name         = "${replace(name, "_", "-")}.${var.DOMAIN_NAME}"
#       default_root_object = module.s3.index_documents[name]
#       price_class         = "PriceClass_100"
#     }
#   }

#   certificate_domain = var.DOMAIN_NAME
#   route53_zone_id    = var.ROUTE53_ZONE_ID
#   certificate_arn    = module.acm_route53.us_certificate_arn
# }

# # ElastiCache module - In-memory data store for caching and session management
# # Configures ElastiCache clusters for different application components
# module "elasticache" {
#   source              = "./modules/elasticache"
#   security_group_id   = module.network.db_sg_id
#   db_subnet_group_ids = module.network.db_subnet_group_ids

#   # Applications map defining cache requirements for each app component
#   applications = var.applications
# }

# ECS module - Container orchestration service for running microservices
# Configures ECS clusters, services, and tasks for different application components
module "ecs" {
  source            = "./modules/ecs"
  lb_sg_ids         = [module.network.lb_sg_id]
  vpc_id            = module.network.vpc_id
  ecs_tasks_sg_ids  = [module.network.ecs_tasks_sg_id]
  public_subnet_ids = module.network.public_subnet_ids

  # Database Connection Credentials - Passed from variables for security
  database_name     = var.DATABASE_NAME
  database_username = var.DATABASE_USERNAME
  database_password = var.DATABASE_PASSWORD

  certificate_arn = module.acm_route53.ap_certificate_arn

  # Services map defining ECS service requirements for each app component
  services = {
    # account = {
    #   cluster_name = "account-cluster"
    #   db_endpoint  = module.rds.db_endpoints["account"]
    #   app_image    = "vincetyy/kickoff-users:latest"
    #   app_port     = 8081
    #   path_pattern = ["/api/v1/users*", "/api/v1/playerProfiles*"]
    # }
    client = {
      cluster_name = "client-cluster"
      # db_endpoint  = module.rds.db_endpoints["client"]
      db_endpoint  = ""
      app_image    = "677761253473.dkr.ecr.ap-southeast-1.amazonaws.com/client-repository:latest"
      app_port     = 8080
      path_pattern = ["/clients"]
    }
  }
}
