# AzureProject
Azure Cloud-native CI/CD project with AKS/ACR

- Dockerised Node.js app with Rest API: image stored in Azure Container Registry
- Image runs on an Azure Kubernetes Service cluster inside a pod
- AKS LoadBalancer service to provide a public IP address/interface to send HTTP requests to the pod
