# Deploying to Render

This guide will help you deploy the Job Search Engine application to [Render](https://render.com/).

## Prerequisites

1. A [Render](https://render.com/) account
2. Your project pushed to a GitHub repository

## Deployment Methods

There are two ways to deploy to Render:

### Option 1: Using render.yaml (Recommended)

The easiest way to deploy is using the `render.yaml` file included in the repository:

1. Log in to your Render dashboard
2. Click on "New" and select "Blueprint"
3. Connect your GitHub repository
4. Render will automatically detect the `render.yaml` file and create all necessary services
5. Set any required environment variables when prompted

This will create:
- A web service for the application
- A cron job service that keeps the application awake

### Option 2: Manual Setup

If you prefer to set up the services manually, follow these steps:

#### 1. Create a New Web Service

1. Log in to your Render dashboard
2. Click on "New" and select "Web Service"
3. Connect your GitHub repository
4. Select the repository that contains your Job Search Engine project

#### 2. Configure the Web Service

Fill in the following details:

- **Name**: `job-search-engine` (or your preferred name)
- **Environment**: `Node`
- **Build Command**: `npm install && npm run seed`
- **Start Command**: `npm run render-start`

#### 3. Add Environment Variables

Add the following environment variables:

- `NODE_ENV`: `production`
- `PORT`: `10000` (Render will automatically use this)
- `APP_URL`: Your application URL (e.g., `https://job-search-engine.onrender.com`)
- `KEEP_ALIVE_INTERVAL`: `14` (or your preferred interval in minutes)

#### 4. Advanced Options

You can configure additional options:

- Auto-Deploy: Keep enabled to automatically deploy when you push to your repository
- Health Check Path: Set to `/api/health` to use the application's health check endpoint

#### 5. Create a Cron Job Service

To keep your application awake on Render's free tier:

1. In your Render dashboard, click on "New" and select "Cron Job"
2. Connect to the same GitHub repository
3. Configure the cron job:
   - **Name**: `job-search-engine-keep-alive`
   - **Schedule**: `*/14 * * * *` (runs every 14 minutes)
   - **Build Command**: `npm install`
   - **Start Command**: `curl -f $APP_URL/api/health/ping`
4. Add the `APP_URL` environment variable (same as your web service URL)

## Keep-Alive Mechanism

The application includes three keep-alive mechanisms to prevent it from sleeping on Render's free tier:

1. **Internal Keep-Alive**: The application periodically pings itself (useful when it's already running)
2. **External Cron Job**: A separate Render cron job service pings the application every 10 minutes (works even if the application is asleep)
3. **Procfile Worker**: A separate worker process that runs alongside the web service

This triple-redundant approach ensures your application stays awake with high reliability.

### Verify the Keep-Alive Mechanism

You can verify this is working by checking the logs for messages like:
```
[2025-08-28T12:34:56.789Z] Keep-alive ping sent. Response: 200 (123ms)
[2025-08-28T12:48:56.789Z] Received ping from external cron job
```

## Troubleshooting

If your application still goes to sleep:

1. Check the cron job logs in your Render dashboard to ensure it's running correctly
2. Verify the URL being pinged is correct (it should match your deployed application URL)
3. Ensure the health check endpoint is responding correctly (check web service logs)
4. Consider decreasing the interval between pings (e.g., to 10 minutes instead of 14)

If you're still having issues, you can manually set up a cron job using the Render API:

1. Generate a Render API key in your account settings
2. Set the following environment variables:
   - `RENDER_API_KEY`: Your Render API key
   - `RENDER_SERVICE_ID`: The ID of your web service (found in the URL of your service's dashboard)
   - `APP_URL`: Your application URL
3. Run the script: `node scripts/setup-render-cron.js`
