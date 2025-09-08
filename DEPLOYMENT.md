# Deployment Instructions

This guide explains how to deploy the Multiplatform Icon Converter webapp to GitHub Pages under your GitHub account (xcodeBn).

## Prerequisites

- A GitHub account (xcodeBn)
- Git installed on your local machine

## Deployment Steps

### 1. Create a New GitHub Repository

1. Go to https://github.com/new
2. Create a new repository with the name `multiplatform-icon-converter`
3. Make sure to leave the repository empty (don't initialize with README, .gitignore, or license)

### 2. Clone This Webapp Locally

If you haven't already, you need to get these webapp files onto your local machine. You can do this by:

1. Copying the webapp directory from this project
2. Or downloading the files as a ZIP archive and extracting them

### 3. Push Files to Your GitHub Repository

#### Option A: Automated Deployment (Recommended)

Navigate to the webapp directory and run the deployment script:

```bash
cd webapp
./deploy.sh
```

The script will:
- Initialize git repository (if needed)
- Add all files
- Commit the changes
- Ask for your repository URL (if not set)
- Push to GitHub
- Provide next steps for enabling GitHub Pages

#### Option B: Manual Deployment

If you prefer to do it manually, run these commands in the webapp directory:

```bash
# Initialize git repository
git init

# Add all files
git add .

# Commit the files
git commit -m "Initial commit: Multiplatform Icon Converter webapp"

# Add your GitHub repository as remote (replace with your actual repo name)
git remote add origin https://github.com/xcodeBn/JvmIconConverter.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### 4. Enable GitHub Pages

1. Go to your repository page on GitHub: https://github.com/xcodeBn/multiplatform-icon-converter
2. Click on "Settings" tab
3. In the left sidebar, click on "Pages"
4. In the "Source" section, select "GitHub Actions" from the dropdown
5. Click "Save"

### 5. Verify Deployment

1. After pushing, GitHub will automatically run the deployment workflow
2. You can check the workflow progress in the "Actions" tab of your repository
3. Once the workflow completes successfully, your webapp will be available at:
   https://xcodeBn.github.io/JvmIconConverter/

## Updating the Webapp

If you make changes to the webapp files locally and want to update the live version:

```bash
# Add and commit changes
git add .
git commit -m "Update webapp"

# Push changes to GitHub
git push origin main
```

GitHub Actions will automatically deploy the updated version.