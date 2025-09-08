# ce10grp2-app

Application repository for CE10 group 2 capstone project

## Overview

This project is a full-stack 4-letter word guessing game ("Lingo") deployed on AWS EKS using Kubernetes.  
It consists of a Node.js API, a static frontend served by Nginx, and a Redis database for storing scores.  
**Deployment is managed using Helm charts and ArgoCD for GitOps-based continuous delivery.  
The repository follows a Git flow branching strategy to promote images from dev → uat → prod, with versioning maintained in each service folder.**

---

## Folder Structure

```
api/                # Node.js Express API service (with its own versioning)
  └── VERSION       # Version file for API
frontend/           # Static frontend (HTML/CSS/JS) served by Nginx (with its own versioning)
  └── VERSION       # Version file for frontend
helm/
  └── ce10grp2-app/ # Helm chart for deploying the app stack
      ├── Chart.yaml
      ├── values.yaml
      ├── values-dev.yaml
      ├── values-uat.yaml
      ├── values-prod.yaml
      └── templates/
argocd/             # ArgoCD Application manifests for GitOps deployment
  ├── dev-app.yaml
  ├── uat-app.yaml
  └── prod-app.yaml
.github/            # GitHub Actions workflows for CI/CD
```

---

## Git Flow & Promotion

- **Branches:**

  - `dev`: Development branch. All new features and fixes are merged here.
  - `uat`: User Acceptance Testing. Promotes tested images from `dev`.
  - `main` or `prod`: Production branch. Only stable, UAT-approved images are promoted here.

- **Promotion Process:**
  1. **Build & Tag Images:**
     - Each commit to `dev`, `uat`, or `main/prod` triggers CI to build and push images to your registry (e.g., AWS ECR).
     - Image tags are based on the commit SHA or the version in the `VERSION` file in each service folder.
  2. **Update Helm Values:**
     - Update the image tag in the relevant `values-*.yaml` file (`values-dev.yaml`, `values-uat.yaml`, `values-prod.yaml`).
  3. **Pull Request:**
     - Create a PR to promote changes from `dev` → `uat` → `main/prod`.
  4. **ArgoCD Sync:**
     - ArgoCD watches the branch and values file for each environment and syncs the deployment automatically.

---

## Versioning

- Each service (`api/`, `frontend/`) maintains its own `VERSION` file.
- Update the `VERSION` file when making a release.
- The CI pipeline uses this version for tagging Docker images.

---

## Local Development

### 1. Start API Locally

```sh
cd api
npm install
npm start
```

### 2. Start Frontend Locally

```sh
cd frontend
python3 -m http.server 8080
# or
npx serve . -l 8080
```

Visit [http://localhost:8080](http://localhost:8080).

### 3. (Optional) Run Redis Locally

```sh
docker run --name redis -p 6379:6379 -d redis:7-alpine
```

---

## Kubernetes Deployment (EKS) via ArgoCD

### 1. Build and Push Images

Build and push your API and frontend images to your container registry (e.g., AWS ECR), using the version from each service’s `VERSION` file.

### 2. Update Image Tags

Update the image tags in the appropriate Helm values file:

- `helm/ce10grp2-app/values-dev.yaml`
- `helm/ce10grp2-app/values-uat.yaml`
- `helm/ce10grp2-app/values-prod.yaml`

### 3. Commit & Push Changes

Push your changes to the corresponding branch (`dev`, `uat`, or `main/prod`).

### 4. ArgoCD Setup

- Ensure ArgoCD is installed and running in your EKS cluster.
- Apply the ArgoCD Application manifest for your environment:

```sh
kubectl apply -f argocd/dev-app.yaml -n argocd
kubectl apply -f argocd/uat-app.yaml -n argocd
kubectl apply -f argocd/prod-app.yaml -n argocd
```

- ArgoCD will automatically sync the Helm chart from your repo and deploy to EKS.

### 5. Monitor Deployment

- Use the ArgoCD UI or CLI to monitor sync and health.
- Or check resources in your namespace:

```sh
kubectl get all -n ce10grp2-dev
kubectl get all -n ce10grp2-uat
kubectl get all -n ce10grp2-prod
```

---

## Helm Chart Structure

- `Chart.yaml` – Chart metadata
- `values.yaml` – Default values
- `values-dev.yaml`, `values-uat.yaml`, `values-prod.yaml` – Environment-specific overrides
- `templates/` – Kubernetes manifests (Deployment, Service, Ingress, etc.)

---

## ArgoCD Application

- `argocd/dev-app.yaml`, `argocd/uat-app.yaml`, `argocd/prod-app.yaml` – Define GitOps deployment for each environment, referencing the Helm chart and values files.

---

## API Endpoints

- `GET /api/word` – Get a random 4-letter word
- `POST /api/score` – Submit game score
- `GET /api/scores` – Get top scores
- `GET /health` – Health check

---

## Frontend

Static files:

- [frontend/index.html](frontend/index.html)
- [frontend/script.js](frontend/script.js)
- [frontend/style.css](frontend/style.css)  
  Nginx config: [frontend/nginx.conf](frontend/nginx.conf)

---

## CI/CD

- [GitHub Actions](.github/workflows/deploy.yaml) builds and pushes images on code changes, tags images using the service `VERSION` file, and can update Helm values files automatically.

---

## License

MIT (or specify your license here)
