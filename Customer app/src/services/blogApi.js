import { apiFetch } from "../lib/api.js";
import { BLOG_CATEGORIES, blogPosts as FALLBACK_POSTS } from "../data/blog.js";

export { BLOG_CATEGORIES };

function normalizePost(post) {
  if (!post) return null;
  return {
    ...post,
    content: Array.isArray(post.content) ? post.content : [],
  };
}

export async function fetchBlogPosts(category = "All") {
  try {
    const query = category && category !== "All" ? `?category=${encodeURIComponent(category)}` : "";
    const data = await apiFetch(`/api/blog${query}`);
    const posts = Array.isArray(data.posts) ? data.posts.map(normalizePost) : [];
    return posts.length ? posts : FALLBACK_POSTS;
  } catch {
    return FALLBACK_POSTS;
  }
}

export async function fetchBlogPost(slug) {
  try {
    const data = await apiFetch(`/api/blog/${encodeURIComponent(slug)}`);
    return normalizePost(data.post);
  } catch {
    return FALLBACK_POSTS.find((post) => post.id === slug) ?? null;
  }
}

export function getFeaturedFromList(posts) {
  if (!Array.isArray(posts) || !posts.length) return null;
  return posts.find((post) => post.featured) ?? posts[0];
}

export function getRelatedFromList(posts, slug, limit = 3) {
  const list = Array.isArray(posts) ? posts : [];
  const current = list.find((post) => post.id === slug);
  if (!current) return list.slice(0, limit);
  const same = list.filter((p) => p.id !== slug && p.category === current.category);
  const rest = list.filter((p) => p.id !== slug && p.category !== current.category);
  return [...same, ...rest].slice(0, limit);
}
