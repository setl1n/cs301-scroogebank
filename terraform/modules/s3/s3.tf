resource "aws_s3_bucket" "bucket" {
  for_each = var.buckets

  bucket        = each.value.name
  force_destroy = true

}

# Website configuration for website buckets
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

# Ownership controls for all buckets
resource "aws_s3_bucket_ownership_controls" "bucket_ownership" {
  for_each = var.buckets

  bucket = aws_s3_bucket.bucket[each.key].id

  rule {
    object_ownership = "BucketOwnerPreferred"
  }
}

# Public access policy for website buckets
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

# Allow public access settings for website buckets
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

# Block public access for private buckets
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
