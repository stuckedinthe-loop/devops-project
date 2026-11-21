# DevOps Project: Docker Compose + CI/CD

Combines two experiments:
1. **Multi-container app** – Node.js web service + PostgreSQL via Docker Compose
2. **CI/CD pipeline** – GitHub Actions: build/test (npm) → Docker image → deploy

## Structure
```
├── src/app.js, server.js        # Express web app (talks to PostgreSQL)
├── test/app.test.js             # Unit test run in CI
├── Dockerfile                   # Web image
├── docker-compose.yml           # Local: web + db (builds image)
├── docker-compose.prod.yml      # Server: web + db (pulls image from GHCR)
└── .github/workflows/ci-cd.yml  # Pipeline
```

## Run locally (Experiment 1)
```bash
docker compose up --build
```
- http://localhost:3000 – home page
- http://localhost:3000/visits – counter stored in PostgreSQL (persists in the `db_data` volume)
- `docker compose down` stops it; add `-v` to also delete DB data.

## Pipeline (Experiment 2)
| Stage | What happens |
|-------|--------------|
| **test** | Checkout, install Node 20, `npm install`, `npm test` |
| **docker** | `docker compose up` smoke test hitting `/visits`, then build and push image to GitHub Container Registry (on push to `main`) |
| **deploy** | SCP the prod compose file to the server, SSH in, pull the new image, `docker compose up -d` |

Pull requests run only test + smoke test; pushes to `main` run everything.

## Setup for deployment
1. Create a GitHub repo and push this project to `main`.
2. Server needs Docker + Docker Compose installed.
3. Add repository secrets (Settings → Secrets and variables → Actions):
   `SERVER_HOST`, `SERVER_USER`, `SERVER_SSH_KEY`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
4. Make the GHCR package accessible to the server (the workflow logs in with the built-in token).
5. Push to `main` and watch the **Actions** tab. The app will be on port 80 of your server.
