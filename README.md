# BlogSpace — MERN Major Project

**Course:** Web Application Projects with React (CSE 3395)  
**Topic:** Containerization, Cloud Deployment and CI/CD Automation of a MERN Stack Blog Application

This repository implements a working MERN blog application and the assignment deliverables:
- React + Vite frontend using TanStack Query
- Node.js + Express backend
- MongoDB with Mongoose
- Frontend and backend Dockerfiles and `.dockerignore` files
- Docker Compose for frontend, backend and MongoDB
- Docker Hub image publishing
- Google Cloud Run deployment
- GitHub Actions CI and CD workflows

---

## 1. Prerequisites

Install:
1. Node.js 22 LTS and npm: https://nodejs.org/
2. Git: https://git-scm.com/downloads
3. Docker Desktop: https://www.docker.com/products/docker-desktop/
4. VS Code: https://code.visualstudio.com/
5. Accounts: GitHub, Docker Hub, MongoDB Atlas and Google Cloud.

Start Docker Desktop before running Docker commands.

Check installations in the VS Code terminal:

```bash
node --version
npm --version
git --version
docker --version
docker compose version
```

---

## 2. Open the project in VS Code

1. Extract the ZIP file.
2. Open VS Code.
3. Select **File → Open Folder**.
4. Select the extracted `mern-major-project` folder.
5. Open **Terminal → New Terminal**.

The repository structure is:

```text
mern-major-project/
├── backend/
│   ├── config/db.js
│   ├── models/Post.js
│   ├── routes/postRoutes.js
│   ├── utils/validatePost.js
│   ├── tests/validatePost.test.js
│   ├── server.js
│   ├── package.json
│   ├── Dockerfile
│   ├── .dockerignore
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── services/api.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── .dockerignore
│   └── .env.example
├── .github/workflows/
│   ├── ci.yml
│   └── cd.yml
├── docker-compose.yml
├── .gitignore
├── README.md
└── PROJECT-REPORT-TEMPLATE.md
```

---

## 3. Run locally without Docker (optional first check)

### Backend

Open Terminal 1:

```bash
cd backend
npm install
```

Copy `.env.example` to `.env` and edit the connection string:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/mern_blog
```

This local-only option requires a MongoDB server installed and running on your computer. If you do not have one, use the Docker Compose procedure in Section 4 instead.

Start the backend:

```bash
npm run dev
```

### Frontend

Open Terminal 2 at the repository root:

```bash
cd frontend
npm install
```

Copy `.env.example` to `.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

Start Vite:

```bash
npm run dev
```

Open http://localhost:5173.

---

## 4. Run the complete application using Docker Compose (recommended)

This is the main local demonstration required by the assignment. Docker Compose starts all three services:
- `frontend`: React production build served by Nginx on port 8080
- `backend`: Express API on port 5000
- `mongodb`: MongoDB 7 on port 27017, with a persistent named volume

Make sure Docker Desktop is running. From the repository root, run:

```bash
docker compose up --build -d
```

Check service status:

```bash
docker compose ps
```

Expected services: `frontend`, `backend`, and `mongodb`. Wait until MongoDB is healthy and the backend is running.

Open:
- Blog website: http://localhost:8080
- Backend health check: http://localhost:5000/api/health
- Posts API: http://localhost:5000/api/posts

Use the website to create a post. Refresh the page; the post should remain because MongoDB data is stored in the `mongo_data` Docker volume. Try deleting a post too.

Useful commands:

```bash
# Follow all logs
docker compose logs -f

# Follow only backend logs
docker compose logs -f backend

# Stop and remove containers/network (keeps database volume)
docker compose down

# Start again
docker compose up -d

# Stop containers AND delete the local MongoDB data volume
# WARNING: this permanently deletes the local Compose database data
docker compose down -v
```

### How frontend-to-backend networking works locally

The Vite production build uses `/api` as its API base URL. Nginx serves the React files and proxies `/api/` requests to the Compose service named `backend`. Docker's internal DNS resolves that service name. The browser does not need to know the backend container's internal address.

---

## 5. Backend API

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/health` | Health check |
| GET | `/api/posts` | List all posts |
| GET | `/api/posts/:id` | Get one post |
| POST | `/api/posts` | Create a post |
| DELETE | `/api/posts/:id` | Delete a post |

Example request to create a post:

```bash
curl -X POST http://localhost:5000/api/posts \
  -H "Content-Type: application/json" \
  -d "{\"title\":\"My first post\",\"content\":\"Hello from BlogSpace\",\"author\":\"Student\",\"category\":\"Technology\"}"
