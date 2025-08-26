# ce10grp2-app

Application repository for CE10 group 2 capstone project

## Overview

This project is a full-stack 4-letter word guessing game ("Lingo") deployed on Kubernetes. It consists of a Node.js API, a static frontend served by Nginx, and a Redis database for storing scores. The infrastructure is managed using Kustomize overlays for different environments (dev, uat, prod).

## Folder Structure

```
api/         # Node.js Express API service
frontend/    # Static frontend (HTML/CSS/JS) served by Nginx
k8s/         # Kubernetes manifests (base & overlays)
.github/     # GitHub Actions workflows
minikube_testing.txt # Local minikube deployment instructions
```

## Setup

### Prerequisites

- Docker
- Node.js (>=18)
- Minikube or Kubernetes cluster
- kubectl
- kustomize

### Local Development

#### 1. Start Minikube

See [minikube_testing.txt](minikube_testing.txt) for step-by-step instructions.

#### 2. Build Docker Images

```sh
docker build -t lingo-api:latest ./api
docker build -t lingo-frontend:latest ./frontend
```

#### 3. Load Images into Minikube

```sh
minikube image load lingo-api:latest
minikube image load lingo-frontend:latest
```

#### 4. Deploy to Kubernetes

```sh
kubectl apply -f k8s/overlays/dev/namespace.yaml
kubectl apply -k k8s/overlays/dev/
```

#### 5. Port Forward Frontend

```sh
kubectl port-forward -n lingo-game-dev service/frontend-service 8080:80
```

Visit [http://localhost:8080](http://localhost:8080) in your browser.

## Deployment

### GitHub Actions

See [deploy.yaml](.github/workflows/deploy.yaml) for CI/CD pipeline. On push to `main`, `dev`, or `uat` branches, images are built and deployed to the corresponding Kubernetes namespace using Kustomize overlays.

### Kustomize Overlays

- [k8s/overlays/dev](k8s/overlays/dev/kustomization.yaml)
- [k8s/overlays/uat](k8s/overlays/uat/kustomization.yaml)
- [k8s/overlays/prod](k8s/overlays/prod/kustomization.yaml)

## API Endpoints

- `GET /api/word` – Get a random 4-letter word
- `POST /api/score` – Submit game score
- `GET /api/scores` – Get top scores
- `GET /health` – Health check

## Frontend

Static files: [frontend/index.html](frontend/index.html), [frontend/script.js](frontend/script.js), [frontend/style.css](frontend/style.css)  
Nginx config: [frontend/nginx.conf](frontend/nginx.conf)

## Kubernetes Manifests

- Base resources: [k8s/base](k8s/base/kustomization.yaml)
- Overlays: dev, uat, prod

## License

MIT (or specify your license here)
