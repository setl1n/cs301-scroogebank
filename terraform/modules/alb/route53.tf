#--------------------------------------------------------------
# Route53 DNS Configuration
#--------------------------------------------------------------
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
