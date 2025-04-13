# ---------------------------------------------------------------------------------------------------------------------
# NETWORK CONFIGURATION
# These variables define the network infrastructure where ECS will be deployed
# ---------------------------------------------------------------------------------------------------------------------
variable "subnet_ids" {
  type        = list(string)
  description = "List of subnet ids"
}

variable "ecs_tasks_sg_ids" {
  type        = list(string)
  description = "List of ECS task security group ids"
}

variable "lb_sg_ids" {
  type        = set(string)
  description = "Load balancer's security group ids"
}

variable "vpc_id" {
  type        = string
  description = "VPC's id"
}

# ---------------------------------------------------------------------------------------------------------------------
# REGION CONFIGURATION
# ---------------------------------------------------------------------------------------------------------------------
variable "aws_region" {
  type        = string
  description = "The region to deploy your apps to"
  default     = "ap-southeast-1"
}

# ---------------------------------------------------------------------------------------------------------------------
# APPLICATION DEPLOYMENT CONFIGURATION
# These variables control how the application is deployed and monitored
# ---------------------------------------------------------------------------------------------------------------------
variable "app_count" {
  type        = number
  description = "Number of docker containers to run"
  default     = 1
}

variable "health_check_path" {
  type        = string
  default     = "/api/v1/health"
  description = "Health check path of the app"
}

# ---------------------------------------------------------------------------------------------------------------------
# FARGATE RESOURCE CONFIGURATION
# These variables define the compute resources allocated to the containers
# ---------------------------------------------------------------------------------------------------------------------
variable "fargate_cpu" {
  type        = string
  description = "Fargate instance CPU units to provision (1 vCPU = 1024 CPU units)"
  default     = "256"
}

variable "fargate_memory" {
  type        = string
  description = "Fargate instance memory to provision (in MiB)"
  default     = "512"
}

# ---------------------------------------------------------------------------------------------------------------------
# DATABASE CONFIGURATION
# These variables define the database connection parameters
# ---------------------------------------------------------------------------------------------------------------------
variable "database_name" {
  type        = string
  description = "Name of the database"
}

variable "database_username" {
  type        = string
  description = "Username to connect to the database"
  sensitive   = true
}

variable "database_password" {
  type        = string
  description = "Password to connect to the database"
  sensitive   = true
}

variable "cognito_user_pool_arn" {
  description = "ARN of the Cognito user pool for authentication"
  type        = string
}

variable "cognito_user_pool_client_id" {
  description = "ID of the Cognito user pool client for authentication"
  type        = string
}

variable "cognito_domain" {
  description = "Domain name configured for Cognito"
  type        = string
}

# ---------------------------------------------------------------------------------------------------------------------
# SERVICE CONFIGURATION
# This map defines the services to be deployed, their configurations and routing rules
# ---------------------------------------------------------------------------------------------------------------------
variable "services" {
  type = map(object({
    cluster_name   = string
    db_endpoint    = string
    db_port        = string
    redis_endpoint = string
    redis_port     = string
    app_image      = string
    app_port       = number
    path_pattern   = list(string)
    auth_enabled   = optional(bool, false)
    sqs_enabled    = optional(bool, false)
    ses_enabled    = optional(bool, false)
  }))
}

variable "certificate_arn" {
  description = "ARN of the SSL certificate for HTTPS listener"
  type        = string
}

variable "certificate_domain" {
  description = "Domain name for the certificate"
  type        = string
}

variable "route53_zone_id" {
  description = "The Route53 hosted zone ID to create DNS records in"
  type        = string
}

variable "sqs_log_queue_arn" {
  description = "ARN of the SQS log queue for the service"
  type        = string
}

# ---------------------------------------------------------------------------------------------------------------------
# ALB CONFIGURATION
# These variables define the Application Load Balancer parameters
# ---------------------------------------------------------------------------------------------------------------------
variable "alb_id" {
  description = "ID of the Application Load Balancer"
  type        = string
}

variable "alb_dns_name" {
  description = "DNS name of the Application Load Balancer"
  type        = string
}

variable "http_listener_arn" {
  description = "ARN of the HTTP listener"
  type        = string
}

variable "https_listener_arn" {
  description = "ARN of the HTTPS listener"
  type        = string
}