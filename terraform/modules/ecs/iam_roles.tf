# IAM roles and policies required for ECS operation
# This file sets up three main roles:
# 1. Execution role - allows ECS to pull container images and write logs
# 2. Task role - allows containers to access AWS services
# 3. Autoscaling role - allows the autoscaling service to modify ECS services

# Trust policy document for ECS execution role
data "aws_iam_policy_document" "assume_role_ecs" {
  statement {
    effect = "Allow"

    principals {
      type        = "Service"
      identifiers = ["ecs-tasks.amazonaws.com"]
    }

    actions = ["sts:AssumeRole"]
  }
}

# Execution role used by ECS to start tasks (pull images, write logs)
resource "aws_iam_role" "ecs_execution_role" {
  name               = "ecs-execution-role"
  assume_role_policy = data.aws_iam_policy_document.assume_role_ecs.json
}

# Trust policy document for ECS task role
data "aws_iam_policy_document" "assume_role_tasks" {
  statement {
    effect = "Allow"

    principals {
      type        = "Service"
      identifiers = ["ecs-tasks.amazonaws.com"]
    }

    actions = ["sts:AssumeRole"]
  }
}

# Task role used by containers themselves to access AWS services
resource "aws_iam_role" "ecs_tasks_role" {
  name               = "ecs-tasks-role"
  assume_role_policy = data.aws_iam_policy_document.assume_role_tasks.json
}

# Attach the ECS task execution policy to the task role
resource "aws_iam_role_policy_attachment" "task_execution_role_policy_attachment" {
  role       = aws_iam_role.ecs_tasks_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

# Trust policy document for autoscaling role
data "aws_iam_policy_document" "assume_role_autoscaling" {
  statement {
    effect = "Allow"

    principals {
      type        = "Service"
      identifiers = ["application-autoscaling.amazonaws.com"]
    }

    actions = ["sts:AssumeRole"]
  }
}

# Autoscaling role allowing Application Autoscaling to modify ECS services
resource "aws_iam_role" "ecs_autoscaling_role" {
  name               = "ecs-autoscaling-role"
  assume_role_policy = data.aws_iam_policy_document.assume_role_autoscaling.json
}

# Attach the autoscaling policy to the autoscaling role
resource "aws_iam_role_policy_attachment" "ecs_autoscaling_policy_attachment" {
  role       = aws_iam_role.ecs_autoscaling_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonEC2ContainerServiceAutoscaleRole"
}

# SQS policy document allowing sending messages to SQS queues
# First, create the IAM policy for SQS send message
resource "aws_iam_policy" "sqs_send_message_policy" {
  name        = "sqs-send-message-policy"
  description = "Policy to allow sending messages to SQS queue"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "sqs:SendMessage",
          "sqs:GetQueueUrl"
        ]
        Resource = [
          var.sqs_log_queue_arn  # access logs queue
        ]
      }
    ]
  })
}

# attach the sqs policy to the ECS task role
resource "aws_iam_role_policy_attachment" "ecs_tasks_sqs_send_message_policy_attachment" {
  role       = aws_iam_role.ecs_tasks_role.name
  policy_arn = aws_iam_policy.sqs_send_message_policy.arn
}

# Attach AmazonEC2ContainerRegistryReadOnly policy to the ECS execution role
resource "aws_iam_role_policy_attachment" "ecs_execution_role_ecr_policy_attachment" {
  role       = aws_iam_role.ecs_execution_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly"
}