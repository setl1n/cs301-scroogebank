#--------------------------------------------------------------
# CS301 Group 2 Team 1 Project - SQS Module
#
# This module creates Amazon SQS queues for message processing
#--------------------------------------------------------------

resource "aws_sqs_queue" "queues" {
  for_each = var.queues

  name                       = each.value.name
  delay_seconds              = lookup(each.value, "delay_seconds", 0)
  max_message_size           = lookup(each.value, "max_message_size", 262144)
  message_retention_seconds  = lookup(each.value, "message_retention_seconds", 345600)
  receive_wait_time_seconds  = lookup(each.value, "receive_wait_time_seconds", 0)
  visibility_timeout_seconds = lookup(each.value, "visibility_timeout_seconds", 30)

  tags = lookup(each.value, "tags", {})
}
