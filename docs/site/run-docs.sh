#!/bin/bash

# Script to install dependencies and run the documentation site locally

echo "Setting up WebAssembly-Optimized GitHub Actions Documentation"
echo "============================================================"

# Check if bun is installed
if command -v bun &> /dev/null; then
    PACKAGE_MANAGER="bun"
else
    PACKAGE_MANAGER="npm"
fi

echo "Using package manager: $PACKAGE_MANAGER"

# Install dependencies
echo "Installing dependencies..."
if [ "$PACKAGE_MANAGER" = "bun" ]; then
    bun install
else
    npm install
fi

# Create public directory if it doesn't exist
mkdir -p public

# Create a placeholder logo SVG
if [ ! -f public/logo.svg ]; then
    echo "Creating placeholder logo..."
    cat > public/logo.svg << 'EOL'
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <rect x="10" y="10" width="80" height="80" rx="10" fill="#663399" />
  <text x="50" y="62" font-family="Arial" font-size="40" font-weight="bold" text-anchor="middle" fill="white">WA</text>
</svg>
EOL
fi

# Create a placeholder favicon
if [ ! -f public/favicon.ico ]; then
    echo "Note: favicon.ico not found. You may want to add one to public/"
    echo "      For now, we'll use the logo.svg as a favicon as well."
    cp public/logo.svg public/favicon.ico
fi

# Run the dev server
echo "Starting documentation server..."
if [ "$PACKAGE_MANAGER" = "bun" ]; then
    bun run docs:dev
else
    npm run docs:dev
fi
