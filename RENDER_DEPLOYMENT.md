# Deploying to Render

This guide will help you deploy the Job Search Engine application to [Render](https://render.com/).

## Prerequisites

1. A [Render](https://render.com/) account
2. Your project pushed to a GitHub repository

## Deployment Steps

### 1. Create a New Web Service

1. Log in to your Render dashboard
2. Click on "New" and select "Web Service"
3. Connect your GitHub repository
4. Select the repository that contains your Job Search Engine project

### 2. Configure the Web Service

Fill in the following details:

- **Name**: `job-search-engine` (or your preferred name)
- **Environment**: `Node`
- **Build Command**: `npm install && npm run seed`
- **Start Command**: `npm start`

### 3. Add Environment Variables

Add the following environment variables:

- `NODE_ENV`: `production`
- `PORT`: `10000` (Render will automatically use this)
- `APP_URL`: Your application URL (e.g., `https://job-search-engine.onrender.com`)
- `KEEP_ALIVE_INTERVAL`: `14` (or your preferred interval in minutes)

### 4. Advanced Options (Optional)

You can configure additional options:

- Auto-Deploy: Keep enabled to automatically deploy when you push to your repository
- Health Check Path: Set to `/api/health` to use the application's health check endpoint

### 5. Create Web Service

Click "Create Web Service" to start the deployment process.

## Verifying Deployment

1. Wait for the deployment to complete (this may take a few minutes)
2. Access your application at the provided URL
3. Check the logs in the Render dashboard to verify that the keep-alive service is running

## Keep-Alive Mechanism

The application includes a keep-alive mechanism to prevent it from sleeping on Render's free tier. This works by:

1. Making periodic requests to the application (every 14 minutes by default)
2. Providing a health check endpoint at `/api/health`

You can verify this is working by checking the logs for messages like:
```
Setting up keep-alive service for https://your-app.onrender.com (interval: 14 minutes)
[2025-08-28T12:34:56.789Z] Keep-alive ping sent. Response: 200 (123ms)
```

## Troubleshooting

If your application fails to deploy:

1. Check the build logs in the Render dashboard
2. Verify that all required environment variables are set correctly
3. Make sure your repository includes a `package.json` file with the necessary scripts

If the keep-alive mechanism isn't working:

1. Check that `NODE_ENV` is set to `production`
2. Verify that `APP_URL` is set correctly
3. Check the logs for any errors related to the keep-alive service
