#!/bin/bash

# Multiplatform Icon Converter - Deployment Script
# This script helps deploy the webapp to GitHub Pages

echo "🚀 Multiplatform Icon Converter - GitHub Pages Deployment"
echo "========================================================="

# Check if we're in the webapp directory
if [ ! -f "index.html" ] || [ ! -f "style.css" ] || [ ! -f "script.js" ]; then
    echo "❌ Error: Please run this script from the webapp directory"
    exit 1
fi

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "📝 Initializing git repository..."
    git init
fi

# Add all files
echo "📦 Adding files to git..."
git add .

# Commit changes
echo "💾 Committing files..."
git commit -m "Deploy: Multiplatform Icon Converter webapp"

# Check if remote origin exists
if git remote get-url origin > /dev/null 2>&1; then
    echo "🔄 Pushing to existing remote..."
else
    echo "❓ Please enter your GitHub repository URL:"
    echo "   Example: https://github.com/xcodeBn/JvmIconConverter.git"
    read -p "Repository URL: " repo_url
    if [ -n "$repo_url" ]; then
        git remote add origin "$repo_url"
    else
        echo "❌ No repository URL provided. Please set it up manually."
        exit 1
    fi
fi

# Push to main branch
echo "⬆️  Pushing to GitHub..."
git branch -M main
git push -u origin main

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📋 Next steps:"
echo "1. Go to your GitHub repository"
echo "2. Click on 'Settings' tab"
echo "3. Scroll down to 'Pages' section"
echo "4. Under 'Source', select 'GitHub Actions'"
echo "5. Wait for the deployment to complete"
echo "6. Your webapp will be available at: https://xcodeBn.github.io/JvmIconConverter/"
echo ""
echo "🔍 Check the 'Actions' tab in your repository to monitor the deployment progress."