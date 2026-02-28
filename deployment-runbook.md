# Hello World Deployment Runbook

## Overview
This runbook provides step-by-step instructions for deploying the Hello World application to Kubernetes environments.

## Prerequisites
- kubectl configured with cluster access
- Docker registry access (GitHub Container Registry)
- Kubernetes cluster with ingress controller
- cert-manager installed for TLS certificates

## Deployment Environments

### Staging Environment
- **Namespace**: hello-world-staging
- **URL**: https://hello-world-staging.example.com
- **Replicas**: 1
- **Resources**: 64Mi memory, 50m CPU

### Production Environment
- **Namespace**: hello-world-production
- **URL**: https://hello-world.example.com
- **Replicas**: 3
- **Resources**: 128Mi memory, 100m CPU

## Automated Deployment

Deployments are automatically triggered via GitHub Actions:
- **Staging**: On push to `develop` branch
- **Production**: On push to `main` branch

## Manual Deployment Steps

### 1. Build and Push Docker Image
```bash
# Build image
docker build -t ghcr.io/username/hello-world:v1.0.0 .

# Push to registry
docker push ghcr.io/username/hello-world:v1.0.0
```

### 2. Deploy to Staging
```bash
# Apply staging configuration
kubectl apply -k kustomize/overlays/staging

# Verify deployment
kubectl rollout status deployment/hello-world -n hello-world-staging

# Check pods
kubectl get pods -n hello-world-staging
```

### 3. Deploy to Production
```bash
# Apply production configuration
kubectl apply -k kustomize/overlays/production

# Verify deployment
kubectl rollout status deployment/hello-world -n hello-world-production

# Check pods
kubectl get pods -n hello-world-production
```

## Health Checks

### Application Health
```bash
# Check application health
curl https://hello-world.example.com/health

# Check readiness
curl https://hello-world.example.com/ready
```

### Kubernetes Health
```bash
# Check deployment status
kubectl get deployment hello-world -n hello-world-production

# Check pod logs
kubectl logs -f deployment/hello-world -n hello-world-production

# Check HPA status
kubectl get hpa hello-world -n hello-world-production
```

## Rollback Procedures

### Automatic Rollback
The CI/CD pipeline includes automated health checks that will trigger rollback if:
- Health check endpoints return non-200 status
- Deployment fails to reach ready state within 10 minutes
- Error rate exceeds 5% for 5 consecutive minutes

### Manual Rollback
```bash
# List deployment history
kubectl rollout history deployment/hello-world -n hello-world-production

# Rollback to previous version
kubectl rollout undo deployment/hello-world -n hello-world-production

# Rollback to specific revision
kubectl rollout undo deployment/hello-world --to-revision=2 -n hello-world-production

# Verify rollback
kubectl rollout status deployment/hello-world -n hello-world-production
```

## Monitoring and Alerts

### Key Metrics to Monitor
- **Response Time**: < 500ms for 95th percentile
- **Error Rate**: < 1% over 5-minute window
- **CPU Utilization**: < 70% average
- **Memory Utilization**: < 80% average
- **Pod Availability**: All pods in Ready state

### Log Locations
```bash
# Application logs
kubectl logs -f deployment/hello-world -n hello-world-production

# Ingress controller logs
kubectl logs -f deployment/ingress-nginx-controller -n ingress-nginx
```

## Troubleshooting

### Common Issues

#### Pods Not Starting
```bash
# Check pod events
kubectl describe pod <pod-name> -n hello-world-production

# Check resource constraints
kubectl top pods -n hello-world-production
```

#### Ingress Not Working
```bash
# Check ingress status
kubectl describe ingress hello-world -n hello-world-production

# Verify TLS certificate
kubectl get certificate hello-world-tls -n hello-world-production
```

#### High Resource Usage
```bash
# Check HPA status
kubectl get hpa hello-world -n hello-world-production

# Scale manually if needed
kubectl scale deployment hello-world --replicas=5 -n hello-world-production
```

## Security Considerations

- All containers run as non-root user (UID 1001)
- Read-only root filesystem enabled
- Network policies restrict pod-to-pod communication
- Secrets are stored in Kubernetes secrets (not in code)
- Regular security scanning via CI/CD pipeline

## Maintenance Windows

### Scheduled Maintenance
- **Staging**: Anytime during business hours
- **Production**: Sundays 2:00-4:00 AM UTC

### Emergency Maintenance
- Can be performed anytime with proper approval
- Requires notification to stakeholders
- Must include rollback plan

## Contact Information

- **DevOps Team**: devops@company.com
- **On-Call Engineer**: +1-555-0123
- **Release Manager**: release-manager@company.com

## Documentation Updates

This runbook should be updated whenever:
- Deployment procedures change
- New environments are added
- Monitoring thresholds are modified
- Contact information changes