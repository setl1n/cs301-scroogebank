#--------------------------------------------------------------
# SQS Module Variables
#--------------------------------------------------------------

variable "queues" {
  description = "Map of SQS queues to create"
  type = map(object({
    name                       = string
    delay_seconds              = optional(number)
    max_message_size           = optional(number)
    message_retention_seconds  = optional(number)
    receive_wait_time_seconds  = optional(number)
    visibility_timeout_seconds = optional(number)
    tags                       = optional(map(string))
  }))
}
