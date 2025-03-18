[
  {
    "name": "${app_name}",
    "image": "${app_image}",
    "cpu": ${fargate_cpu},
    "memory": ${fargate_memory},
    "networkMode": "awsvpc",
    "environment": [
      {"name": "DATABASE_HOST", "value": "${DATABASE_HOST}"},
      {"name": "DATABASE_PORT", "value": "${DATABASE_PORT}"},
      {"name": "DATABASE_NAME", "value": "${DATABASE_NAME}"},
      {"name": "DATABASE_USER", "value": "${DATABASE_USER}"},
      {"name": "DATABASE_PASSWORD", "value": "${DATABASE_PASSWORD}"},
      {"name": "CLUBS_SERVICE_BASE_URL", "value": "${CLUBS_SERVICE_BASE_URL}"},
      {"name": "OPENAI_API_KEY", "value": "${OPENAI_API_KEY}"},
      {"name": "JWT_SECRET_KEY", "value": "${JWT_SECRET_KEY}"},
      {"name": "S3_AWS_ACCESS_KEY", "value": "${S3_AWS_ACCESS_KEY}"},
      {"name": "S3_AWS_SECRET_KEY", "value": "${S3_AWS_SECRET_KEY}"},
      {"name": "STRIPE_WEBHOOK_SECRET", "value": "${STRIPE_WEBHOOK_SECRET}"}
    ],
    "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "${log_group}",
          "awslogs-region": "${aws_region}",
          "awslogs-stream-prefix": "ecs"
        }
    },
    "portMappings": [
      {
        "containerPort": ${app_port},
        "hostPort": ${app_port}
      }
    ]
  }
]
