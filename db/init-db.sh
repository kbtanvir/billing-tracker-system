#!/bin/bash

# Function to check if PostgreSQL is ready
wait_for_postgres() {
  until pg_isready -U "$POSTGRES_USERNAME"; do
    echo "Waiting for PostgreSQL to be ready..."
    sleep 2
  done
}

# Wait for PostgreSQL to be ready
wait_for_postgres

# Execute SQL commands to set up the database
psql -v ON_ERROR_STOP=1 --username "postgres" <<-EOSQL
    -- Create the user if it does not already exist
    DO \$\$
    BEGIN
       IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = '${POSTGRES_USERNAME}') THEN
          CREATE USER "${POSTGRES_USERNAME}" WITH PASSWORD '${POSTGRES_PASSWORD}';
       END IF;
    END
    \$\$;

    -- Create the database if it does not already exist
    DO \$\$
    BEGIN
       IF NOT EXISTS (SELECT 1 FROM pg_database WHERE datname = '${POSTGRES_DB}') THEN
          CREATE DATABASE "${POSTGRES_DB}";
       END IF;
    END
    \$\$;

    -- Grant all privileges on the database to the user
    GRANT ALL PRIVILEGES ON DATABASE "${POSTGRES_DB}" TO "${POSTGRES_USERNAME}";

    -- Connect to the database
    \c "${POSTGRES_DB}";

    -- Grant privileges on all tables, sequences, and functions in the public schema
    GRANT USAGE ON SCHEMA public TO "${POSTGRES_USERNAME}";
    GRANT CREATE ON SCHEMA public TO "${POSTGRES_USERNAME}";
    GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO "${POSTGRES_USERNAME}";
    GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO "${POSTGRES_USERNAME}";
    GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO "${POSTGRES_USERNAME}";

    -- Set default privileges for new objects in the public schema
    ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO "${POSTGRES_USERNAME}";
    ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO "${POSTGRES_USERNAME}";
    ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO "${POSTGRES_USERNAME}";
EOSQL
