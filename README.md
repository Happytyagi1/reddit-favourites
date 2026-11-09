# Reddit Favourites

A small Reddit app built with [Devvit](https://developers.reddit.com/) that runs inside a Reddit post.

- **Browse:** enter a subreddit name and see its 10 hottest posts.
- **Favourite:** save posts you like with one click.
- **Favourites tab:** view your saved posts and remove them.
- **Full screen:** open the app in an expanded view.

## Tech stack

- **Client:** React + TypeScript, built with Vite. Runs in an iframe on reddit.com.
- **Server:** Devvit Web server (Hono). It calls the Reddit API through `@devvit/web/server`, so no API key is needed and there are no CORS issues.
- **Storage:** only favourite post IDs are saved, in the browser's `localStorage`. Post details are fetched from Reddit when needed.

## Project structure

```
reddit-favourites-devvit/
├── devvit.json          # Devvit app config (name, post entrypoint, menu, triggers)
├── src/
│   ├── client/          # React UI (game.html, game.tsx, PostItem, useFavourites hook)
│   ├── server/          # API routes: /api/hot, /api/posts, menu + install trigger
│   └── shared/          # Types shared by client and server
└── tools/               # TypeScript configs
```

## Getting started

Requirements: Node.js 24+ and a Reddit account.

```sh
cd reddit-favourites-devvit
npm install
npm run login     # log in to Devvit (opens a browser)
npm run dev       # playtest: builds, uploads, and gives you a test subreddit URL
```

In the test subreddit, open the mod menu (•••) and choose **Create Reddit Favourites post**, then open the post to use the app.

## Deploying

```sh
npm run deploy    # type-check, lint, and upload a new version
npm run launch    # deploy and submit the app for review / publishing
```

To share the app, install it on a **public** subreddit you moderate (from
https://developers.reddit.com/apps), create the post, and share the post's link.

See [reddit-favourites-devvit/README.md](reddit-favourites-devvit/README.md) for more detail.

## License

BSD-3-Clause. See [LICENSE](reddit-favourites-devvit/LICENSE).
