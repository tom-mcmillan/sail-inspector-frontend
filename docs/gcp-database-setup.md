# GCP Cloud SQL Database Setup

## Overview

This document provides instructions for setting up a Cloud SQL database on Google Cloud Platform to store API keys for the Sail MCP Platform.

## Prerequisites

- GCP Account with billing enabled
- `gcloud` CLI installed and authenticated
- Project ID for your GCP project

## Step 1: Create Cloud SQL Instance

```bash
# Set your project
gcloud config set project YOUR_PROJECT_ID

# Create a Cloud SQL MySQL instance
gcloud sql instances create sail-mcp-db \
  --database-version=MYSQL_8_0 \
  --tier=db-f1-micro \
  --region=us-central1 \
  --root-password=YOUR_SECURE_PASSWORD \
  --database-flags=character_set_server=utf8mb4
```

## Step 2: Create Database and Table

1. Connect to your instance:
```bash
gcloud sql connect sail-mcp-db --user=root
```

2. Create the database:
```sql
CREATE DATABASE sail_mcp;
USE sail_mcp;
```

3. Create the api_keys table:
```sql
CREATE TABLE api_keys (
  `key` VARCHAR(20) PRIMARY KEY,
  name VARCHAR(255),
  email VARCHAR(255) NOT NULL,
  server VARCHAR(500) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_used TIMESTAMP NULL,
  is_active BOOLEAN DEFAULT TRUE,
  INDEX idx_email (email),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

## Step 3: Create Service Account

```bash
# Create service account
gcloud iam service-accounts create sail-mcp-api \
  --display-name="Sail MCP API Service Account"

# Grant Cloud SQL client role
gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
  --member="serviceAccount:sail-mcp-api@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/cloudsql.client"

# Create and download key
gcloud iam service-accounts keys create sail-mcp-key.json \
  --iam-account=sail-mcp-api@YOUR_PROJECT_ID.iam.gserviceaccount.com
```

## Step 4: Enable Cloud SQL Admin API

```bash
gcloud services enable sqladmin.googleapis.com
```

## Step 5: Get Connection Details

```bash
# Get instance connection name
gcloud sql instances describe sail-mcp-db --format="value(connectionName)"
```

## Step 6: Environment Variables

Add these to your `.env.local`:

```env
# GCP Cloud SQL Configuration
GCP_PROJECT_ID=your-project-id
GCP_SQL_INSTANCE_CONNECTION_NAME=project:region:instance
GCP_SQL_DATABASE=sail_mcp
GCP_SQL_USER=root
GCP_SQL_PASSWORD=your-password

# For local development with Cloud SQL Proxy
DATABASE_URL=mysql://root:password@127.0.0.1:3306/sail_mcp

# Service account key path (for production)
GOOGLE_APPLICATION_CREDENTIALS=./sail-mcp-key.json
```

## Step 7: Install Dependencies

```bash
npm install @google-cloud/sql mysql2
```

## Step 8: Cloud SQL Proxy (for local development)

Download and run the Cloud SQL Proxy:

```bash
# Download Cloud SQL Proxy
curl -o cloud_sql_proxy https://dl.google.com/cloudsql/cloud_sql_proxy.darwin.amd64
chmod +x cloud_sql_proxy

# Run proxy
./cloud_sql_proxy -instances=YOUR_CONNECTION_NAME=tcp:3306
```

## Step 9: Update API Route

Replace the TODO in `/app/api/keys/route.ts` with:

```typescript
import mysql from 'mysql2/promise';

const connection = await mysql.createConnection({
  host: process.env.NODE_ENV === 'production' 
    ? `/cloudsql/${process.env.GCP_SQL_INSTANCE_CONNECTION_NAME}`
    : '127.0.0.1',
  user: process.env.GCP_SQL_USER,
  password: process.env.GCP_SQL_PASSWORD,
  database: process.env.GCP_SQL_DATABASE,
});

// Insert the key
await connection.execute(
  'INSERT INTO api_keys (`key`, name, email, server) VALUES (?, ?, ?, ?)',
  [key, name || null, email, server]
);
```

## Security Considerations

1. **Never expose database credentials** - Use environment variables
2. **Use Cloud SQL Proxy** for secure connections
3. **Enable SSL** for production connections
4. **Implement rate limiting** on the API endpoint
5. **Add input validation** for email and server URL
6. **Consider encrypting** the API keys in the database

## Monitoring

Set up monitoring in GCP Console:
1. Cloud SQL Metrics
2. Error Reporting
3. Cloud Logging
4. Uptime checks

## Backup Strategy

Enable automated backups:
```bash
gcloud sql instances patch sail-mcp-db \
  --backup-start-time=03:00 \
  --retain-transaction-logs
```

## Next Steps

1. Set up Cloud Run or App Engine for hosting
2. Configure VPC for secure database access
3. Implement key rotation policies
4. Add audit logging for key usage