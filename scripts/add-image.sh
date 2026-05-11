#!/bin/bash

# add-image.sh - Optimize and add an image for blog posts
# Usage: ./scripts/add-image.sh /path/to/image.jpg

set -e

if [[ $# -ne 1 ]]; then
  echo "Usage: $0 /path/to/image"
  exit 1
fi

SOURCE="$1"

if [[ ! -f "$SOURCE" ]]; then
  echo "Error: File not found: $SOURCE"
  exit 1
fi

# Get image info
FILENAME=$(basename "$SOURCE")
EXT="${FILENAME##*.}"
EXT_LOWER=$(echo "$EXT" | tr '[:upper:]' '[:lower:]')

# Determine year (use 2025 as default, or extract from filename if it contains a 4-digit year)
YEAR=2025
if [[ $FILENAME =~ [0-9]{4} ]]; then
  YEAR=$(echo "$FILENAME" | grep -o '[0-9]\{4\}' | head -1)
fi

# Create destination directory
DEST_DIR="public/images/$YEAR"
mkdir -p "$DEST_DIR"

# Generate output filename (keep original name)
DEST_FILE="$DEST_DIR/$FILENAME"

# Optimize based on format
case "$EXT_LOWER" in
  jpg|jpeg)
    convert "$SOURCE" -resize "1200x1200>" -quality 80 "$DEST_FILE"
    ;;
  png)
    convert "$SOURCE" -resize "1200x1200>" -quality 85 "$DEST_FILE"
    ;;
  gif)
    # Keep GIFs as-is, no conversion
    cp "$SOURCE" "$DEST_FILE"
    ;;
  webp)
    convert "$SOURCE" -resize "1200x1200>" -quality 80 "$DEST_FILE"
    ;;
  *)
    # Default: optimize with ImageMagick
    convert "$SOURCE" -resize "1200x1200>" -quality 80 "$DEST_FILE"
    ;;
esac

# Print relative link for markdown
echo "/images/$YEAR/$FILENAME"
