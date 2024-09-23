# AzureProject
Azure Cloud-native CI/CD project with AKS/ACR

- Dockerised Node.js app with Rest API
- Image stored in Azure Container Registry
- Image runs on an Azure Kubernetes Service cluster inside a pod
- AKS LoadBalancer service to provide a public IP address/interface to direct HTTP requests to the pod where the server is running
- CI/CD build and release pipelines deployed using Self-hosted Agent Linux (Ubuntu 22.04) VM with Azure DevOps (pipelines triggered when code is committed to this repo) to build a new Docker image, push it to ACR and automatically deploy to the AKS cluster
- Prometheus monitoring for CPU/memory/disk usage of the AKS cluster
