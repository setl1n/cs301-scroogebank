output "eventbridge_rule_arn" {
  description = "The ARN of the EventBridge rule"
  value       = aws_cloudwatch_event_rule.SFTP_fetch.arn
}

output "eventbridge_target_arn" {
  description = "The ARN of the EventBridge target"
  value       = aws_cloudwatch_event_target.transaction_lambda_target.arn
}

output "eventbridge_role_arn" {
  description = "The ARN of the IAM role for EventBridge"
  value       = aws_iam_role.eventbridge_role.arn
}