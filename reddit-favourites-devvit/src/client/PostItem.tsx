import { navigateTo } from '@devvit/web/client';
import type { PostSummary } from '../shared/api';

function formatScore(n: number): string {
  if (n >= 10000) return `${(n / 1000).toFixed(0)}k`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

type PostItemProps = {
  post: PostSummary;
  onToggle: (id: string) => void;
  isFavourite?: boolean;
  showSubreddit?: boolean;
  mode?: 'toggle' | 'remove';
};

// One row: score, title, link to the comments page, and a favourite button.
export const PostItem = ({
  post,
  onToggle,
  isFavourite = false,
  showSubreddit = false,
  mode = 'toggle',
}: PostItemProps) => (
  <li className="post">
    <div className="score" title={`${post.score} points`}>
      <span className="score-arrow" aria-hidden="true">
        ▲
      </span>
      {formatScore(post.score)}
    </div>

    <div className="post-body">
      <h3 className="post-title">{post.title}</h3>
      <div className="post-meta">
        {showSubreddit && <span className="sub">r/{post.subreddit}</span>}
        {post.stickied && <span className="pinned">Pinned</span>}
        {/* Inside Reddit's iframe, links must open via navigateTo. */}
        <a
          href={post.commentsUrl}
          onClick={(e) => {
            e.preventDefault();
            navigateTo(post.commentsUrl);
          }}
        >
          {post.numComments} comments ↗
        </a>
      </div>
    </div>

    {mode === 'remove' ? (
      <button className="fav-btn remove" onClick={() => onToggle(post.id)}>
        Remove
      </button>
    ) : (
      <button
        className={`fav-btn ${isFavourite ? 'on' : ''}`}
        onClick={() => onToggle(post.id)}
        aria-pressed={isFavourite}
      >
        {isFavourite ? '★ Favourited' : '☆ Favourite'}
      </button>
    )}
  </li>
);
