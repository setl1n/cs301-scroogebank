#--------------------------------------------------------------
# Terraform Configuration
# Defines the backend, required providers, and minimum Terraform version
#--------------------------------------------------------------
terraform {
  # Remote state storage in S3
  # Configuration parameters (bucket, key, region) should be provided via CLI or config file
  backend "s3" {
  }

  # Define provider requirements
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  # Ensure compatible Terraform CLI version
  required_version = ">= 1.2.0"
}

#--------------------------------------------------------------
# AWS Provider Configuration
# Sets up the AWS provider for resource provisioning
#--------------------------------------------------------------
provider "aws" {
  alias  = "default"
  region = "ap-southeast-1" # Singapore region
}
