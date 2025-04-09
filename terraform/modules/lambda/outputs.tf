#--------------------------------------------------------------
# Lambda Module Outputs
# 
# This file defines the outputs exported by the Lambda module,
# providing references to created resources for use in other modules.
#
# These outputs enable other modules to reference Lambda functions
# without having to know the internal details of how they were created.
#--------------------------------------------------------------

output "lambda_function_arns" {
  description = "Map of function names to their ARNs (Amazon Resource Names)"
  value = {
    for name, function in aws_lambda_function.lambda_functions : name => function.arn
  }
}

output "lambda_function_names" {
  description = "Map of function keys to their actual function names"
  value = {
    for name, function in aws_lambda_function.lambda_functions : name => function.function_name
  }
}

output "lambda_function_invoke_arns" {
  description = "Map of function names to their invoke ARNs"
  value = {
    for name, function in aws_lambda_function.lambda_functions : name => function.invoke_arn
  }
}