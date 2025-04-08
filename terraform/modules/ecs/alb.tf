# Application Load Balancer configuration for ECS services
# This file defines the ALB, listeners, target groups, and routing rules

#--------------------------------------------------------------
# Public Subnets
# These subnets have direct internet access and are used for
# internet-facing resources like load balancers
#--------------------------------------------------------------

# Main application load balancer that will distribute traffic to our services
resource "aws_alb" "main" {
  name                 = "alb"
  subnets              = var.public_subnet_ids
  security_groups      = var.lb_sg_ids
  preserve_host_header = true
}

#--------------------------------------------------------------
# Listeners
# These handle incoming traffic and define default routing behaviors
#--------------------------------------------------------------

# HTTP listener that redirects all traffic to HTTPS for security
resource "aws_alb_listener" "alb_http_listener" {
  load_balancer_arn = aws_alb.main.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type = "redirect"
    redirect {
      port        = "443"
      protocol    = "HTTPS"
      status_code = "HTTP_301"
    }
  }
}

# HTTPS listener that handles encrypted traffic and forwards to appropriate target groups
# Default action returns 404 if no matching rule is found
resource "aws_alb_listener" "alb_https_listener" {
  load_balancer_arn = aws_alb.main.arn
  port              = 443
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-2016-08"
  certificate_arn   = var.certificate_arn # Added certificate ARN parameter

  default_action {
    type = "fixed-response"
    fixed_response {
      content_type = "text/plain"
      message_body = "404: Not Found"
      status_code  = "404"
    }
  }
}

#--------------------------------------------------------------
# Target Groups
# These define where traffic is routed to and how health checks
# are performed for the services
#--------------------------------------------------------------

# Target groups for each service - these are the destinations for traffic from the load balancer
# Each target group contains health check configuration to ensure traffic is only sent to healthy instances
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
# Based on path patterns defined in the services variable
resource "aws_lb_listener_rule" "app" {
  for_each     = var.services
  listener_arn = aws_alb_listener.alb_https_listener.arn
  priority     = 10 + index(keys(var.services), each.key) # Generate unique priority

  action {
    type             = "forward"
    target_group_arn = aws_alb_target_group.app[each.key].arn
  }

  condition {
    path_pattern {
      values = each.value.path_pattern
    }
  }
}