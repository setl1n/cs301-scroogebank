# AWS Provider configuration for CloudFront and ACM (must be in us-east-1)
provider "aws" {
  alias  = "us-east-1"
  region = "us-east-1"
}
