This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Contact form (Gmail SMTP setup)

The contact page (`/contact`) posts to `/api/contact`, which emails submissions to the site owner via Gmail SMTP (nodemailer). It is **not deployed yet** — the files are kept locally (`src/app/contact/`, `src/app/api/contact/`, `src/components/contact-form.tsx`) until the env vars below exist in production.

### One-time setup

1. Enable **2-Step Verification** on the Google account (required for app passwords).
2. Create an app password at <https://myaccount.google.com/apppasswords> — 16 characters, shown once.
3. Add two environment variables:

   | Where | How | Keys |
   | ----- | --- | ---- |
   | Local | `stockpulse/.env.local` (git-ignored), then restart `npm run dev` | see below |
   | Vercel | Project → Settings → Environment Variables → add, then **Redeploy** | see below |

   ```env
   GMAIL_USER=designlove.in@gmail.com
   GMAIL_APP_PASSWORD=<16-char app password, no spaces>
   ```

### Go live

The contact files are untracked on purpose. Once the Vercel env vars are set:

```bash
git add src/app/contact src/app/api/contact src/components/contact-form.tsx README.md
```

Then restore the temporarily-removed references (each was reworded when the page was held back — see the reworded lines in these files):

| File | What to restore |
| ---- | --------------- |
| `src/app/page.tsx` | Homepage footer: re-add `<Link href="/contact">Contact</Link>` to the footer nav |
| `src/app/sitemap.ts` | Re-add the sitemap entry: `{ url: BASE_URL + "/contact", ... }` |
| `src/app/about/page.tsx` | "Get in touch" section: replace the "coming soon" sentence with a link to `/contact` |
| `src/app/terms/page.tsx` | Section 8 "Contact": replace the "coming soon" sentence with a pointer to `/contact` |
| `src/app/privacy/page.tsx` | Section 8: "reach out through the site" → point at `/contact` |

```bash
git add -u   # stage the restored references
git commit -m "Add contact page with email form"
git push origin main
npm run deploy:prod
```

### Verify

1. `https://www.abanti.in/contact` returns 200 (not 404) and the footer link is back.
2. Submit a test message from a **different** address than `GMAIL_USER`:
   - owner email arrives at `designlove.in@gmail.com` with `replyTo` set to the submitter;
   - the submitter gets the confirmation auto-reply (subject "We received your message");
   - resubmitting within an hour from the same address must **not** produce a second auto-reply;
   - the auto-reply also lands in Gmail → Sent.
3. Spam path: submit with the hidden `website` honeypot filled (devtools) → response is `{"ok":true}` but no email is sent.
4. Gmail → Security → check "Less secure app blocks" / account notifications for SMTP warnings; none should appear (app passwords are the supported method).

### Behavior notes

- Spam protection: hidden honeypot field + in-memory IP rate limit (3 submissions / 10 min).
- The confirmation auto-reply sends at most once per address per hour; its failure never fails the submission.
- `Auto-Submitted: auto-replied` header prevents mail loops between auto-responders.
- If env vars are missing the form returns a graceful "Email is not configured yet" error.
- The recipient is hardcoded as `TO_EMAIL` in `src/app/api/contact/route.ts` (`designlove.in@gmail.com`) — change it there if the owner email ever changes. `GMAIL_USER` must stay an address on the same Google account, because Gmail sends via that account's SMTP.
- Gmail caps SMTP at ~500 recipients/day (2000 for Workspace) — the rate limit and auto-reply dedupe keep normal traffic far below it.
- The rate limiter and auto-reply dedupe are in-memory: they reset on cold start. Fine for spam damping; don't rely on them as a hard quota.
