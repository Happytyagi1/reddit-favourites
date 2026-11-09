# Reddit Favourites (Devvit)

Browse the 10 hottest posts of any subreddit, save favourites, and view/remove them.
Runs inside Reddit as a Devvit Web app (React client + Devvit server).

- `src/client/` – React UI (runs in an iframe on reddit.com). Favourite post **IDs** are stored in `localStorage`.
- `src/server/routes/api.ts` – `/api/hot?subreddit=` and `/api/posts?ids=`, using `reddit.getHotPosts` / `reddit.getPostById`.
- `src/shared/api.ts` – types shared by both.

## Run it

Requires Node 24+ and a Reddit account.

```sh
npm install
npm run login        # devvit login (opens browser)
npm run dev          # devvit playtest: builds, uploads, and gives you a test subreddit URL
```

Open the playtest URL, use the subreddit menu (⋯) → **Create Reddit Favourites post** if no post exists, then tap **Open app**.

If the name `happy-assignment1` is taken, change `name` in `devvit.json`.

## Publish

```sh
npm run deploy       # type-check, lint, devvit upload
npm run launch       # also submits for review / publishes
```
