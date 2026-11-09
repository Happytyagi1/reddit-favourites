import { Hono } from 'hono';
import { reddit } from '@devvit/web/server';
import type { Post } from '@devvit/web/server';
import type {
  ErrorResponse,
  HotPostsResponse,
  PostSummary,
  PostsByIdResponse,
} from '../../shared/api';

export const api = new Hono();

const SUBREDDIT_RE = /^[A-Za-z0-9_]{2,21}$/;
const POST_ID_RE = /^[a-z0-9]{1,12}$/;
const MAX_FAVOURITES = 100;

function toSummary(post: Post): PostSummary {
  return {
    id: post.id.replace(/^t3_/, ''),
    title: post.title,
    score: post.score,
    subreddit: post.subredditName,
    commentsUrl: `https://www.reddit.com${post.permalink}`,
    numComments: post.numberOfComments,
    stickied: post.stickied,
  };
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

// GET /api/hot?subreddit=aww -> top 10 "hot" posts of that subreddit.
api.get('/hot', async (c) => {
  const name = (c.req.query('subreddit') ?? '').trim().replace(/^\/?r\//i, '');
  if (!SUBREDDIT_RE.test(name)) {
    return c.json<ErrorResponse>(
      {
        status: 'error',
        message: 'Enter a valid subreddit name (letters, numbers and underscores).',
      },
      400
    );
  }

  try {
    const posts = await reddit
      .getHotPosts({ subredditName: name, limit: 10, pageSize: 10 })
      .all();
    if (posts.length === 0) {
      return c.json<ErrorResponse>(
        { status: 'error', message: `No posts found in r/${name}.` },
        404
      );
    }
    return c.json<HotPostsResponse>({
      type: 'hot',
      subreddit: posts[0]?.subredditName ?? name,
      posts: posts.slice(0, 10).map(toSummary),
    });
  } catch (error) {
    console.error(`getHotPosts failed for r/${name}:`, error);
    return c.json<ErrorResponse>(
      {
        status: 'error',
        message: `Could not load r/${name}. It may not exist, or be private or banned. (${errorMessage(error)})`,
      },
      404
    );
  }
});

// GET /api/posts?ids=abc,def -> current data for the user's favourite posts.
api.get('/posts', async (c) => {
  const ids = (c.req.query('ids') ?? '')
    .split(',')
    .map((s) => s.trim().replace(/^t3_/, ''))
    .filter((s) => POST_ID_RE.test(s))
    .slice(0, MAX_FAVOURITES);

  // Fetch each post; a deleted/unavailable post is skipped instead of failing the list.
  const results = await Promise.allSettled(
    ids.map((id) => reddit.getPostById(`t3_${id}`))
  );
  const posts: PostSummary[] = [];
  results.forEach((r, i) => {
    if (r.status === 'fulfilled') posts.push(toSummary(r.value));
    else console.error(`getPostById failed for ${ids[i]}:`, r.reason);
  });

  return c.json<PostsByIdResponse>({ type: 'posts', posts });
});
