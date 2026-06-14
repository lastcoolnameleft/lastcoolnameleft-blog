# VS Code Keybinding & Workflow: Optimize and Insert Pasted Images

## Prerequisites
- Install Node.js (v18+ recommended)
- Install dependencies in your repo root:
  ```sh
  npm install sharp
  ```
- (Optional) Use the Paste Image extension to paste images into a temp folder (e.g., `src/content/blog/2026/_pasted/`)

## Important Limitation
- This workflow operates on files on disk, not the unsaved VS Code editor buffer.
- After pasting an image into a markdown post, you must save the markdown file before running the task.
- Without a real VS Code extension, a repo script cannot reliably read or rewrite the unsaved pasted markdown line.

## Usage Workflow
1. **Paste your image** into the markdown file so the temporary local image reference is created.
2. **Save the markdown file.**
3. **Run the script** with the image path, markdown file, and caret line:
   ```sh
   node scripts/optimize-paste-image.mjs <image-path> <markdown-file> <caret-line>
   ```
   - Example:
     ```sh
     node scripts/optimize-paste-image.mjs src/content/blog/2026/_pasted/IMG_1234.heic src/content/blog/2026/my-post.md 42
     ```
  - This will convert, optimize, move the image, and replace the pasted local image reference.

### Current Shortcut Workflow
1. Paste the image into the markdown file.
2. Save the file.
3. Leave the cursor on or below the pasted image line.
4. Press `Cmd+Option+V`.
5. The task will auto-detect the local pasted image, move it to `public/images/<year>`, and rewrite the markdown to `/images/<year>/...`.

## VS Code Task Setup
1. Add this to `.vscode/tasks.json`:
   ```json
   {
     "version": "2.0.0",
     "tasks": [
       {
         "label": "Optimize and Insert Image",
         "type": "shell",
         "command": "node scripts/optimize-paste-image.mjs ${input:imagePath} ${file} ${lineNumber}",
         "problemMatcher": [],
         "inputs": [
           {
             "id": "imagePath",
             "type": "promptString",
             "description": "Path to pasted image file"
           },
           {
             "id": "lineNumber",
             "type": "promptString",
             "description": "Caret line number (0-based)"
           }
         ]
       }
     ]
   }
   ```
2. Reload VS Code.
3. Open your Markdown file, note the line number where you want the image.
4. Run the task: `Cmd+Shift+P` → `Tasks: Run Task` → `Optimize and Insert Image`.
5. Enter the image path and caret line when prompted.

## Optional: Keybinding
Add to `.vscode/keybindings.json`:
```json
[
  {
    "key": "ctrl+alt+i",
    "command": "workbench.action.tasks.runTask",
    "args": "Optimize and Insert Image"
  }
]
```

---
This workflow lets you paste, optimize, and insert images with minimal steps, all inside your repo.
