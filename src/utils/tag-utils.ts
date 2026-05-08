export function normalizeTag(tag: string): string {
  return tag.trim().toLowerCase();
}

export function getTagSlug(tag: string): string {
  return normalizeTag(tag)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}