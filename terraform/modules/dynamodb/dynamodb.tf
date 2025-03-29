#----------------------------------------
# DynamoDB table creation
# Only define attributes on the table object 
# that are going to be used as hash or range key
#----------------------------------------
resource "aws_dynamodb_table" "logs_table" {
  name           = var.table_name
  billing_mode   = var.billing_mode
  hash_key       = var.hash_key
  range_key      = var.range_key
  read_capacity  = var.billing_mode == "PROVISIONED" ? var.read_capacity : null
  write_capacity = var.billing_mode == "PROVISIONED" ? var.write_capacity : null

  attribute {
    name = var.hash_key
    type = "S"
  }

  attribute {
    name = var.range_key
    type = "S"
  }

  point_in_time_recovery {
    enabled = true
  }

  ttl {
    attribute_name = var.ttl_attribute
    enabled        = var.ttl_enabled
  }
  
  stream_enabled   = false

  # Add tags
  tags = merge(
    {
      Name = var.table_name
      Service = "Logging"
    },
    var.tags
  )
}