# Brewlert

A Sunday email digest of newly merged Homebrew formulae and casks.

## How it works

- Searches merged pull requests labeled `new formula` and `new cask` for the previous Sunday–Saturday window.
- Fetches only the matching per-item Homebrew JSON endpoints to add descriptions, versions, and homepages.
- Stores subscribers in one of three Resend segments: formulae, casks, or both.
- Sends one Resend Broadcast per segment at 13:00 UTC every Sunday via Vercel Cron.

## Local setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

The site and live additions preview work without email credentials. The signup endpoint returns a friendly unavailable message until Resend is configured.

## Configure delivery

1. Create a Resend account and verify the sending domain.
2. Add `RESEND_API_KEY` to `.env.local`, then create the three segments:

   ```bash
   npm run setup:resend
   ```

3. Copy the printed segment IDs into `.env.local`.
4. Set `RESEND_FROM`, a long random `CRON_SECRET`, and optionally `GITHUB_TOKEN`.
5. Deploy to Vercel and add the same environment variables to the production project.

To test the cron endpoint without sending to production contacts, use dedicated test segments and call:

```bash
curl -H "Authorization: Bearer $CRON_SECRET" http://localhost:3000/api/cron/digest
```

Vercel Cron runs only for production deployments. The configured time is Sunday 13:00 UTC.

## Data sources

- [Homebrew JSON API](https://formulae.brew.sh/docs/api/)
- [Homebrew/core new-formula pull requests](https://github.com/Homebrew/homebrew-core/pulls?q=is%3Apr+is%3Amerged+label%3A%22new+formula%22)
- [Homebrew/cask new-cask pull requests](https://github.com/Homebrew/homebrew-cask/pulls?q=is%3Apr+is%3Amerged+label%3A%22new+cask%22)

Brewlert is an independent project and is not affiliated with Homebrew.
