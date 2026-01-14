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

pnpm i## Environment Setup

Copy `.env.example` to `.env.local` and fill in the required values:

```bash
cp .env.example .env.local
```

### Required Environment Variables

- **WorkOS**: Authentication credentials
- **Database**: Connection string for your database
- **Cloudflare R2**: Image storage configuration (see below)

### Cloudflare R2 Setup

1. **Create R2 Bucket**:
   - Go to [Cloudflare Dashboard](https://dash.cloudflare.com) > R2
   - Click "Create bucket"
   - Enter a bucket name (e.g., `persona-images`)

2. **Create R2 API Token**:
   - Go to R2 > Manage R2 API Tokens
   - Click "Create API token"
   - Set permissions: Object Read & Write
   - Copy the Access Key ID and Secret Access Key

3. **Configure Public Access** (choose one):
   
   **Option A: Development (r2.dev subdomain)**:
   - Go to your bucket > Settings
   - Enable "Public Development URL"
   - Leave `R2_PUBLIC_URL` empty in `.env.local` (auto-generated)
   
   **Option B: Production (Custom Domain)**:
   - Go to your bucket > Settings > Custom Domains
   - Connect your domain (e.g., `images.yourdomain.com`)
   - Set `R2_PUBLIC_URL=https://images.yourdomain.com` in `.env.local`

4. **Add to `.env.local`**:
   ```env
   R2_ACCOUNT_ID=your_account_id
   R2_ACCESS_KEY_ID=your_access_key_id
   R2_SECRET_ACCESS_KEY=your_secret_access_key
   R2_BUCKET_NAME=your_bucket_name
   R2_PUBLIC_URL=  # Leave empty for r2.dev, or set custom domain
   ```

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
# persona
