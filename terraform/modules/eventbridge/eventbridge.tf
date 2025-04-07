resource "aws_cloudwatch_event_rule" "SFTP_fetch" {
  name                = var.rule_name
  description         = var.rule_description
  schedule_expression = "cron(0 0 * * ? *)" # Fires every day at midnight UTC
}

resource "aws_cloudwatch_event_target" "transaction_lambda_target" {
  rule = aws_cloudwatch_event_rule.SFTP_fetch.name
  arn  = var.target_arn
  input = jsonencode({
    operation     = "dailyFetch"
    transactionId = ""
    transaction   = {}
  })
}

resource "aws_iam_role" "eventbridge_role" {
  name = var.role_name

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "events.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_role_policy" "eventbridge_policy" {
  name = "${var.role_name}-policy"
  role = aws_iam_role.eventbridge_role.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action   = "lambda:InvokeFunction"
        Effect   = "Allow"
        Resource = var.target_arn
      }
    ]
  })
}