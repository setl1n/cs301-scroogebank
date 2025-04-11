resource "aws_service_discovery_private_dns_namespace" "ecs_namespace" {
  name = "ecs.internal"
  vpc  = var.vpc_id
}

resource "aws_service_discovery_service" "service" {
  for_each = var.services

  name = each.key
  dns_config {
    namespace_id = aws_service_discovery_private_dns_namespace.ecs_namespace.id
    dns_records {
      type = "A"
      ttl  = 60
    }
    routing_policy = "MULTIVALUE"
  }

  health_check_custom_config {
    failure_threshold = 1
  }
}