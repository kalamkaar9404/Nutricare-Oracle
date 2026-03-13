#!/bin/bash

# NutriCare-Oracle Quick Setup Script
# Run this to get started quickly

echo "🏥 NutriCare-Oracle Setup"
echo "=========================="
echo ""

# Check Node.js
echo "Checking Node.js..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js 18+ first."
    exit 1
fi
echo "✅ Node.js $(node --version)"

# Check npm
echo "Checking npm..."
if ! command -v npm &> /dev/null; then
    echo "❌ npm not found."
    exit 1
fi
echo "✅ npm $(npm --version)"

# Install dependencies
echo ""
echo "Installing dependencies..."
npm install

# Check React Native CLI
echo ""
echo "Checking React Native..."
if ! command -v react-native &> /dev/null; then
    echo "⚠️  React Native CLI not found globally. Installing..."
    npm install -g react-native-cli
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Configure Melange keys in src/services/MelangeService.ts"
echo "2. Deploy smart contract and update BlockchainService.ts"
echo "3. Run 'npm run android' or 'npm run ios'"
echo ""
echo "See README.md for detailed instructions."
