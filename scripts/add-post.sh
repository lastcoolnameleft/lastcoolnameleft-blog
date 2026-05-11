#!/bin/bash

# add-post.sh - Create a new blog post with frontmatter template
# Usage: ./scripts/add-post.sh "Your Post Title"

set -e

if [[ $# -ne 1 ]]; then
  echo "Usage: $0 \"Your Post Title\""
  exit 1
fi

TITLE="$1"

# Slugify title: lowercase, replace spaces/punctuation with hyphens
SLUG=$(echo "$TITLE" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]/-/g' | sed 's/-\+/-/g' | sed 's/-$//')

# Use current year
YEAR=$(date +%Y)

# Create directory
POST_DIR="src/content/blog/$YEAR"
mkdir -p "$POST_DIR"

# Full path
POST_FILE="$POST_DIR/$SLUG.md"

# Check if file exists
if [[ -f "$POST_FILE" ]]; then
  echo "Error: File already exists: $POST_FILE"
  exit 1
fi

# Get current date in ISO format
PUBDATE=$(date -u +"%Y-%m-%dT%H:%M:%S.000Z")

# Create file with frontmatter template
cat > "$POST_FILE" << EOF
---
draft: true
title: "$TITLE"
description: ""
authors:
  - Tommy Falgout
pubDate: $PUBDATE
license: cc-by-nc-sa-4-0
tags:
  - 
image:
  src: 
  alt: ""
ogImage:
  src: 
---

## Heading

Your content here...
EOF

echo "$POST_FILE"
