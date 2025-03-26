output "bucket_ids" {
  description = "Map of bucket names to their IDs"
  value = {
    for k, v in aws_s3_bucket.bucket : k => v.id
  }
}

output "website_endpoints" {
  description = "Map of website bucket names to their website endpoints"
  value = {
    for k, v in aws_s3_bucket_website_configuration.website : k => v.website_endpoint
  }
}