# AMcDan10's K3S Project

This repo has the files created for Internet Programming. 

## Building

1. Ensure Docker, minikube and kubectl are installed.
2. Start minikube
```
minikube start
```
3. Configure your terminal to use Minikube’s Docker daemon
```
eval "$(minikube docker-env)"
```
4. Build the image
```
docker build -t amcdan10-app:v1 .
```
5. Deploy to minikube
```
kubectl apply -f minikube-deployment.yaml
```
6. Open the app
```
minikube service amcdan10-app
```
