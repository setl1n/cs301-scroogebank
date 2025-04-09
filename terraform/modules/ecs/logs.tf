# CloudWatch Logs configuration for ECS services
# These resources enable log collection and storage for each service

#--------------------------------------------------------------
# CloudWatch Log Groups
# Each service gets its own log group with defined retention
# policy to manage storage costs
#--------------------------------------------------------------

# Log groups for each service with a 30-day retention policy
resource "aws_cloudwatch_log_group" "log_group" {
  for_each          = var.services
  name              = "/ecs/${each.key}"
  retention_in_days = 30

  tags = {
    Name = "${each.key}-log-group"
  }
}

#--------------------------------------------------------------
# CloudWatch Log Streams
# Streams within log groups organize container logs by service
# and make them easier to find and analyze
#--------------------------------------------------------------

# Log streams within each log group for organizing container logs
resource "aws_cloudwatch_log_stream" "log_stream" {
  for_each       = var.services
  name           = "${each.key}-log-stream"
  log_group_name = aws_cloudwatch_log_group.log_group[each.key].name
}