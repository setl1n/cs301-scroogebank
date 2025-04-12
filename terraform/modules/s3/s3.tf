#----------------------------------------
# Primary S3 Bucket Resources
# Creates a bucket for each entry in the var.buckets map
#----------------------------------------
resource "aws_s3_bucket" "bucket" {
  for_each = var.buckets

  bucket        = each.value.name
  force_destroy = true
}

#----------------------------------------
# Logging Configuration
# Enable access logging for all buckets
#----------------------------------------
resource "aws_s3_bucket_logging" "bucket_logging" {
  for_each = var.buckets

  bucket = aws_s3_bucket.bucket[each.key].id

  target_bucket = aws_s3_bucket.logging_bucket.id
  target_prefix = "${each.value.name}/"
}

#----------------------------------------
# Website Configuration
# Only applied to buckets where is_website = true
#----------------------------------------
resource "aws_s3_bucket_website_configuration" "website" {
  for_each = {
    for k, v in var.buckets : k => v if v.is_website
  }

  bucket = aws_s3_bucket.bucket[each.key].id

  index_document {
    suffix = each.value.index_document
  }

  error_document {
    key = each.value.error_document
  }
}

#----------------------------------------
# Ownership Controls
# Sets the object ownership to "BucketOwnerPreferred" to simplify permissions
#----------------------------------------
resource "aws_s3_bucket_ownership_controls" "bucket_ownership" {
  for_each = var.buckets

  bucket = aws_s3_bucket.bucket[each.key].id

  rule {
    object_ownership = "BucketOwnerPreferred"
  }
}

#----------------------------------------
# Public Access Policy
# Creates IAM policies that allow public read access for website content
#----------------------------------------
resource "aws_s3_bucket_policy" "website_policy" {
  for_each = {
    for k, v in var.buckets : k => v if v.is_website
  }

  # Add explicit dependency on the public access block
  depends_on = [aws_s3_bucket_public_access_block.website_buckets]

  bucket = aws_s3_bucket.bucket[each.key].id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid       = "PublicReadGetObject"
        Effect    = "Allow"
        Principal = "*"
        Action = [
          "s3:GetObject"
        ]
        Resource = [
          "${aws_s3_bucket.bucket[each.key].arn}/*"
        ]
      }
    ]
  })
}

#----------------------------------------
# Website Public Access Settings
# Disables all public access blocks to allow website access
#----------------------------------------
resource "aws_s3_bucket_public_access_block" "website_buckets" {
  for_each = {
    for k, v in var.buckets : k => v if v.is_website
  }

  bucket = aws_s3_bucket.bucket[each.key].id

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

#----------------------------------------
# Private Bucket Security
# Enables all public access blocks for non-website buckets for security
#----------------------------------------
resource "aws_s3_bucket_public_access_block" "private_buckets" {
  for_each = {
    for k, v in var.buckets : k => v if !v.is_website
  }

  bucket = aws_s3_bucket.bucket[each.key].id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}


#----------------------------------------
# Logging Bucket for S3 Access Logs
# Central bucket to store all access logs from other buckets
#----------------------------------------
resource "aws_s3_bucket" "logging_bucket" {
  bucket        = "cs301g2t1-s3-access-logs-bucket"
  force_destroy = true
}

# Ensure the logging bucket itself has appropriate security settings
resource "aws_s3_bucket_public_access_block" "logging_bucket_access" {
  bucket = aws_s3_bucket.logging_bucket.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# Set ownership controls for logging bucket
resource "aws_s3_bucket_ownership_controls" "logging_bucket_ownership" {
  bucket = aws_s3_bucket.logging_bucket.id

  rule {
    object_ownership = "BucketOwnerPreferred"
  }
}

# Implement lifecycle policy for log rotation
resource "aws_s3_bucket_lifecycle_configuration" "logging_bucket_lifecycle" {
  bucket = aws_s3_bucket.logging_bucket.id

  rule {
    id     = "log-rotation"
    status = "Enabled"

    expiration {
      days = 90 # Keep logs for 90 days
    }
  }
}
