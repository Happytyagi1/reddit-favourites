// Types shared by the server (/api routes) and the client (React app).

// Only the fields the UI needs: score, title, link to comments, plus a few extras.
export type PostSummary = {
  id: string; // base36 id without the "t3_" prefix, e.g. "1abc23"
  title: string;
  score: number;
  subreddit: string;
  commentsUrl: string;
  numComments: number;
  stickied: boolean;
};

export type HotPostsResponse = {
  type: 'hot';
  subreddit: string;
  posts: PostSummary[];
};

export type PostsByIdResponse = {
  type: 'posts';
  posts: PostSummary[];
};

export type ErrorResponse = {
  status: 'error';
  message: string;
};