```

The frontend provides the same create and delete operations through the UI.

---

## 6. Run CI checks locally

Backend:

```bash
cd backend
npm install
npm run lint
npm test
```

Frontend (in a second terminal):

```bash
cd frontend
npm install
npm run lint
npm run build
```

The GitHub Actions CI workflow runs these checks on pushes to `main` or `develop` and on pull requests targeting `main`.

---

## 7. Upload the project to GitHub

1. Create an empty GitHub repository, for example `mern-major-project`. Do not initialize it with a README if you already have this project README.
2. From the project root, run:

```bash
git init
git add .
git commit -m "Initial MERN Blog application with Docker and CI/CD"
git branch -M main
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/mern-major-project.git
git push -u origin main
```

Replace the URL with your own repository URL.

After pushing, open the repository's **Actions** tab. The **MERN Blog CI** workflow should start. Open the run and check that backend and frontend jobs pass.

Never commit `.env` files, passwords, MongoDB connection strings, tokens, or service-account keys. `.gitignore` excludes `.env` files.

---

## 8. Publish Docker images to Docker Hub manually (initial test)

Create two Docker Hub repositories:
- `mern-blog-backend`
- `mern-blog-frontend`

For the simplest Cloud Run setup, make both repositories **Public**. If they are private, configure Cloud Run image-pull authentication separately.

Sign in:

```bash
docker login
```

Build and tag the backend image:

```bash
docker build -t YOUR_DOCKERHUB_USERNAME/mern-blog-backend:latest ./backend
docker push YOUR_DOCKERHUB_USERNAME/mern-blog-backend:latest
```

Build and tag the frontend image. For a local image, `/api` is correct because Nginx proxies it to the backend only when using Compose. For a cloud image, the API URL must be the deployed backend URL; see Section 9.

```bash
docker build \
  --build-arg VITE_API_URL=https://YOUR-BACKEND-SERVICE-URL/api \
  -t YOUR_DOCKERHUB_USERNAME/mern-blog-frontend:latest \
  ./frontend

docker push YOUR_DOCKERHUB_USERNAME/mern-blog-frontend:latest
```

The GitHub CD workflow builds and pushes commit-specific image tags automatically after CI succeeds on `main`.

---

## 9. Configure MongoDB Atlas and Google Cloud Run

### 9.1 MongoDB Atlas

1. Sign in at https://cloud.mongodb.com/.
2. Create a project and a database deployment.
3. Create a database user and password.
4. Configure Network Access. For a student demonstration, you may temporarily allow access from anywhere (`0.0.0.0/0`) if your course setup requires it; use a strong database password and remove broad access when no longer needed. A more restrictive allow-list is preferable where practical.
5. Choose **Connect → Drivers** and copy the Node.js connection string.
6. Replace the username, password and database name. The URI should end with `/mern_blog` (or your chosen database name).
7. In Google Cloud Secret Manager, create a secret named **`mongo-uri`** and add the complete Atlas URI as its secret value. Do not put this URI in source code or GitHub.

The backend Cloud Run service will receive it as the environment variable `MONGO_URI` from Secret Manager.

### 9.2 Google Cloud project setup

1. Open https://console.cloud.google.com/.
2. Create/select a project and attach billing. Cloud Run may have a free usage allowance, but billing setup is generally required; monitor usage and budgets.
3. Enable these APIs:
   - Cloud Run API
   - IAM Service Account Credentials API
   - Security Token Service API
   - Secret Manager API
4. Create a runtime service account for the Cloud Run backend.
5. Grant that runtime service account **Secret Manager Secret Accessor** on the `mongo-uri` secret.
6. Create a deployment service account for GitHub Actions. Grant the roles needed to deploy Cloud Run services, act as the runtime service account, and access the secret configuration as appropriate. Use least privilege for your project.
7. Create a Workload Identity Pool and OIDC provider for GitHub Actions. Configure the provider condition to trust only your GitHub owner/repository. Follow Google's current guide: https://cloud.google.com/iam/docs/workload-identity-federation-with-deployment-pipelines
8. Grant the deployment service account `roles/iam.workloadIdentityUser` to the GitHub principal set for your repository. Use the exact provider resource name and service-account email in the GitHub secrets below.

Do not create or upload a long-lived service-account JSON key for this workflow. Workload Identity Federation is used instead.

### 9.3 Configure GitHub Actions secrets and variables

In your GitHub repository, open **Settings → Secrets and variables → Actions**.

Create these **Repository secrets**:

| Secret | Value |
|---|---|
| `DOCKERHUB_USERNAME` | Your Docker Hub username |
| `DOCKERHUB_TOKEN` | A Docker Hub access token |
| `GCP_PROJECT_ID` | Google Cloud project ID |
| `GCP_WIF_PROVIDER` | Full Workload Identity Provider resource name |
| `GCP_SERVICE_ACCOUNT` | GitHub deployment service account email |
| `GCP_RUNTIME_SERVICE_ACCOUNT` | Cloud Run runtime service account email |

Create this **Repository variable**:

| Variable | Suggested value |
|---|---|
| `GCP_REGION` | `asia-south1` |

Create a Google Secret Manager secret named `mongo-uri` as described above. The workflow expects this exact secret name.

### 9.4 How automated deployment works

1. Push or merge changes into `main`.
2. GitHub Actions CI installs dependencies, lints, tests the backend and builds the frontend.
3. Only after the CI workflow completes successfully on `main`, the CD workflow starts.
4. CD builds and pushes the backend image to Docker Hub using the commit SHA as its tag.
5. CD deploys the backend to Cloud Run and obtains its public service URL.
6. CD builds the frontend with that backend URL embedded as `VITE_API_URL`.
7. CD pushes the frontend image and deploys the frontend to Cloud Run.

After secrets and Google Cloud permissions are configured, you can either push/merge a change into `main` (CI runs first, then CD runs automatically after CI succeeds) or open **Actions → MERN Blog CD → Run workflow** to start a manual deployment. After a successful CD run, open the job logs and find the deployed frontend service URL. Open it in your browser and test creating and viewing posts.

**Cloud Run notes:**
- The workflow creates two separate Cloud Run services: `mern-blog-backend` and `mern-blog-frontend`.
- Both Docker Hub repositories must be public for the straightforward image-pull approach used here.
- The backend listens on the port supplied by Cloud Run (`PORT`, normally 8080).
- The frontend container listens on port 8080.
- This demo API allows public access and has no user authentication. Do not use it for sensitive or private data without adding authentication, authorization, rate limiting and appropriate security controls.
- The example CORS configuration allows all origins for a simple academic demonstration. Restrict it to your frontend domain before production use.
- Cloud Run may scale instances down to zero. The first request after inactivity can take longer.

---

## 10. GitHub Actions workflow behavior

### CI (`.github/workflows/ci.yml`)
- Runs on push to `main` and `develop`.
- Runs on pull requests targeting `main`.
- Checks out code and installs Node.js dependencies.
- Runs backend ESLint and backend tests.
- Runs frontend ESLint and production build.

### CD (`.github/workflows/cd.yml`)
- Runs after the named CI workflow completes successfully on `main`, and also supports a manual `workflow_dispatch` run from the Actions tab.
- Uses GitHub OIDC and Google Workload Identity Federation.
- Logs in to Docker Hub using GitHub secrets.
- Builds and pushes backend and frontend images.
- Deploys both services to Google Cloud Run.

If you rename the CI workflow, update the `workflows` name in the CD trigger so they match exactly.

---

## 11. Troubleshooting

### `docker` is not recognized
Install Docker Desktop, start it, then close and reopen VS Code.

### Docker daemon is not running
Open Docker Desktop and wait until it reports that the engine is running.

### Backend cannot connect to MongoDB in Compose
Check `docker compose logs backend` and `docker compose logs mongodb`. In Compose, the MongoDB hostname is `mongodb`, not `localhost`.

### Frontend shows a network/API error in Compose
Check `docker compose ps` and `docker compose logs frontend backend`. Ensure the frontend uses `/api` and `nginx.conf` proxies `/api/` to `http://backend:5000`.

