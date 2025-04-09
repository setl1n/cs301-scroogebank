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
    tls = {
      source  = "hashicorp/tls"
      version = "~> 4.0"
    }
    local = {
      source  = "hashicorp/local"
      version = "~> 2.4"
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

# Provider for US East 1 region (required for CloudFront certificates)
provider "aws" {
  alias  = "us-east-1"
  region = "us-east-1"
}

# Provider for AP Southeast 1 region (explicit provider for regional resources)
provider "aws" {
  alias  = "ap-southeast-1"
  region = "ap-southeast-1"
}
