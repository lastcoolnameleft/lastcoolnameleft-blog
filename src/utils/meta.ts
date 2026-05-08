import { getPlainTextFromMarkdown } from "./plainTextFromMarkdown";
import { getReadingTime } from "./readingTime";
import type { WithMeta } from "../types";
import fs from "node:fs";
import path from "node:path";

function getFirstMarkdownImage(markdown: string):
  | { src: string; alt?: string }
  | undefined {
  // Matches markdown image syntax, including linked images like [![](...)](...)
  const match = markdown.match(/!\[([^\]]*)\]\(([^\s)]+)(?:\s+"[^"]*")?\)/m);
  if (!match) return undefined;

  const alt = match[1]?.trim() || undefined;
  const src = match[2]?.trim();
  if (!src) return undefined;

  const normalizedSrc = src.startsWith("<") && src.endsWith(">")
    ? src.slice(1, -1)
    : src;

  return { src: normalizedSrc, alt };
}

function isValidLocalImageSource(src: string): boolean {
  // Skip remote URLs and protocol-relative URLs to avoid runtime broken links.
  if (/^(https?:)?\/\//i.test(src)) return false;

  // Only support absolute paths served from /public for card fallback.
  if (!src.startsWith("/")) return false;

  // Only allow image-like assets.
  if (!/\.(avif|gif|jpe?g|png|svg|webp)$/i.test(src)) return false;

  const cleanSrc = src.split("?")[0].split("#")[0];
  const filePath = path.join(process.cwd(), "public", cleanSrc);
  return fs.existsSync(filePath);
}

export function attachMeta<T extends { body?: string }>(post: T): WithMeta<T> {
  const plainText = post.body ? getPlainTextFromMarkdown(post.body) : "";
  const readingTime = post.body
    ? getReadingTime(post.body, plainText)
    : undefined;
  const previewImageCandidate = post.body
    ? getFirstMarkdownImage(post.body)
    : undefined;
  const previewImage =
    previewImageCandidate && isValidLocalImageSource(previewImageCandidate.src)
      ? previewImageCandidate
      : undefined;

  return {
    ...post,
    meta: {
      plainText,
      readingTimeText: readingTime?.text ?? "",
      previewImage,
    },
  };
}
