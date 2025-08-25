#!/bin/bash

# Script to prepare a release
# Usage: ./scripts/prepare-release.sh <version>

set -e

if [ $# -eq 0 ]; then
    echo "Usage: $0 <version>"
    echo "Example: $0 1.0.1"
    exit 1
fi

VERSION=$1

echo "🏷️  Preparing release v$VERSION"

# Update version in package.json
echo "📝 Updating package.json version..."
sed -i.bak "s/\"version\": \".*\"/\"version\": \"$VERSION\"/" package.json
rm package.json.bak

# Build all platforms
echo "🏗️  Building all platforms..."
./scripts/build-all.sh

# Test the build
echo "🧪 Testing build..."
./dist/stim version

echo "✅ Release v$VERSION prepared!"
echo ""
echo "📋 Next steps:"
echo "1. Review changes: git diff"
echo "2. Commit changes: git add . && git commit -m \"Release v$VERSION\""
echo "3. Create tag: git tag v$VERSION"
echo "4. Push changes: git push origin main --tags"
echo ""
echo "The GitHub Actions workflow will automatically create the release."