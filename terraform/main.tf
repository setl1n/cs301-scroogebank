#--------------------------------------------------------------
# CS301 Group 2 Team 1 Project - Main Infrastructure Configuration
#
# This file defines the core AWS infrastructure components used in the application.
# Some modules are currently commented out and can be uncommented when needed.
#--------------------------------------------------------------

#--------------------------------------------------------------
# Network Module
# Sets up foundational network infrastructure: VPC, subnets, security groups
#--------------------------------------------------------------
module "network" {
  source = "./modules/network"
}

#--------------------------------------------------------------
# DynamoDB Module 
# Provides NoSQL database for application logging
#--------------------------------------------------------------
# module "dynamodb" {
#   source = "./modules/dynamodb"

#   table_name = "application-logs"

#   # Optional: Configure other DynamoDB settings
#   billing_mode = "PAY_PER_REQUEST"
#   hash_key     = "id"
#   range_key    = "dateTimeStr"

#   # Add tags for better resource management
#   tags = {
#     Environment = "development"
#     Service     = "logging"
#     ManagedBy   = "terraform"
#   }
# }

#--------------------------------------------------------------
# RDS Module 
# Manages PostgreSQL database instances for persistent data storage
#--------------------------------------------------------------
module "rds" {
  source            = "./modules/rds"
  security_group_id = module.network.db_sg_id
  # db_subnet_group_name = module.network.public_db_subnet_group_name
  db_subnet_group_name = module.network.db_subnet_group_name

  # Database Connection Credentials - Passed from variables for security
  database_name     = var.DATABASE_NAME
  database_username = var.DATABASE_USERNAME
  database_password = var.DATABASE_PASSWORD

  # Applications map defining database requirements for each app component
  applications = var.applications
}

#--------------------------------------------------------------
# ACM and Route53 Module 
# Manages SSL certificates and DNS records for secure connections
#--------------------------------------------------------------
module "acm" {
  source             = "./modules/acm"
  certificate_domain = var.DOMAIN_NAME
  route53_zone_id    = var.ROUTE53_ZONE_ID

  providers = {
    aws.us-east-1      = aws.us-east-1
    aws.ap-southeast-1 = aws.ap-southeast-1
  }
}

#--------------------------------------------------------------
# S3 Module 
# Object storage for static assets, backups, and website hosting
#--------------------------------------------------------------
# module "s3" {
#   source = "./modules/s3"

#   # Configuration for various S3 buckets
#   buckets = var.s3_buckets
# }

#--------------------------------------------------------------
# CloudFront Module 
# Content delivery network for static website hosting
#--------------------------------------------------------------
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

#--------------------------------------------------------------
# ElastiCache Module 
# In-memory data store for caching and session management
#--------------------------------------------------------------
module "elasticache" {
  source              = "./modules/elasticache"
  security_group_id   = module.network.elasticache_sg_id
  db_subnet_group_ids = module.network.db_subnet_group_ids

  # Applications map defining cache requirements for each app component
  applications = var.applications
}

#--------------------------------------------------------------
# ECS Module 
# Container orchestration service for running microservices
#--------------------------------------------------------------
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

  certificate_arn    = module.acm.ap_certificate_arn
  certificate_domain = var.DOMAIN_NAME

  route53_zone_id = var.ROUTE53_ZONE_ID

  depends_on = [module.acm.ap_certificate_validation_id]

  # Services map defining ECS service requirements for each app component
  services = {
    client = {
      cluster_name   = "client-cluster"
      db_endpoint    = module.rds.db_endpoints["client"]
      db_port        = 5432
      redis_endpoint = module.elasticache.valkey_endpoints["client"]
      redis_port     = module.elasticache.valkey_port
      app_image      = "677761253473.dkr.ecr.ap-southeast-1.amazonaws.com/cs301g2t1-client:latest"
      app_port       = 8080
      path_pattern   = ["/clients"]
    }
    # account = {
    #   cluster_name   = "account-cluster"
    #   db_endpoint    = module.rds.db_endpoints["account"]
    #   db_port        = 5432
    #   redis_endpoint = module.elasticache.valkey_endpoints["account"]
    #   redis_port     = module.elasticache.valkey_port
    #   app_image      = "677761253473.dkr.ecr.ap-southeast-1.amazonaws.com/cs301g2t1-account:latest" # change back when using actual app
    #   app_port       = 8080
    #   path_pattern   = ["/api/v1/accounts"]
    # }
  }

  sqs_log_queue_arn = module.sqs.queue_arns["logs_queue"]
}

#--------------------------------------------------------------
# Cognito Module
# User authentication, authorization and user pool management
#--------------------------------------------------------------
# module "cognito" {
#   source = "./modules/cognito"

#   user_pool_name        = "CS301-G2-T1"
#   user_pool_client_name = "CS301-G2-T1-AppClient"

#   password_min_length        = 8
#   password_require_lowercase = true
#   password_require_uppercase = true
#   password_require_numbers   = true
#   password_require_symbols   = false

#   mfa_configuration = "OFF"

#   cognito_domain = var.COGNITO_DOMAIN
#   callback_urls  = [var.COGNITO_CALLBACK_URL]
#   logout_urls    = [var.COGNITO_LOGOUT_URL]

