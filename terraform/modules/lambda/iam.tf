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
      }
    ]
  })
}