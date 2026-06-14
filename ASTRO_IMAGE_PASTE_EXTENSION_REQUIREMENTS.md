# VS Code Extension: Astro Image Paste with HEIC Conversion

## Overview

This extension enables seamless drag-and-drop or paste of images (including HEIC) into Astro blog posts. It automatically:
- Converts HEIC images to JPEG or PNG
- Optimizes images for web (resize, compress, strip metadata) to reduce file size and ensure Astro compatibility
- Saves images to `public/images/<year>`
- Inserts a Markdown image link at the caret position with the correct Astro path (`/images/<year>/...`)

## User Stories
- **As a blogger**, I want to drag or paste images (including HEIC) into my Markdown post, so that the image is saved and embedded automatically with the correct path.
- **As a Mac user**, I want HEIC images to be converted to JPEG/PNG, so they display correctly on the web.
- **As a site maintainer**, I want all images organized by year in `public/images/<year>`, so my image folder stays tidy.


## Features
- Paste or drag-and-drop image files (HEIC, JPEG, PNG, etc.) into Markdown/MDX files
- Detects HEIC images and converts to JPEG/PNG
- Optimizes images for web (resize to max width, compress, strip metadata)
- Automatically creates `public/images/<year>` if it does not exist
- Saves the image with a unique name (timestamp or hash)
- Inserts a Markdown image link at the caret: `![](/images/<year>/filename.jpg)`
- Configurable image format (JPEG/PNG), quality, resize dimensions, and path
- Optionally supports custom image folder or path template

## Requirements

### Functional
- [ ] Handle drag-and-drop and paste events in Markdown/MDX editors
- [ ] Detect image type (HEIC, JPEG, PNG, etc.)
- [ ] Convert HEIC to JPEG/PNG using a Node.js library (e.g., sharp, heic-convert)
- [ ] Optimize images for web (resize to max width, compress, strip metadata)
- [ ] Save image to `public/images/<year>`
- [ ] Insert Markdown image link at caret with `/images/<year>/filename.ext` path
- [ ] Ensure unique filenames to avoid overwrites
- [ ] Provide extension settings for output format, quality, resize dimensions, and path

### Non-Functional
- [ ] Fast and non-blocking (background conversion)
- [ ] Works cross-platform (macOS, Windows, Linux)
- [ ] Minimal dependencies
- [ ] No telemetry or tracking

## Out of Scope
- Image cropping UI
- Uploading to remote storage (local only)
- Non-image file types


## Example Workflow
1. User drags or pastes a HEIC image into a Markdown file
2. Extension converts HEIC to JPEG, resizes and compresses the image for web, saves as `public/images/2026/IMG_1234.jpg`
3. Extension inserts `![](/images/2026/IMG_1234.jpg)` at the caret

## Implementation Notes
- Use VS Code extension API for editor events
- Use `sharp` or `heic-convert` for image conversion
- Use workspace root to resolve `public/images/<year>`
- Generate filenames using timestamp or hash
- Provide settings in `package.json` for customization

## Future Enhancements
- Image resizing/cropping before insert
- Alt text prompt
- Remote upload support
- Progress notifications

---
