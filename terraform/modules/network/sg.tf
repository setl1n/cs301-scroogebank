resource "aws_security_group" "db_sg" {
  name   = "db-sg"
  vpc_id = aws_vpc.vpc.id
}

resource "aws_vpc_security_group_ingress_rule" "allow_mysql" {
  security_group_id            = aws_security_group.db_sg.id
  referenced_security_group_id = aws_security_group.ecs_tasks_sg.id
  from_port                    = 3306
  ip_protocol                  = "tcp"
  to_port                      = 3306
}

resource "aws_security_group" "lb_sg" {
  name   = "kickoff-lb-sg"
  vpc_id = aws_vpc.vpc.id
}

resource "aws_vpc_security_group_ingress_rule" "allow_http" {
  security_group_id = aws_security_group.lb_sg.id
  cidr_ipv4         = "0.0.0.0/0"
  from_port         = 80
  ip_protocol       = "tcp"
  to_port           = 80
}

resource "aws_vpc_security_group_ingress_rule" "allow_https" {
  security_group_id = aws_security_group.lb_sg.id
  cidr_ipv4         = "0.0.0.0/0"
  from_port         = 443
  ip_protocol       = "tcp"
  to_port           = 443
}

// CHANGE PORTS LATER
resource "aws_vpc_security_group_egress_rule" "allow_traffic_ecs" {
  security_group_id = aws_security_group.lb_sg.id
  cidr_ipv4         = "0.0.0.0/0"
  from_port         = 8000
  ip_protocol       = "tcp"
  to_port           = 8082
}

resource "aws_security_group" "ecs_tasks_sg" {
  name        = "ecs-tasks-sg"
  description = "Allow inbound access from the ALB only"
  vpc_id      = aws_vpc.vpc.id
}

resource "aws_vpc_security_group_ingress_rule" "allow_traffic_from_lb" {
  security_group_id            = aws_security_group.ecs_tasks_sg.id
  referenced_security_group_id = aws_security_group.lb_sg.id
  ip_protocol                  = "-1" # semantically equivalent to all ports
}

// REMOVE/CHANGE LATER IF ECS DOES NOT NEED TO ACESS ALL PORTS
// NEEDS TO ACCESS RDS
resource "aws_vpc_security_group_egress_rule" "allow_all_traffic_ipv4_ecs" {
  security_group_id = aws_security_group.ecs_tasks_sg.id
  cidr_ipv4         = "0.0.0.0/0"
  ip_protocol       = "-1" # semantically equivalent to all ports
}
