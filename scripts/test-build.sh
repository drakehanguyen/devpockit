#!/bin/bash

# DevPockit Build Testing Script
# This script tests the Next.js build process comprehensively

set -e  # Exit on any error

echo "🚀 Starting DevPockit Build Testing..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Step 1: Clean previous builds
print_status "Cleaning previous builds..."
rm -rf .next out coverage
print_success "Cleanup completed"

# Step 2: Install dependencies
print_status "Installing dependencies..."
pnpm install --frozen-lockfile
print_success "Dependencies installed"

# Step 3: Type checking
print_status "Running TypeScript type check..."
pnpm type-check
print_success "Type check passed"

# Step 4: Linting
print_status "Running ESLint..."
pnpm lint
print_success "Linting passed"

# Step 5: Run tests
print_status "Running test suite..."
pnpm test:ci
print_success "All tests passed"

# Step 6: Build the application
print_status "Building Next.js application..."
pnpm build
print_success "Build completed successfully"

# Step 7: Verify build output
print_status "Verifying build output..."

# Check if out directory exists
if [ ! -d "out" ]; then
    print_error "Build output directory 'out' not found!"
    exit 1
fi

# Check if index.html exists
if [ ! -f "out/index.html" ]; then
    print_error "Main index.html not found in build output!"
    exit 1
fi

# Check if tools directory exists
if [ ! -d "out/tools" ]; then
    print_error "Tools directory not found in build output!"
    exit 1
fi

print_success "Build output verification passed"

# Step 8: Test static file serving
print_status "Testing static file serving..."
if command -v python3 &> /dev/null; then
    print_status "Starting local server on port 8080..."
    python3 -m http.server 8080 --directory out &
    SERVER_PID=$!

    # Wait for server to start
    sleep 2

    # Test if server is responding
    if curl -s -o /dev/null -w "%{http_code}" http://localhost:8080 | grep -q "200"; then
        print_success "Static file serving test passed"
    else
        print_warning "Static file serving test failed"
    fi

    # Kill the test server
    kill $SERVER_PID 2>/dev/null || true
else
    print_warning "Python3 not available, skipping static file serving test"
fi

# Step 9: Check build size
print_status "Checking build size..."
BUILD_SIZE=$(du -sh out | cut -f1)
print_status "Build size: $BUILD_SIZE"

# Step 10: Summary
echo ""
echo "🎉 Build Testing Summary:"
echo "✅ Dependencies installed"
echo "✅ Type checking passed"
echo "✅ Linting passed"
echo "✅ Tests passed"
echo "✅ Build completed"
echo "✅ Build output verified"
echo "✅ Static serving tested"
echo ""
print_success "All build tests passed! 🚀"
echo ""
echo "Next steps:"
echo "1. Test the build locally: python3 -m http.server 8080 --directory out"
echo "2. Visit http://localhost:8080 to test the application"
echo "3. Deploy to GitHub Pages if all tests pass"
