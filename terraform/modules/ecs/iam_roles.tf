# IAM roles and policies required for ECS operation
# This file sets up three main roles:
# 1. Execution role - allows ECS to pull container images and write logs
# 2. Task role - allows containers to access AWS services
# 3. Autoscaling role - allows the autoscaling service to modify ECS services

#--------------------------------------------------------------
# ECS Execution Role
# Allows ECS to pull container images from ECR and write logs
# to CloudWatch on behalf of the task
#--------------------------------------------------------------

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

#--------------------------------------------------------------
# ECS Task Roles
# Allows containers themselves to access AWS services via
# the AWS SDK or CLI - one role per service
#--------------------------------------------------------------

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

# Create a separate task role for each service
resource "aws_iam_role" "ecs_tasks_role" {
  for_each = var.services

  name               = "ecs-tasks-role-${each.key}"
  assume_role_policy = data.aws_iam_policy_document.assume_role_tasks.json
}

# Below 2 roles are for cognito - alb integration
resource "aws_iam_role" "alb_cognito_role" {
  name = "alb-cognito-authentication-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Effect = "Allow",
        Principal = {
          Service = "elasticloadbalancing.amazonaws.com"
        },
        Action = "sts:AssumeRole"
      }
    ]
  })
}

resource "aws_iam_role_policy" "alb_cognito_policy" {
  name = "alb-cognito-authentication-policy"
  role = aws_iam_role.alb_cognito_role.id

  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Effect = "Allow",
        Action = [
          "cognito-idp:DescribeUserPoolClient",
          "cognito-idp:InitiateAuth"
        ],
        Resource = var.cognito_user_pool_arn
      }
    ]
  })
}

# Attach the ECS task execution policy to the task role
resource "aws_iam_role_policy_attachment" "task_execution_role_policy_attachment" {
  role       = aws_iam_role.ecs_execution_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

#--------------------------------------------------------------
# Auto Scaling Role
# Allows Application Auto Scaling service to modify ECS service
# desired count to scale the application
#--------------------------------------------------------------

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
          var.sqs_log_queue_arn # access logs queue
        ]
      }
    ]
  })
}

# Conditionally attach the sqs policy to the ECS task roles for services with sqs_enabled
resource "aws_iam_role_policy_attachment" "ecs_tasks_sqs_send_message_policy_attachment" {
  for_each = {
    for key, service in var.services : key => service
    if lookup(service, "sqs_enabled", false)
  }

  role       = aws_iam_role.ecs_tasks_role[each.key].name
  policy_arn = aws_iam_policy.sqs_send_message_policy.arn
}

# SES policy document allowing sending emails via SES
resource "aws_iam_policy" "ecs_ses_send_email_policy" {
  name        = "ecs-ses-send-email-policy"
  description = "Policy to allow sending emails via Amazon SES"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "ses:SendEmail",
          "ses:SendRawEmail"
        ]
        Resource = "*" # You may want to restrict this to specific SES resources/identities
      }
    ]
  })
}

# Conditionally attach the SES policy to the ECS task roles for services with ses_enabled
resource "aws_iam_role_policy_attachment" "ecs_tasks_ses_send_email_policy_attachment" {
  for_each = {
    for key, service in var.services : key => service
    if lookup(service, "ses_enabled", false)
  }

  role       = aws_iam_role.ecs_tasks_role[each.key].name
  policy_arn = aws_iam_policy.ecs_ses_send_email_policy.arn
}