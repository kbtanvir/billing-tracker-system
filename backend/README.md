# Simple hosting solution

Simple hosting solution, storing static files on minio bucket, serving to browser with nginx

## Technologies Used

- **Backend**: Nest.js, Drizzle, Postgres
- **Frontend**: Tailwind CSS, Next.js
- **Storage/CDN**: Minio
- **Proxy Server**: NGINX
- **Other Tools**: Docker, Docker Compose

## How to Run Locally

### Prerequisites

- Docker and Docker Compose installed on your machine. 
- Log into docker hub, generate a personal accesstoken
- Login to docker hub with access token as password, you will need to do this only once

### Steps

1. **Clone the repository:**

   ```bash
   git clone https://github.com/static-run/hosting.git
   cd hosting
   ```

2. **Set Up Environment Variables:**

   Each service requires an `server/.env` and `server/.env.docker` file for configuration. You can generate these from `.env.example` files provided.


3. **Start the containers:**
   ```sh
   make up
   ```

4. **Generate API Token:**
   ```sh
   curl "http://localhost:81/api/tokens" -H "Content-Type: application/json; charset=UTF-8" --data-raw '{"identity":"admin@example.com","secret":"changeme","expiry":"1y"}'
   ```
   Update `NGINX_API_TOKEN` in `.env` and `.env.docker` with the generated token.

5. **Configure MinIO:**
   - Log in to the MinIO console.
   - Generate `MINIO_ACCESS_KEY` and `MINIO_SECRET_KEY`.
   - Update `.env` and `.env.docker` with these values.

## Stopping Containers

To stop the running containers:
```sh
make down
```

## Viewing Available Commands

To see available commands, use:
```sh
make [double press TAB]
```
If this does not work, check the `/scripts` folder.

## Checking Available Ports

To see available ports along with container ID, port, created time, and status:
```sh
docker ps --format "table {{.ID}}	{{.Ports}}	{{.CreatedAt}}	{{.Status}}"
```

## API and Consoles

- API Documentation: [http://localhost:8080/docs](http://localhost:8080/docs)
- MinIO Console: [http://localhost:9111](http://localhost:9111)
- NPM Console: [http://localhost:81](http://localhost:81)

## Deployment

1. Deploy to VPS:
   ```sh
   make vps.server.sync
   ```
   - Monitor the console output until deployment completes.

2. Access VPS Servers (if you have SSH access):
   - Backend Server:
     ```sh
     vps.backend.access
     ```
   - CDN Server:
     ```sh
     vps.storage.access
     ```

3. Managing Services on VPS:
   - Use standard Docker commands to manage services directly on the VPS.

