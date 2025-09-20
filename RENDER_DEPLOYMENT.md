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
- **Start Command**: `npm start`

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

## Your Application is Ready!

Once deployed, your Job Search Engine will be accessible at the URL provided by Render. The application includes:

- RESTful API endpoints for users, jobs, matching, and search
- NeDB database for data persistence
- Comprehensive health monitoring

## Troubleshooting

If you encounter issues during deployment:

1. Check the build logs in your Render dashboard for any errors
2. Verify all environment variables are set correctly
3. Ensure your application starts successfully locally before deploying
4. Check the runtime logs for any application errors
