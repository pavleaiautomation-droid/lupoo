# Lupoo on Vercel

This Next.js project hosts the Lupoo website on Vercel. Signup, unsubscribe, and password-protected subscriber viewing use the existing Lupoo Sites backend and D1 database. Keep that backend running and publicly reachable. Existing email records and the admin password are retained there; no secrets are embedded in this project. Email sending remains disabled.

Run `npm.cmd install` then `npm.cmd run dev` for local development. Run `npm.cmd run build` to validate. Deploy with `npx.cmd vercel --prod` after `npx.cmd vercel login`.

The backend currently rate-limits by its observed client IP, which is a Vercel server IP for proxied requests; multiple users can share that limit. For higher traffic, migrate the database to a Vercel-compatible database or add an authenticated proxy identity mechanism before scaling. This deployment does not migrate the database itself to Vercel.
