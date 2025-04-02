#--------------------------------------------------------------
# Lambda Module Outputs
#--------------------------------------------------------------

output "lambda_function_arns" {
  description = "ARNs of the Lambda functions"
  value = {
    for name, function in aws_lambda_function.lambda_functions : name => function.arn
  }
}

output "lambda_function_names" {
  description = "Names of the Lambda functions"
  value = {
    for name, function in aws_lambda_function.lambda_functions : name => function.function_name
  }
}

output "lambda_function_invoke_arns" {
  description = "Invoke ARNs of the Lambda functions"
  value = {
    for name, function in aws_lambda_function.lambda_functions : name => function.invoke_arn
  }
}