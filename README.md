[![Open in Visual Studio Code](https://classroom.github.com/assets/open-in-vscode-2e0aaae1b6195c2367325f4f02e2d04e9abb55f0b24a779b69b11b9e10269abc.svg)](https://classroom.github.com/online_ide?assignment_repo_id=17700455&assignment_repo_type=AssignmentRepo)
# Banking System Application

A comprehensive banking system with microservice architecture, featuring client management, transaction processing, account management, and user authentication.

## Project Structure

### Frontend
- **Technology Stack**: React, TypeScript, Vite, Material UI
- **Key Features**:
  - Client Management Dashboard
  - Authentication via OIDC/Cognito
  - Responsive Design

### Backend
- **Architecture**: Microservices-based
- **Services**:
  - **User Service**: Authentication and user management
  - **Client Service**: Client information management
  - **Account Service**: Banking account management
  - **Transaction Service**: Financial transaction processing
  - **Verification Service**: KYC and identity verification
  - **Log Service**: System logging and audit trails

### Infrastructure
- **Deployment**: AWS Cloud Infrastructure
- **IaC**: Terraform for infrastructure provisioning
- **CI/CD**: GitHub Actions

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- Java 21
- Maven 3.8+
- Docker and Docker Compose
- AWS CLI configured (for deployment)

### Development Setup

#### Frontend
```bash
cd frontend
npm install
npm run dev
```

#### Backend Microservices
Each service can be run individually:
```bash
cd backend/[service-name]
./mvnw spring-boot:run
```

Or using Docker:
```bash
cd backend/[service-name]
docker build -t banking-[service-name] .
docker run -p [port]:[port] banking-[service-name]
```

### Environment Configuration
- Frontend environment variables are in `.env`, `.env.development`, and `.env.production`
- Backend services use application properties in their respective directories

## Deployment

### Local Testing
```bash
docker-compose up  # If docker-compose file is available
```

### AWS Deployment
```bash
cd terraform
terraform init
terraform apply -var-file=.tfvars
```

## Architecture Overview

The system follows a microservice architecture pattern with:
- Frontend SPA communicating with backend services
- Authentication handled via AWS Cognito
- Services communicating via RESTful APIs and message queues
- Data persistence with PostgreSQL and Redis

## Contributing

1. Create feature branches from main
2. Submit PRs with detailed descriptions
3. Ensure all tests pass before merging

## License

This project is part of CS301 (IT System Architecture) coursework.
