#--------------------------------------------------------------
# Target Groups and Listener Rules for ECS Services
# This file defines the target groups and routing rules for the ALB
#--------------------------------------------------------------

#--------------------------------------------------------------
# Target Groups
# These define where traffic is routed to and how health checks
# are performed for the services
#--------------------------------------------------------------

# Target groups for each service - these are the destinations for traffic from the load balancer
resource "aws_alb_target_group" "app" {
  for_each = var.services

  name        = "${each.key}-target-group"
  port        = each.value.app_port
  protocol    = "HTTP"
  vpc_id      = var.vpc_id
  target_type = "ip"

  health_check {
    healthy_threshold   = "2"
    interval            = "60"
    protocol            = "HTTP"
    matcher             = "200"
    timeout             = "3"
    path                = var.health_check_path
    unhealthy_threshold = "4"
  }
}

#--------------------------------------------------------------
# Routing Rules
# These determine which requests go to which target groups based
# on path patterns and other conditions
#--------------------------------------------------------------

# Listener rules that determine which requests go to which target groups
resource "aws_lb_listener_rule" "app" {
  for_each     = var.services
  listener_arn = var.https_listener_arn
  priority     = 10 + index(keys(var.services), each.key)

  # Use dynamic action block for authentication when auth_enabled is true
  dynamic "action" {
    for_each = each.value.auth_enabled ? [1] : []
    content {
      type = "authenticate-cognito"

      authenticate_cognito {
        user_pool_arn       = var.cognito_user_pool_arn
        user_pool_client_id = var.cognito_user_pool_client_id
        user_pool_domain    = var.cognito_domain

        session_cookie_name = "AWSELBAuthSessionCookie"
        session_timeout     = 604800
        scope               = "openid email"
        authentication_request_extra_params = {
          "prompt" = "login"
        }

        on_unauthenticated_request = "authenticate"
      }

      order = 1
    }
  }

  action {
    type             = "forward"
    target_group_arn = aws_alb_target_group.app[each.key].arn
    order            = each.value.auth_enabled ? 2 : 1
  }

  condition {
    path_pattern {
      values = each.value.path_pattern
    }
  }
}