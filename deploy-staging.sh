#!/bin/bash
set -e

source ~/.profile || true
source ~/.bashrc || true
export PATH="/root/.bun/bin:$PATH"

echo "✅ Environment loaded."

echo "👉 Pulling latest code..."
git pull origin staging

echo "🔨 Building Rust server..."
cd ./cargo
cargo build --release

echo "⚙️ Restarting Rust server..."
pm2 restart staging-rust-server || pm2 start ./target/release/main --name staging-rust-server

echo "🖼️ Building and restarting Bun client..."
cd ../packages/server
bun install
bun run build
pm2 restart staging-bun-client || pm2 start --name staging-bun-client -- bun run start

echo "✅ Deploy complete!"
