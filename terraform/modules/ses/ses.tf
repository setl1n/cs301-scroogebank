#----------------------------------------
# SES Domain Identity Configuration
# Sets up Amazon SES domain identity and verification
# Enables sending emails from the configured domain
#----------------------------------------

# Domain identity
resource "aws_ses_domain_identity" "domain" {
  domain = var.domain
}

# Domain verification
resource "aws_route53_record" "domain_verification" {
  count   = var.enable_verification ? 1 : 0
  zone_id = var.zone_id
  name    = "_amazonses.${var.domain}"
  type    = "TXT"
  ttl     = "600"
  records = [aws_ses_domain_identity.domain.verification_token]
}

#----------------------------------------
# DKIM Configuration
# Configures DomainKeys Identified Mail for the domain
# Improves email deliverability and authenticity verification
#----------------------------------------

# DKIM configuration
resource "aws_ses_domain_dkim" "dkim" {
  domain = aws_ses_domain_identity.domain.domain
}

resource "aws_route53_record" "dkim" {
  count   = var.enable_verification ? 3 : 0
  zone_id = var.zone_id
  name    = "${aws_ses_domain_dkim.dkim.dkim_tokens[count.index]}._domainkey.${var.domain}"
  type    = "CNAME"
  ttl     = "600"
  records = ["${aws_ses_domain_dkim.dkim.dkim_tokens[count.index]}.dkim.amazonses.com"]
}

#----------------------------------------
# Mail From Domain Configuration
# Sets up custom MAIL FROM domain and related DNS records
# Includes MX and SPF records for proper mail delivery
#----------------------------------------

# Mail From domain
resource "aws_ses_domain_mail_from" "mail_from" {
  count            = var.create_domain_mail_from ? 1 : 0
  domain           = aws_ses_domain_identity.domain.domain
  mail_from_domain = var.mail_from_domain != null ? var.mail_from_domain : "mail.${var.domain}"
}

# Mail From MX record
resource "aws_route53_record" "mail_from_mx" {
  count   = var.create_domain_mail_from && var.enable_verification ? 1 : 0
  zone_id = var.zone_id
  name    = aws_ses_domain_mail_from.mail_from[0].mail_from_domain
  type    = "MX"
  ttl     = "600"
  records = ["10 feedback-smtp.${data.aws_region.current.name}.amazonses.com"]
}

# Mail From SPF record
resource "aws_route53_record" "mail_from_spf" {
  count   = var.create_domain_mail_from && var.enable_verification ? 1 : 0
  zone_id = var.zone_id
  name    = aws_ses_domain_mail_from.mail_from[0].mail_from_domain
  type    = "TXT"
  ttl     = "600"
  records = ["v=spf1 include:amazonses.com ~all"]
}

#----------------------------------------
# Email Identity Verification
# Verifies individual email addresses for sending
# Creates SES receipt rule set for email handling
#----------------------------------------

# Email identity verification
resource "aws_ses_email_identity" "email" {
  count = length(var.emails)
  email = var.emails[count.index]
}

# Get current region
data "aws_region" "current" {}

# Create a default sending rule set
resource "aws_ses_receipt_rule_set" "main" {
  rule_set_name = "${var.domain}-rules"
}
