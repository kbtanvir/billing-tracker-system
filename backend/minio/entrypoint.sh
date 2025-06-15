#!/bin/sh
set -e

# Ensure S3_BUCKET_NAME is set
if [ -z "$S3_BUCKET_ID" ] || [ -z "$S3_ENDPOINT" ]; then
  echo "Error: Missing required environment variables:"
  [ -z "$S3_BUCKET_ID" ] && echo " - S3_BUCKET_ID"
  [ -z "$S3_ENDPOINT" ] && echo " - S3_ENDPOINT"
  exit 1
fi

echo "Waiting for MinIO to be ready..."
until /usr/bin/mc alias set s3 ${S3_ENDPOINT} ${MINIO_ROOT_USER} ${MINIO_ROOT_PASSWORD} > /dev/null 2>&1
do
    echo "Waiting for MinIO..."
    sleep 1
done
echo "MinIO is ready"

echo "Creating and configuring bucket..."
# Create bucket
/usr/bin/mc mb --ignore-existing s3/${S3_BUCKET_ID}

/usr/bin/mc anonymous set download s3/${S3_BUCKET_ID}

/usr/bin/mc anonymous set-json /tmp/policy.json s3/${S3_BUCKET_ID}
 
# /usr/bin/mc anonymous set-json /tmp/cors.json s3/${S3_BUCKET_ID}

echo "Minio cli is ready"

tail -f /dev/null
