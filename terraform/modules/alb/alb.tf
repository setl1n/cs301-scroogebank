#--------------------------------------------------------------
# Application Load Balancer Module
# This module defines an ALB and its associated resources
#--------------------------------------------------------------

#--------------------------------------------------------------
# Main ALB Resource
#--------------------------------------------------------------
resource "aws_alb" "main" {
  name                       = "alb"
  subnets                    = var.public_subnet_ids
  security_groups            = var.lb_sg_ids
  preserve_host_header       = true
  drop_invalid_header_fields = true
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

# HTTPS listener that handles encrypted traffic
resource "aws_alb_listener" "alb_https_listener" {
  load_balancer_arn = aws_alb.main.arn
  port              = 443
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-TLS13-1-2-2021-06"
  certificate_arn   = var.certificate_arn

  default_action {
    type = "fixed-response"
    fixed_response {
      content_type = "text/plain"
      message_body = "404: Not Found"
      status_code  = "404"
    }
  }
}