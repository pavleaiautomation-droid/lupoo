# Lupoo — Coming soon

A complete English-language landing page with a transparent Lupoo logo, hairline 2D infinity loop with a soft blue glow, email signup, persistent subscriber storage, confirmation email, unsubscribe, and a protected launch campaign.

## Stack

React 19 + TypeScript + Tailwind CSS 4, Next.js App Router conventions through **Vinext**, Cloudflare Workers API routes, Cloudflare D1 (SQLite), Drizzle migrations, and Resend over HTTPS. Vinext is the Sites starter's Next.js-compatible runtime and is currently a beta dependency. This is a Worker project, not a drop-in Vercel/Node Next.js deployment. No external database account is needed for the included local SQLite development database; Sites provisions hosted D1.

## Run locally

Use Node.js 24 LTS and npm. In this folder:

```powershell
npm ci
Copy-Item .env.example .dev.vars
Copy-Item .env.example .env
npm run db:migrate:local
npm run dev
```

Open the Local URL printed by the server (normally http://localhost:3000). `.dev.vars` supplies the local Worker; `.env` supplies the command-line launch script. Keep their values aligned. They are ignored by Git. Restart the development server after changing secrets. Local data persists under `.wrangler/state/v3/d1` and is separate from production data.

The current site collects the launch waitlist with `EMAIL_MODE=preview`: signups are stored durably in the D1 `subscribers` table and visitors see “You'll be notified when Lupoo launches.” No emails are sent or queued, and the launch endpoint stays disabled. Each unique address is saved once with its signup timestamp. Enable delivery separately when ready to notify this list.

## Enable real email

1. Create a Resend API key and verify a sender domain you control in Resend. Follow [Resend's send-email documentation](https://resend.com/docs/api-reference/emails/send-email) and [domain verification](https://resend.com/docs/dashboard/domains/introduction).
2. Configure these values in `.dev.vars` locally, or in the Sites production environment settings for hosting:

```dotenv
EMAIL_MODE=live
RESEND_API_KEY=re_your_real_key
EMAIL_FROM=Lupoo <hello@your-verified-domain.com>
SITE_URL=https://your-public-lupoo-domain.com
LAUNCH_URL=https://your-launched-product.com
ADMIN_TOKEN=replace-with-a-long-random-secret
```

3. Generate `ADMIN_TOKEN` with `node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"`. Store the same token securely in the server environment and your local `.env`. Never put secrets into browser code or variables prefixed with `NEXT_PUBLIC_`.
4. Deploy again after changing hosted environment values. Set `SITE_URL` to the public site visitors can actually access; unsubscribe links use this origin. Send to an address you own first and check the Resend delivery log before opening signup publicly.

The hosted site is public and configured to collect signups without sending email, as requested. No Resend key or real sender was supplied, and no live email delivery was attempted. The development server's `.dev.vars` is not deployed.

## Automation 1: confirmation

`POST /api/subscribe` accepts `{ "email": "person@example.com", "website": "" }` as JSON. The optional `website` field is a honeypot and must remain empty. The server normalizes and validates email, persists it, enqueues one confirmation, and immediately attempts Resend delivery.

- Subject: **You're on the list! | Lupoo**
- Includes both HTML and plain-text messages and an unsubscribe link.
- On provider acceptance, the form shows **You're on the list! Check your inbox.** Provider acceptance is not proof of inbox delivery.
- During an outage, the subscription remains saved and the page accurately says the confirmation is awaiting delivery. It never reports a sent email on a failed attempt.
- Duplicate and concurrent submissions reuse the same subscriber and delivery records. A previously unsubscribed address stays opted out; it cannot be silently reactivated.
- Request bodies are limited to 2 KiB. Stored rate limits allow 20 requests per IP and 3 per address per 10-minute bucket. The deployed Cloudflare IP header is trusted; local development shares a local bucket. Cross-origin browser requests are rejected.

For failure recovery, call `POST /api/admin/retry` with the admin bearer token. Each call handles at most ten due confirmations. A script is provided:

```powershell
npm run retry-emails -- --confirm
```

To automate recovery, run this command from your own scheduler every minute with `SITE_URL` and `ADMIN_TOKEN` set. This project includes the handler and script; it does not provision an external scheduler. The first confirmation attempt always happens directly in the signup request.

## Automation 2: LAUNCH

Set `SITE_URL`, `ADMIN_TOKEN`, and `LAUNCH_URL` for the intended production environment. Keep the token private. To begin the launch campaign:

```powershell
npm run launch -- --confirm
```

The script loads `.env` and calls the secure endpoint until the campaign has no remaining recipients. The endpoint is also usable directly:

```http
POST /api/admin/launch
Authorization: Bearer YOUR_ADMIN_TOKEN
Content-Type: application/json

{"confirm":"LAUNCH"}
```

- Subject: **Lupoo is Officially Launched!**
- The branded announcement includes a prominent **Explore Lupoo** link to `LAUNCH_URL`.
- `launch-v1` is a single fixed campaign. The first call establishes a signup cutoff. Later signups are not unexpectedly added to an already-started launch.
- Each endpoint request enqueues up to 25 recipients and sends up to ten. The CLI continues through all batches, so the server never loads the full mailing list into memory. Each recipient receives an individual email; addresses are not exposed to other subscribers.
- A stopped CLI can be rerun to resume. Concurrent requests use database leases. Successfully recorded sends are skipped permanently. Unsubscribed recipients are excluded.
- Individual sends are paced at roughly 1.6/second in each worker loop. Avoid running multiple launch CLIs at once, and adjust pacing for your Resend account limits. The provider may rate limit parallel confirmation traffic; these failures enter the retry path.
- The script requires `--confirm` because it sends real email. No public admin button or browser-stored admin secret is included.

## Retry and operational behavior

Email content is frozen when enqueued, and the delivery ID is the provider idempotency key. Failed requests back off exponentially. A 60-second database lease protects in-flight sends; network calls time out after 15 seconds. After five failed attempts, or if a first attempt is older than 23 hours, the record moves to `review` instead of risking another ambiguous send. Resend's [idempotency window is 24 hours](https://resend.com/docs/dashboard/emails/idempotency-keys), so exactly-once delivery cannot be guaranteed across an indefinitely long provider/database outage.

Inspect `deliveries` in D1 and the provider logs for `review` records. If Resend accepted the email, record its provider ID and set the delivery to `sent`. Only reset a record after establishing that it was not delivered. Never blindly clear all sent states. Persisted payloads contain email addresses and unsubscribe tokens; restrict database access and avoid dumping payloads into logs. There is no email address listing in any public API response.

An unsubscribe link opens a confirmation page; GET does not change preferences, protecting against email link scanners. The final POST uses an unguessable token and is idempotent. A message already accepted by the provider cannot be recalled.

## Customize the brand

The four provisional color tokens are at the top of `app/globals.css`: `--primary`, `--secondary`, `--background`, and `--accent`. The hero uses `public/lupoo-glass-infinity.webp`, a studio-style glass infinity sculpture with blue refraction that complements the brand palette.

`public/lupoo-logo.png` is the supplied logo with an AI-removed white background and a true alpha channel. It retains the source's blue form; as with any generated edit, compare against the original before final brand signoff. The header crops its transparent padding through CSS. Replace this PNG when a final vector logo becomes available.

The infinity is a flat SVG path, with a thin cyan stroke and a soft diffused glow. A brighter pulse of the same line width travels around the loop every seven seconds. Reduced-motion preferences stop the pulse. There is no 3D body or pause control. The layout adapts to mobile, forms have visible error feedback and accessible labels, and success updates do not reload the page. The sculpture is decorative and hidden from screen readers.

## Source structure

```text
app/
  page.tsx                     Landing page and async form
  globals.css                  Brand tokens and responsive design
  layout.tsx                   English document and page metadata
  api/subscribe/route.ts        Signup and immediate confirmation
  api/admin/launch/route.ts     Protected, resumable launch batches
  api/admin/retry/route.ts      Confirmation retry batch
  api/unsubscribe/route.ts      Token-based opt-out
  unsubscribe/page.tsx          Unsubscribe confirmation page
components/thin-infinity-visual.tsx       Responsive hero artwork
lib/server.ts                  Environment, D1, validation, auth, rate limiting
lib/email.ts                   Templates, outbox, provider delivery and leases
db/schema.ts                   Drizzle schema
drizzle/                       Versioned SQL migrations and metadata
scripts/launch.mjs             LAUNCH and retry command
scripts/test.mjs               API tests with real SQLite and mocked Resend
public/lupoo-logo.png           Transparent logo
public/lupoo-glass-infinity.webp            Studio-rendered glass infinity loop
.env.example                   All required environment keys
wrangler.local.jsonc            Local database migration configuration
.openai/hosting.json            Sites ID and logical database binding
vite.config.ts                 Sites / Vinext / Cloudflare build
components/ui/, hooks/          Retained starter component catalog
```

## Validation and deployment

```powershell
npm test
npm run lint
npx tsc --noEmit
npm run build
```

Tests exercise the actual route and delivery code with SQLite, substituting only the D1 adapter and Resend HTTP call. They cover validation, auth, cross-origin requests, duplicate/concurrent signup, persistence, confirmation, unsubscribe, launch filtering/resumption, delivery failure/retry, expired uncertainty, and preview/missing-configuration behavior. No real emails are sent. Lint covers application, database, library, and script code; the retained unused starter component catalog has pre-existing lint findings and is outside that command. Browser interaction/visual QA and live Resend delivery were not performed.

For schema changes, edit `db/schema.ts`, run `npm run db:generate`, inspect the migration, and apply locally with `npm run db:migrate:local`. Sites applies included migrations to its own D1 database during deployment. Do not rewrite migrations after production has applied them. Local rows are never copied to production.

Deploy this Worker build through Sites with the existing `.openai/hosting.json`. The generated `dist/server/index.js`, public client assets, metadata, and migrations form the deployment bundle. `npm start` serves the built Worker locally through Wrangler. Changing to standard Next.js on Node/Vercel requires replacing the D1 runtime adapter and deployment configuration.

### Remaining dependency caveat

Available security updates were applied to React/RSC, Vite, Sharp, Undici, ws, and esbuild. At delivery, `npm audit` still reports **2 high findings** through Vinext's `image-size@2.0.2`; the registry supplies no patched release for that dependency. These are image parser denial-of-service advisories for ICNS, JXL, and HEIF. This page uses a bundled PNG with optimization disabled and exposes no upload or remote image input. That reduces this page's exposure but does not clear the dependency finding. Review the upstream fix before declaring the complete dependency tree production-cleared, and do not introduce untrusted image parsing while this remains unresolved.

The site can collect the public waitlist without email credentials. Future email delivery requires a configured provider, verified sender, final launch destination URL, and a delivery smoke test. The dependency caveat above remains documented.

## Subscriber dashboard

Open /admin to view saved emails and download CSV. Configure SUBSCRIBERS_PASSWORD as a server-side secret of at least 32 characters. This separate password cannot trigger email campaigns. It is kept only in memory while the page is open; Lock or reload clears it. API responses are never cached and do not expose unsubscribe tokens. Ten failed attempts per IP per ten-minute window are allowed. The downloadable CSV includes email, signup date, and subscription status.

