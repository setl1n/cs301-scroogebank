resource "aws_iam_policy" "lambda_sftp_policy" {
  name        = "lambda-sftp-policy"
  description = "Policy to allow Lambda to access the SFTP server"

  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Action   = ["s3:GetObject", "s3:PutObject"],
        Effect   = "Allow",
        Resource = "*"
      },
      {
        Action   = ["ec2:DescribeInstances"],
        Effect   = "Allow",
        Resource = "*"
      },
      {
        Action   = [
          "secretsmanager:GetSecretValue",
          "secretsmanager:DescribeSecret"
        ],
        Effect   = "Allow",
        Resource = "arn:aws:secretsmanager:*:*:secret:*"
      }
    ]
  })
}

# Create a policy attachment for the Lambda functions that need SFTP access
resource "aws_iam_role_policy_attachment" "lambda_sftp_access" {
  for_each = {
    for k, v in var.lambda_functions : k => v
    if contains(keys(v.environment_variables), "SFTP_PRIVATE_KEY_SECRET_NAME")
  }
  
  role       = aws_iam_role.lambda_role[each.key].name
  policy_arn = aws_iam_policy.lambda_sftp_policy.arn
}