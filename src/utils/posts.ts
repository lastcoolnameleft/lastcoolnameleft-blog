import type { CollectionEntry } from 'astro:content';

/** Extract the filename slug from a post id (strips any directory prefix). */
export function getPostSlug(post: CollectionEntry<'blog'>): string {
	const parts = post.id.split('/');
	return parts[parts.length - 1];
}

export function getPostPath(post: CollectionEntry<'blog'>): string {
	const date = post.data.pubDate;
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, '0');
	return `/${year}/${month}/${getPostSlug(post)}/`;
}
