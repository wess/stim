#!/bin/bash

# Build script for creating cross-platform binaries locally
# Usage: ./scripts/build-all.sh

set -e

echo "🏗️  Building Stim for all platforms..."

# Create dist directory
mkdir -p dist

# Get version from package.json
VERSION=$(grep '"version"' package.json | sed 's/.*"version": "\(.*\)".*/\1/')
echo "📦 Building version: $VERSION"

# Build for different platforms
echo "🐧 Building for Linux x64..."
bun build --compile --target=bun-linux-x64 --outfile=dist/stim-linux-x64 src/main.ts

echo "🍎 Building for macOS x64..."
bun build --compile --target=bun-darwin-x64 --outfile=dist/stim-darwin-x64 src/main.ts

echo "🍎 Building for macOS ARM64..."
bun build --compile --target=bun-darwin-arm64 --outfile=dist/stim-darwin-arm64 src/main.ts

echo "🪟 Building for Windows x64..."
bun build --compile --target=bun-windows-x64 --outfile=dist/stim-windows-x64.exe src/main.ts

# Make binaries executable
chmod +x dist/stim-*

# Create checksums
echo "🔐 Creating checksums..."
cd dist
sha256sum stim-* > checksums.txt
cd ..

echo "✅ Build complete!"
echo "📁 Binaries created in dist/:"
ls -la dist/stim-*
echo ""
echo "🚀 To test locally:"
echo "  ./dist/stim-$(uname -s | tr '[:upper:]' '[:lower:]')-$(uname -m | sed 's/arm64/arm64/; s/x86_64/x64/') version"