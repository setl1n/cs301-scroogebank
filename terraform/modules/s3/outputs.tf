#----------------------------------------
# Bucket Identifiers
# Provides a map of bucket keys to their AWS resource IDs
# Useful for referencing buckets in other resources or modules
#----------------------------------------
output "bucket_ids" {
  description = "Map of bucket names to their IDs"
  value = {
    for k, v in aws_s3_bucket.bucket : k => v.id
  }
}

#----------------------------------------
# Website Endpoints
# Returns the URLs where the static websites can be accessed
# Only includes buckets where is_website = true
#----------------------------------------
output "website_endpoints" {
  description = "Map of website bucket names to their website endpoints"
  value = {
    for k, v in aws_s3_bucket_website_configuration.website : k => v.website_endpoint
  }
}

#----------------------------------------
# Index Document Configuration
# Maps each website bucket to its configured index document
# Useful for debugging or referencing in frontend deployment processes
#----------------------------------------
output "index_documents" {
  description = "Map of website bucket names to their index documents"
  value = {
    for k, v in var.buckets : k => v.index_document if v.is_website
  }
}