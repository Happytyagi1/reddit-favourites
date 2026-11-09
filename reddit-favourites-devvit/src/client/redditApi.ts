// The client calls this app's own Devvit server (/api/*), which uses
// Reddit's API through @devvit/web/server. No CORS problems, no API key.
import type {
  ErrorResponse,
  HotPostsResponse,
  PostSummary,
  PostsByIdResponse,
} from '../shared/api';

async function getJson<T>(url: string): Promise<T> {
  let res: Response;
  try {
    res = await fetch(url);
  } catch (err) {
    console.error('Request failed:', url, err);
    throw new Error('Could not reach the app server. Check your connection and try again.', {
      cause: err,
    });
  }
  const body: unknown = await res.json().catch(() => null);
  if (!res.ok) {
    const message =
      body && typeof body === 'object' && 'message' in body
        ? String((body as ErrorResponse).message)
        : `Server returned an error (${res.status}).`;
    throw new Error(message);
  }
  return body as T;
}

export async function fetchHotPosts(
  subreddit: string
): Promise<{ subreddit: string; posts: PostSummary[] }> {
  const data = await getJson<HotPostsResponse>(
    `/api/hot?subreddit=${encodeURIComponent(subreddit.trim())}`
  );
  return { subreddit: data.subreddit, posts: data.posts };
}

export async function fetchPostsByIds(ids: string[]): Promise<PostSummary[]> {
  if (ids.length === 0) return [];
  const data = await getJson<PostsByIdResponse>(
    `/api/posts?ids=${encodeURIComponent(ids.join(','))}`
  );
  // Keep the order the user saved them in.
  const byId = new Map(data.posts.map((p) => [p.id, p]));
  return ids.flatMap((id) => {
    const p = byId.get(id);
    return p ? [p] : [];
  });
}
