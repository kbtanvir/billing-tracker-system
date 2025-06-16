# "As Pay As You Go" billing system

As pay as you go billing system. fully containerized and deployable to any vps

## Technologies Used

- **Backend**: Nest.js, Drizzle, Postgres, Redis
- **Storage/CDN**: Minio
- **Other Tools**: Docker, Docker Compose

## How to Run Locally

### Prerequisites

- Docker and Docker Compose installed on your machine. for windows can use WSL.

### Steps

1. **Clone the repository:**

   ```bash
   git clone https://github.com/kbtanvir/billing-tracker-system.git
   ```

2. **Set Up Environment Variables:**

   Each service requires an `server/.env` and `server/.env.docker` file for configuration. You can generate these from `env.example` files provided.


3. **Start the containers:**
   ```sh
   cd backend
   make up
   ```

## Stopping Containers

To stop the running containers:
```sh
make down
```

## Checking Available Ports

To see available ports along with container ID, port, created time, and status:
```sh
make ps
```

## API and Consoles

- API Documentation: [http://localhost:8080/docs](http://localhost:8081/docs)
- MinIO Console: [http://localhost:9111](http://localhost:9111)
