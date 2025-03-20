#!/bin/bash

# This script sets up the WebAssembly toolchain for Rust

# Check if rustup is installed
if ! command -v rustup &> /dev/null; then
    echo "Rustup not found. Installing Rustup..."
    curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
    source "$HOME/.cargo/env"
fi

# Add the WebAssembly target
echo "Adding wasm32-unknown-unknown target..."
rustup target add wasm32-unknown-unknown

# Check if wasm-pack is installed
if ! command -v wasm-pack &> /dev/null; then
    echo "wasm-pack not found. Installing wasm-pack..."
    cargo install wasm-pack
fi

# Check if binaryen (wasm-opt) is installed
if ! command -v wasm-opt &> /dev/null; then
    echo "wasm-opt not found. You may want to install binaryen for additional optimizations."
    echo "On macOS: brew install binaryen"
    echo "On Ubuntu/Debian: apt-get install binaryen"
    echo "On Fedora/RHEL: dnf install binaryen"
fi

echo "WebAssembly toolchain setup complete!"
