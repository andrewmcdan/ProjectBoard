# AMcDan10's K3S Project

This repo contains a containerized Next.js app plus Kubernetes manifests for Internet Programming.

## Building

1. Ensure Docker, minikube and kubectl are installed.
2. Install app dependencies
```
npm install
```
3. Start the local development server if needed
```
npm run dev
```
4. Start minikube
```
minikube start
```
5. Configure your terminal to use Minikube's Docker daemon
```
eval "$(minikube docker-env)"
```
6. Build the image
```
docker build -t amcdan10-app:v1 .
```
7. Deploy to minikube
```
kubectl apply -f minikube-deployment.yaml
```
8. Open the app
```
minikube service amcdan10-app
```
