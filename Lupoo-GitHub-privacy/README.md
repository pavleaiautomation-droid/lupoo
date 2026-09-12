# Lupoo on Vercel

This Next.js project hosts the Lupoo website on Vercel. Signup, unsubscribe, and password-protected subscriber viewing use the existing Lupoo Sites backend and D1 database. Keep that backend running and publicly reachable. Existing email records and the admin password are retained there; no secrets are embedded in this project. Email sending remains disabled.

Run `npm.cmd install` then `npm.cmd run dev` for local development. Run `npm.cmd run build` to validate. Deploy with `npx.cmd vercel --prod` after `npx.cmd vercel login`.

The backend currently rate-limits by its observed client IP, which is a Vercel server IP for proxied requests; multiple users can share that limit. For higher traffic, migrate the database to a Vercel-compatible database or add an authenticated proxy identity mechanism before scaling. This deployment does not migrate the database itself to Vercel.

## Upload to GitHub

1. Extract the source ZIP into an empty folder.
2. Create a GitHub repository and upload the extracted files, with package.json at the repository root. Do not upload the ZIP as the only file.
3. Import the repository into Vercel and use its Next.js defaults. Build: npm run build. Install: npm ci. Output directory: leave the default.
4. Subsequent pushes to the connected production branch can deploy through Vercel's Git integration.

## Stack and hosting

This project uses Next.js 16, React 19, TypeScript, Tailwind CSS 4, and CSS animations. It does not use Django or Python. The API proxy requires a Node.js-capable host; this is not a GitHub Pages/static-only application.

Vercel is the existing deployment target. The email database and subscriber password remain in the separate Sites/Cloudflare service, not inside GitHub or this ZIP. Keep that service available. A fully independent move requires migrating the backend and database too; copying this frontend does not migrate subscriber records.

Never upload .env files, the admin password file, node_modules, .next, or .vercel. The included .gitignore excludes common local secrets and generated files.
