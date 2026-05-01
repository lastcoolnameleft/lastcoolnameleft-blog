#!/bin/bash

BLOG_DIR="/Users/thfalgou/git/lastcoolnameleft/lastcoolnameleft-blog"
DEMOS_DIR="$BLOG_DIR/demos"

# 5 diverse blog posts to copy
POSTS=(
  "src/content/blog/2001/the-start-of-it-all.md"
  "src/content/blog/2007/i-have-arrived.md"
  "src/content/blog/2014/reflections-in-the-mirror.md"
  "src/content/blog/2020/how-i-built-a-super-cool-led-lanyard.md"
  "src/content/blog/2025/disco-kilt-a-journey-of-sparkles-leds-and-scottish-pride.md"
)

echo "=== Setting up Fuwari Demo ==="
cd "$DEMOS_DIR/fuwari-demo"

# Remove demo posts, keep structure
rm -rf src/content/posts
mkdir -p src/content/posts

# Copy 5 sample posts from main blog (convert schema on copy)
for post in "${POSTS[@]}"; do
  filename=$(basename "$post")
  if [ -f "$BLOG_DIR/$post" ]; then
    cp "$BLOG_DIR/$post" "src/content/posts/$filename"
    echo "✓ Copied $filename"
  fi
done

# Update config with Tommy's info
sed -i '' 's/title: "Fuwari"/title: "LASTCOOLNAMELEFT"/g' src/config.ts
sed -i '' 's/subtitle: "Demo Site"/subtitle: "Journaling of an overly curious maker"/g' src/config.ts
sed -i '' 's/name: "Lorem Ipsum"/name: "Tommy Falgout"/g' src/config.ts
sed -i '' 's|bio: "Lorem ipsum.*"|bio: "Engineer, maker, swing dancer, and overly curious human living in Texas."|g' src/config.ts
sed -i '' 's|github.com/saicaca/fuwari|github.com/lastcoolnameleft|g' src/config.ts

echo ""
echo "✓ Fuwari demo setup complete"
echo "  Run: cd demos/fuwari-demo && pnpm install && pnpm dev"
