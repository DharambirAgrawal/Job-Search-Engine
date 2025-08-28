#!/bin/bash

# Deploy to Render using render.yaml blueprint
# This script helps deploy your application to Render using the Blueprint feature

# Configuration - Change these variables as needed
REPO_URL="https://github.com/DharambirAgrawal/Job-Search-Engine"
RENDER_DASHBOARD_URL="https://dashboard.render.com"

echo "========================================"
echo "Job Search Engine - Render Deployment"
echo "========================================"
echo 

# Check if render CLI is installed
if ! command -v render &> /dev/null; then
    echo "The Render CLI is not installed."
    echo "You can deploy manually by visiting:"
    echo "  $RENDER_DASHBOARD_URL/blueprints/new"
    echo "And entering your repository URL:"
    echo "  $REPO_URL"
    echo
    echo "Alternatively, create services individually following the instructions in RENDER_DEPLOYMENT.md"
    exit 1
fi

# Instructions for manual deployment if render CLI doesn't work
echo "This script will help deploy your application to Render."
echo "It requires the Render CLI and appropriate permissions."
echo
echo "If the automated deployment fails, you can deploy manually by:"
echo "1. Visiting $RENDER_DASHBOARD_URL"
echo "2. Click on 'New' and select 'Blueprint'"
echo "3. Enter your repository URL: $REPO_URL"
echo
echo "Press Enter to continue with automated deployment or Ctrl+C to cancel..."
read -r

# Attempt to deploy using render CLI
echo "Deploying to Render..."
render blueprint create

echo
echo "If deployment was successful, you should see your services in the Render dashboard."
echo "Visit $RENDER_DASHBOARD_URL to check the status."
echo
echo "Note: It may take a few minutes for your services to be fully deployed."
echo "The cron job will automatically keep your application awake on the free tier."
