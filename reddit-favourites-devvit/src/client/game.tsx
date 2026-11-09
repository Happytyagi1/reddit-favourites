import './index.css';

import { StrictMode, useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { createRoot } from 'react-dom/client';
import { getWebViewMode, requestExpandedMode } from '@devvit/web/client';
import type { PostSummary } from '../shared/api';
import { fetchHotPosts, fetchPostsByIds } from './redditApi';
import { useFavourites } from './hooks/useFavourites';
import type { Favourites } from './hooks/useFavourites';
import { PostItem } from './PostItem';

type Status = 'idle' | 'loading' | 'error' | 'done';

export const App = () => {
  const favourites = useFavourites();
  const [tab, setTab] = useState<'browse' | 'favs'>('browse');
  // Reddit shows the post inline (inside the feed) or expanded (full screen).
  const [expanded] = useState(() => {
    try {
      return getWebViewMode() === 'expanded';
    } catch {
      return false;
    }
  });

  return (
    <div className="app">
      <header className="header">
        <h1>Reddit Favourites</h1>
        <nav className="tabs">
          <button className={tab === 'browse' ? 'active' : ''} onClick={() => setTab('browse')}>
            Browse
          </button>
          <button className={tab === 'favs' ? 'active' : ''} onClick={() => setTab('favs')}>
            Favourites <span className="count">{favourites.ids.length}</span>
          </button>
          {/* In full screen Reddit shows its own toolbar with a ✕, so hide this there. */}
          {!expanded && (
            <button
              className="fullscreen-btn"
              onClick={(e) =>
                requestExpandedMode(e.nativeEvent, 'default', { title: 'Reddit Favourites' })
              }
              title="Open the app full screen"
            >
              ⛶ Full screen
            </button>
          )}
        </nav>
      </header>

      {!favourites.storageAvailable && (
        <p className="warning">
          Your browser is blocking storage for this embedded app, so favourites will be lost
          when you close it.
        </p>
      )}

      <main>
        {/* Both views stay mounted so the subreddit listing survives tab switches. */}
        <div hidden={tab !== 'browse'}>
          <Browse favourites={favourites} />
        </div>
        <div hidden={tab !== 'favs'}>
          <FavouritesView favourites={favourites} active={tab === 'favs'} />
        </div>
      </main>
    </div>
  );
};

// Search a subreddit, show its top 10 hot posts, pick favourites.
const Browse = ({ favourites }: { favourites: Favourites }) => {
  const [input, setInput] = useState('');
  const [subreddit, setSubreddit] = useState('');
  const [posts, setPosts] = useState<PostSummary[]>([]);
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState('');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;
    setStatus('loading');
    setError('');
    try {
      const result = await fetchHotPosts(input);
      setPosts(result.posts);
      setSubreddit(result.subreddit);
      setStatus('done');
    } catch (err) {
      setPosts([]);
      setError(err instanceof Error ? err.message : String(err));
      setStatus('error');
    }
  }

  return (
    <section>
      <form className="search" onSubmit={handleSubmit}>
        <span className="prefix">r/</span>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="subreddit name, e.g. programming"
          aria-label="Subreddit name"
        />
        <button type="submit" disabled={status === 'loading'}>
          {status === 'loading' ? 'Loading…' : 'Show posts'}
        </button>
      </form>

      {status === 'error' && <p className="error">{error}</p>}
      {status === 'idle' && <p className="hint">Enter a subreddit to see its 10 hottest posts.</p>}

      {status === 'done' && (
        <>
          <h2>Hot in r/{subreddit}</h2>
          <ol className="posts">
            {posts.map((post) => (
              <PostItem
                key={post.id}
                post={post}
                isFavourite={favourites.isFavourite(post.id)}
                onToggle={favourites.toggle}
              />
            ))}
          </ol>
        </>
      )}
    </section>
  );
};

// List favourites from every subreddit, with live data from Reddit.
const FavouritesView = ({ favourites, active }: { favourites: Favourites; active: boolean }) => {
  const { ids, remove } = favourites;
  const key = ids.join(',');
  // The last finished request, tagged with the ID list it was for.
  const [result, setResult] = useState<{
    key: string;
    posts: PostSummary[];
    error: string;
  } | null>(null);

  // Re-fetch from Reddit when the tab opens or the saved IDs change.
  useEffect(() => {
    if (!active) return;
    let cancelled = false;
    fetchPostsByIds(key ? key.split(',') : [])
      .then((posts) => {
        if (!cancelled) setResult({ key, posts, error: '' });
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setResult({ key, posts: [], error: err instanceof Error ? err.message : String(err) });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [key, active]);

  const status: Status =
    !result || result.key !== key ? 'loading' : result.error ? 'error' : 'done';
  const error = result?.error ?? '';
  // Hide a removed post immediately instead of waiting for the re-fetch.
  const visible = (result?.posts ?? []).filter((p) => ids.includes(p.id));

  return (
    <section>
      <h2>Your favourite posts</h2>
      {ids.length === 0 ? (
        <p className="hint">No favourites yet. Browse a subreddit and press ☆ Favourite.</p>
      ) : status === 'error' ? (
        <p className="error">{error}</p>
      ) : status === 'loading' && visible.length === 0 ? (
        <p className="hint">Loading your favourites from Reddit…</p>
      ) : (
        <ol className="posts">
          {visible.map((post) => (
            <PostItem key={post.id} post={post} onToggle={remove} showSubreddit mode="remove" />
          ))}
        </ol>
      )}
    </section>
  );
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
