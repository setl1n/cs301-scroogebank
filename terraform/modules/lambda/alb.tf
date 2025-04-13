#------------------------------------------------------------------------------
# ALB Integration for Public Lambda Functions
#
# Sets up the necessary resources to expose Lambda functions through an 
# Application Load Balancer. This includes:
# - Creating permissions for ALB to invoke Lambda
# - Creating target groups for each public Lambda
# - Registering Lambdas as targets
#------------------------------------------------------------------------------

# Permission for ALB to invoke Lambda functions
resource "aws_lambda_permission" "allow_alb" {
  for_each = {
    for k, v in var.lambda_functions : k => v
    if lookup(v, "public_facing", false) == true
  }

  statement_id  = "AllowExecutionFromALB"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.lambda_functions[each.key].function_name
  principal     = "elasticloadbalancing.amazonaws.com"
}

# Target groups for public-facing Lambdas
resource "aws_lb_target_group" "lambda_target_group" {
  for_each = {
    for k, v in var.lambda_functions : k => v
    if lookup(v, "public_facing", false) == true
  }

  name        = "${each.key}-tg"
  target_type = "lambda"

  health_check {
    healthy_threshold   = "2"
    interval            = "60"
    matcher             = "200"
    timeout             = "3"
    path                = "/api/v1/health"
    unhealthy_threshold = "4"
  }
}

# Register Lambda functions as targets
resource "aws_lb_target_group_attachment" "lambda_target_attachment" {
  for_each = {
    for k, v in var.lambda_functions : k => v
    if lookup(v, "public_facing", false) == true
  }

  target_group_arn = aws_lb_target_group.lambda_target_group[each.key].arn
  target_id        = aws_lambda_function.lambda_functions[each.key].arn
  depends_on       = [aws_lambda_permission.allow_alb]
}

# Attach target groups to the ALB listener
resource "aws_lb_listener_rule" "lambda_rule" {
  for_each = {
    for k, v in var.lambda_functions : k => v
    if lookup(v, "public_facing", false) == true
  }

  priority = 20 + index(keys(var.lambda_functions), each.key)

  listener_arn = var.https_listener_arn

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.lambda_target_group[each.key].arn
  }

  condition {
    path_pattern {
      values = ["/api/v1/${each.key}*"]
    }
  }
}