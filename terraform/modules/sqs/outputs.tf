#----------------------------------------
# SQS Module Outputs
# Exposes queue URLs and ARNs for integration
# Provides organized access to resource identifiers
#----------------------------------------

output "queue_urls" {
  description = "Map of queue names to their URLs"
  value = {
    for k, v in aws_sqs_queue.queues : k => v.url
  }
}

output "queue_arns" {
  description = "Map of queue names to their ARNs"
  value = {
    for k, v in aws_sqs_queue.queues : k => v.arn
  }
}
