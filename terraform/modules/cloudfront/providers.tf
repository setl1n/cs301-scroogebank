# ---------------------------------------------------------------------------------------------------------------------
# AWS Provider configuration for CloudFront and ACM
# ---------------------------------------------------------------------------------------------------------------------

# AWS Provider configuration for CloudFront and ACM (must be in us-east-1)
# Both ACM certificates used with CloudFront and global WAF resources 
# must be created in the us-east-1 region regardless of where your other resources are located
provider "aws" {
  alias  = "us-east-1"
  region = "us-east-1"
}
