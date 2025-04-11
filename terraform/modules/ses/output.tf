#----------------------------------------
# SES Module Outputs
# Defines outputs for the SES module including domain identities,
# verification tokens, and DKIM information
#----------------------------------------

output "domain_identity_arn" {
  description = "The ARN of the SES domain identity"
  value       = aws_ses_domain_identity.domain.arn
}

output "domain" {
  description = "The domain used for SES"
  value       = var.domain
}

output "mail_from_domain" {
  description = "The MAIL FROM domain"
  value       = var.create_domain_mail_from ? aws_ses_domain_mail_from.mail_from[0].mail_from_domain : null
}

output "verification_token" {
  description = "The verification token for the domain"
  value       = aws_ses_domain_identity.domain.verification_token
}

output "dkim_tokens" {
  description = "DKIM tokens for the domain"
  value       = aws_ses_domain_dkim.dkim.dkim_tokens
}

output "verified_emails" {
  description = "List of verified email addresses"
  value       = var.emails
}
