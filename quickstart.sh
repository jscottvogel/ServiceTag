#!/bin/bash

# ServiceTag Quick Start Script
# This script helps you get started with ServiceTag development

set -e

echo "🚀 ServiceTag Quick Start"
echo "========================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

echo "✅ Node.js version: $(node --version)"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ npm version: $(npm --version)"

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo "⚠️  AWS CLI is not installed. You'll need it for Amplify sandbox."
    echo "   Install from: https://aws.amazon.com/cli/"
    read -p "   Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
else
    echo "✅ AWS CLI version: $(aws --version)"
fi

echo ""
echo "📦 Installing dependencies..."
npm install

echo ""
echo "✅ Dependencies installed!"
echo ""
echo "🎯 Next Steps:"
echo ""
echo "1. Configure AWS credentials (if not already done):"
echo "   aws configure"
echo ""
echo "2. Start the Amplify sandbox (in a new terminal):"
echo "   npm run sandbox"
echo ""
echo "3. Start the development server (in another terminal):"
echo "   npm run dev"
echo ""
echo "4. Open your browser to:"
echo "   http://localhost:3000"
echo ""
echo "📚 Documentation:"
echo "   - README.md - Project overview and features"
echo "   - DEPLOYMENT.md - Deployment guide"
echo ""
echo "🎨 Design System:"
echo "   - Premium glassmorphism UI"
echo "   - Mobile-first responsive design"
echo "   - Smooth animations with Framer Motion"
echo ""
echo "Happy coding! 🎉"
