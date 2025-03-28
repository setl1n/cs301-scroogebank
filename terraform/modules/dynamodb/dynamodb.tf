resource "aws_dynamodb_table" "logs_table" {
  name           = var.table_name
  billing_mode   = var.billing_mode
  hash_key       = var.hash_key
  range_key      = var.range_key
  read_capacity  = var.billing_mode == "PROVISIONED" ? var.read_capacity : null
  write_capacity = var.billing_mode == "PROVISIONED" ? var.write_capacity : null

  # Define attribute types for the keys
  attribute {
    name = var.hash_key
    type = "S"  # String type
  }

  attribute {
    name = var.range_key
    type = "S"  # String type for timestamp
  }

  # Enable point-in-time recovery
  point_in_time_recovery {
    enabled = true
  }

  # Configure TTL for log expiration
  ttl {
    attribute_name = var.ttl_attribute
    enabled        = var.ttl_enabled
  }
  
  # Optional: Enable DynamoDB streams if needed for log processing
  stream_enabled   = true
  stream_view_type = "NEW_AND_OLD_IMAGES"

  # Add tags
  tags = merge(
    {
      Name = var.table_name
      Service = "Logging"
    },
    var.tags
  )
}