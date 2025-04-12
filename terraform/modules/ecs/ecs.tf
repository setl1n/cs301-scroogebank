# ECS infrastructure configuration
# This file defines the ECS clusters, task definitions, and services

# Create a separate ECS cluster for each service
resource "aws_ecs_cluster" "service_cluster" {
  for_each = var.services
  name     = each.value.cluster_name

  # Enable Container Insights for enhanced monitoring and diagnostics
  setting {
    name  = "containerInsights"
    value = "enabled"
  }
}

# Task definitions specify container configurations including CPU, memory, and environment variables
# These use a template file to generate the container definitions JSON
resource "aws_ecs_task_definition" "app" {
  for_each = var.services

  family                   = "${each.key}-task"
  execution_role_arn       = aws_iam_role.ecs_execution_role.arn
  task_role_arn            = aws_iam_role.ecs_tasks_role[each.key].arn
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = var.fargate_cpu
  memory                   = var.fargate_memory

  container_definitions = templatefile("./template/ecs_json.tpl", {
    # Template variables for container configuration
    app_name          = each.key
    app_image         = each.value.app_image
    app_port          = each.value.app_port
    fargate_cpu       = var.fargate_cpu
    fargate_memory    = var.fargate_memory
    aws_region        = var.aws_region
    log_group         = "/ecs/${each.key}"
    DATABASE_HOST     = each.value.db_endpoint
    DATABASE_PORT     = each.value.db_port
    DATABASE_NAME     = var.database_name
    DATABASE_USER     = var.database_username
    DATABASE_PASSWORD = var.database_password
    REDIS_HOST        = each.value.redis_endpoint
    REDIS_PORT        = each.value.redis_port
    SQS_QUEUE_NAME    = "application-logs-queue"
    SQS_REGION        = var.aws_region
  })
}

# ECS services manage the deployment and scaling of task instances
# They also handle registration with load balancers
resource "aws_ecs_service" "app" {
  for_each = var.services

  name            = "${each.key}-service"
  cluster         = aws_ecs_cluster.service_cluster[each.key].id
  task_definition = aws_ecs_task_definition.app[each.key].arn
  desired_count   = var.app_count
  launch_type     = "FARGATE"

  # Network configuration for the Fargate tasks
  network_configuration {
    security_groups  = var.ecs_tasks_sg_ids
    subnets          = var.subnet_ids
    assign_public_ip = false
  }

  # Register the service with the load balancer
  load_balancer {
    target_group_arn = aws_alb_target_group.app[each.key].id
    container_name   = each.key
    container_port   = each.value.app_port
  }

  service_registries {
    registry_arn = aws_service_discovery_service.service[each.key].arn
  }

  depends_on = [aws_iam_role_policy_attachment.task_execution_role_policy_attachment]
}