# Auto Scaling configuration for ECS services
# This enables automatic scaling of tasks based on CPU utilization

# Defines the scalable target (the ECS service) with min/max capacity
resource "aws_appautoscaling_target" "app" {
  for_each           = var.services
  service_namespace  = "ecs"
  resource_id        = "service/${aws_ecs_cluster.service_cluster[each.key].name}/${aws_ecs_service.app[each.key].name}"
  scalable_dimension = "ecs:service:DesiredCount"
  role_arn           = aws_iam_role.ecs_autoscaling_role.arn
  min_capacity       = 1
  max_capacity       = 2

  depends_on = [aws_iam_role_policy_attachment.ecs_autoscaling_policy_attachment]
}

# Policy to scale up (add tasks) when CPU utilization increases
resource "aws_appautoscaling_policy" "scale_up" {
  for_each = var.services

  name               = "${each.key}-scale-up"
  service_namespace  = "ecs"
  resource_id        = "service/${aws_ecs_cluster.service_cluster[each.key].name}/${aws_ecs_service.app[each.key].name}"
  scalable_dimension = "ecs:service:DesiredCount"

  step_scaling_policy_configuration {
    adjustment_type         = "ChangeInCapacity"
    cooldown                = 60
    metric_aggregation_type = "Maximum"

    step_adjustment {
      metric_interval_lower_bound = 0
      scaling_adjustment          = 1
    }
  }

  depends_on = [aws_appautoscaling_target.app, ]
}

# Policy to scale down (remove tasks) when CPU utilization decreases
resource "aws_appautoscaling_policy" "scale_down" {
  for_each = var.services

  name               = "${each.key}-scale-down"
  service_namespace  = "ecs"
  resource_id        = "service/${aws_ecs_cluster.service_cluster[each.key].name}/${aws_ecs_service.app[each.key].name}"
  scalable_dimension = "ecs:service:DesiredCount"

  step_scaling_policy_configuration {
    adjustment_type         = "ChangeInCapacity"
    cooldown                = 60
    metric_aggregation_type = "Maximum"

    step_adjustment {
      metric_interval_lower_bound = 0
      scaling_adjustment          = -1
    }
  }

  depends_on = [aws_appautoscaling_target.app]
}

# CloudWatch alarm that triggers the scale-up policy when CPU is high
resource "aws_cloudwatch_metric_alarm" "cpu_high" {
  for_each            = var.services
  alarm_name          = "${each.key}-cpu-high"
  comparison_operator = "GreaterThanOrEqualToThreshold"
  evaluation_periods  = "2"
  metric_name         = "CPUUtilization"
  namespace           = "AWS/ECS"
  period              = "60"
  statistic           = "Average"
  threshold           = 85

  dimensions = {
    ClusterName = each.value.cluster_name
    ServiceName = "${each.key}-service"
  }

  alarm_actions = [aws_appautoscaling_policy.scale_up[each.key].arn]
}

# CloudWatch alarm that triggers the scale-down policy when CPU is low
resource "aws_cloudwatch_metric_alarm" "cpu_low" {
  for_each            = var.services
  alarm_name          = "${each.key}-cpu-low"
  comparison_operator = "LessThanOrEqualToThreshold"
  evaluation_periods  = "2"
  metric_name         = "CPUUtilization"
  namespace           = "AWS/ECS"
  period              = "60"
  statistic           = "Average"
  threshold           = 85

  dimensions = {
    ClusterName = each.value.cluster_name
    ServiceName = "${each.key}-service"
  }

  alarm_actions = [aws_appautoscaling_policy.scale_down[each.key].arn]
}