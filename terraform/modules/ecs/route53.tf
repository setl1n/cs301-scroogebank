# Route53 DNS configuration
# This file defines the DNS records that point to the ALB

# Route53 record for the domain pointing to the ALB
resource "aws_route53_record" "alb" {
  zone_id = var.route53_zone_id
  name    = "alb.${var.certificate_domain}"
  type    = "A"

  alias {
    name                   = aws_alb.main.dns_name
    zone_id                = aws_alb.main.zone_id
    evaluate_target_health = true
  }
}
