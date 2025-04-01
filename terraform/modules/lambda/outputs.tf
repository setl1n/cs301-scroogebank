output "lambda_function_arns" {
  value       = { for lambda in aws_lambda_function.lambda_functions : lambda.function_name => lambda.arn }
  description = "Map of Lambda function names to their ARNs"
}