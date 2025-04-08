#==============================================================================
# Lambda Module Outputs
# 
# This file defines the outputs exported by the Lambda module,
# providing references to created resources for use in other modules.
#==============================================================================

output "lambda_function_arns" {
  description = "Map of function names to their ARNs (Amazon Resource Names) - used for referencing functions in IAM policies"
  value = {
    for name, function in aws_lambda_function.lambda_functions : name => function.arn
  }
}

output "lambda_function_names" {
  description = "Map of function keys to their actual function names - used for CLI operations or monitoring"
  value = {
    for name, function in aws_lambda_function.lambda_functions : name => function.function_name
  }
}

output "lambda_function_invoke_arns" {
  description = "Map of function names to their invoke ARNs - required for API Gateway integrations"
  value = {
    for name, function in aws_lambda_function.lambda_functions : name => function.invoke_arn
  }
}