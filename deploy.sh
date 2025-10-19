#!/bin/bash

# Rent Splitter Deployment Script
echo "🏠 Rent Splitter Deployment Script"
echo "=================================="

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "Initializing git repository..."
    git init
    git add .
    git commit -m "Initial commit: Rent Splitter app"
fi

# Check if remote origin exists
if ! git remote get-url origin > /dev/null 2>&1; then
    echo "⚠️  No remote origin found. Please add your GitHub repository:"
    echo "   git remote add origin https://github.com/yourusername/rent-splitter.git"
    echo "   git push -u origin main"
    exit 1
fi

# Build the project
echo "🔨 Building project..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    echo ""
    echo "📋 Next steps for Vercel deployment:"
    echo "1. Go to https://vercel.com"
    echo "2. Click 'New Project'"
    echo "3. Import your GitHub repository"
    echo "4. Vercel will auto-detect Next.js"
    echo "5. Click 'Deploy'"
    echo ""
    echo "🚀 Your app will be live at: https://your-app-name.vercel.app"
    echo ""
    echo "✨ Features included:"
    echo "   - Square footage-based rent splitting"
    echo "   - Income-based rent splitting (fallback)"
    echo "   - Even utilities and expenses splitting"
    echo "   - Shareable links with localStorage"
    echo "   - Responsive design"
    echo "   - Copy to clipboard functionality"
else
    echo "❌ Build failed. Please check the errors above."
    exit 1
fi