### Atlas connection fails
Check the URI, database username/password, URL-encode special characters in credentials, and review Atlas Network Access.

### GitHub CI fails
Open Actions → failed run → failed job → expand the red step. Fix the reported lint, test or build issue locally, commit and push again.

### GitHub CD fails to authenticate to Google
Check the provider resource name, repository trust condition, `GCP_SERVICE_ACCOUNT`, service-account IAM binding, enabled APIs and the deployment service account's permissions.

### Cloud Run reports container failed to start
Check Cloud Run revision logs. Confirm that the backend listens on `process.env.PORT` and `0.0.0.0`, and that the frontend Nginx server listens on 8080.

---

## 12. Screenshots for submission

Capture your own screenshots after running the project:
1. Docker image list showing frontend and backend images.
2. `docker compose ps` showing frontend, backend and MongoDB.
3. BlogSpace running at `http://localhost:8080`.
4. A blog post created and displayed.
5. Docker Hub showing both repositories and pushed tags.
6. MongoDB Atlas showing the database and posts collection.
7. Cloud Run showing both deployed services.
8. Public frontend URL displaying BlogSpace.
9. GitHub Actions CI successful run.
10. GitHub Actions CD successful run.
11. Updated deployed application after a new commit.

Do not use fabricated screenshots. Capture evidence from your own successful execution.

---

## 13. Final submission checklist

- [ ] Complete source code
- [ ] Backend Dockerfile and `.dockerignore`
- [ ] Frontend Dockerfile and `.dockerignore`
- [ ] `docker-compose.yml`
- [ ] GitHub repository URL
- [ ] Docker Hub frontend repository URL
- [ ] Docker Hub backend repository URL
- [ ] Public Cloud Run frontend URL
- [ ] GitHub Actions CI and CD workflows
- [ ] Screenshots of implementation
- [ ] Completed project report
- [ ] Successful project demonstration and viva preparation
