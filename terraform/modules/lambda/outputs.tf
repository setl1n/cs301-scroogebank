# Output the names of all Lambda functions
output "lambda_function_names" {
  value       = [for lambda in aws_lambda_function.lambda_functions : lambda.function_name]
  description = "List of Lambda function names"
}

# Output the ARNs of all Lambda functions
output "lambda_function_arns" {
  value       = [for lambda in aws_lambda_function.lambda_functions : lambda.arn]
  description = "List of Lambda function ARNs"
}

# Output the IAM roles associated with each Lambda function
output "lambda_function_roles" {
  value       = { for key, lambda in aws_lambda_function.lambda_functions : key => aws_iam_role.lambda_role[key].arn }
  description = "Map of Lambda function names to their IAM role ARNs"
}

# Output the environment variables for each Lambda function
output "lambda_function_environment_variables" {
  value       = { for key, lambda in aws_lambda_function.lambda_functions : key => lambda.environment.variables }
  description = "Map of Lambda function names to their environment variables"
}