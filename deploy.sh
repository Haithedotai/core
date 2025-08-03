#!/bin/bash
set -e

echo "👉 Pulling latest code..."
git pull origin main

echo "🔨 Building Rust server..."
cd ./cargo
cargo build --release

echo "⚙️ Restarting Rust server..."
pm2 restart rust-server || pm2 start ./target/release/main --name rust-server

echo "🖼️ Building and restarting Bun client..."
cd ../packages/server
bun install
bun run build
pm2 restart bun-client || pm2 start --name bun-client -- bun run start

echo "✅ Deploy complete!"