#   aws_region = var.aws_region
# }

#--------------------------------------------------------------
# SQS Module 
# Simple Queue Service for message queuing
#--------------------------------------------------------------
module "sqs" {
  source = "./modules/sqs"

  # Define the SQS queue for log processing
  queues = {
    logs_queue = {
      name                       = "application-logs-queue"
      delay_seconds              = 0
      max_message_size           = 262144 # 256 KB
      message_retention_seconds  = 86400  # 24 hours
      receive_wait_time_seconds  = 10
      visibility_timeout_seconds = 30
    }
  }
}

#--------------------------------------------------------------
# Lambda Module
# Serverless compute service for running backend functions
# #--------------------------------------------------------------
# module "lambda" {
#   source = "./modules/lambda"

  # private_lambda_subnet_ids = module.network.private_lambda_subnet_ids
  # lambda_sg_id              = module.network.lambda_sg_id
  # aws_region                = var.aws_region

#   # Define multiple Lambda functions with different use cases
#   lambda_functions = {
#     for name, config in var.lambda_functions : name => merge(config, {
#       source_code_hash = filebase64sha256(config.filename)

      # Add dynamic configurations based on service flags
      # rds_config = config.rds_enabled ? {
      #   database_host = module.rds.db_endpoints[name]
      #   # database_host = ""
      #   database_name = var.DATABASE_NAME
      #   database_user = var.DATABASE_USERNAME
      #   database_pass = var.DATABASE_PASSWORD
      # } : null,

#       # Add SES configuration if enabled
#       ses_config = config.ses_enabled ? {
#         region     = var.aws_region
#         from_email = "notifications@yourdomain.com"
#       } : null,

#       # Add DynamoDB configuration if enabled  
#       dynamodb_config = config.dynamodb_enabled ? {
#         region     = var.aws_region
#         table_name = module.dynamodb.table_name
#       } : null,

#       # Add Cognito configuration if enabled
#       cognito_config = config.cognito_enabled ? {
#         user_pool_id  = ""
#         app_client_id = ""
#         region        = var.aws_region
#       } : null,

#       sftp_config = config.sftp_enabled ? {
#         sftp_user                    = "ubuntu",
#         sftp_host                    = module.sftp_server.sftp_server_public_ip,
#         sftp_private_key_secret_name = var.sftp_private_key_secret_name,
#       } : null,
#       # Add SQS configuration if enabled
#       sqs_config = config.sqs_enabled ? {
#         queue_url = module.sqs.queue_urls["logs_queue"]
#         queue_arn = module.sqs.queue_arns["logs_queue"]
#         region    = var.aws_region
#       } : null,
#     })
#   }
# }

#--------------------------------------------------------------
# SFTP Module 
# EC2 instance for file retrieval via SFTP
#--------------------------------------------------------------
# module "sftp_server" {
#   source            = "./modules/sftp-server"
#   ami_id            = "ami-0aebd6a41cf6ab2eb" # Ubuntu Server 22.04 LTS (HVM), SSD Volume Type 
#   instance_type     = "t2.micro"
#   key_name          = "my-key-pair"
#   public_subnet_id  = module.network.public_subnet_ids[0]
#   vpc_id            = module.network.vpc_id
#   security_group_id = module.network.sftp_sg_id
#   # private_key_path  = "~/.ssh/id_rsa"  # Update this to your actual key path
#   csv_file_path                = "${path.root}/../mock_transactions.csv" # Path to the CSV file
#   sftp_private_key_secret_name = var.sftp_private_key_secret_name
# }

#--------------------------------------------------------------
# EventBridge Module
# Manages EventBridge rules and targets for scheduling tasks
#--------------------------------------------------------------
# module "eventbridge" {
#   source = "./modules/eventbridge"

#   # Pass required variables
#   rule_name        = "daily-sftp-fetch-rule"
#   rule_description = "Triggers the Lambda function to fetch SFTP data daily"
#   target_arn       = module.lambda.lambda_function_arns["transaction_lambda_function"] # ARN of the Lambda function
#   role_name        = "eventbridge-role"
#   role_policy = jsonencode({
#     Version = "2012-10-17"
#     Statement = [
#       {
#         Action   = "lambda:InvokeFunction"
#         Effect   = "Allow"
#         Resource = module.lambda.lambda_function_arns["transaction_lambda_function"]
#       }
#     ]
#   })
# }

#--------------------------------------------------------------
# AWS Backup Module
# Manages AWS Backup for RDS and DynamoDB
# #--------------------------------------------------------------
# module "backup" {
#   source                = "./modules/backup"
#   environment           = "development"
#   backup_retention_days = 1825 # 5 years
#   # Get Aurora cluster ARNs from your RDS module
#   aurora_cluster_arns = [
#     for app_key, arn in module.rds.db_arns : arn
#   ]
#   # Get DynamoDB table ARNs from your DynamoDB module
#   # dynamodb_table_arns = [module.dynamodb.table_arn] 
#   dynamodb_table_arns = []
#   tags = {
#     Environment = "development"
#     Service     = "backup"
#     ManagedBy   = "terraform"
#   }
# }
