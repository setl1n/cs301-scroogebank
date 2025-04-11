#----------------------------------------
# Terraform Provider Configuration
# Configures the AWS provider with multiple regional aliases
#----------------------------------------
terraform {
  required_providers {
    aws = {
      source                = "hashicorp/aws"
      configuration_aliases = [aws.us-east-1, aws.ap-southeast-1]
    }
  }
}