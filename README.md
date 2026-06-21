# LodgeKonnect — Supabase + Vercel Deployment Guide

## Project structure

```
lodgekonnect-vercel/
├── api/
│   ├── login.js          # POST /api/login
│   ├── register.js       # POST /api/register
│   ├── logout.js         # POST /api/logout
│   ├── verify.js         # POST /api/verify
│   ├── lodges.js         # GET  /api/lodges   POST /api/lodges
│   ├── lodge_update.js   # POST /api/lodge_update
│   ├── lodge_delete.js   # POST /api/lodge_delete
│   ├── profile.js        # GET  /api/profile  POST /api/profile
│   ├── notifications.js  # GET  /api/notifications  POST /api/notifications
│   ├── roommates.js      # GET  /api/roommates
│   └── favorites.js      # GET  /api/favorites  POST /api/favorites
├── lib/
│   ├── supabase.js       # Supabase client (service role)
│   └── helpers.js        # CORS, auth middleware, token utils
├── supabase/
│   └── schema.sql        # Run this once in Supabase SQL Editor
├── vercel.json
├── package.json
├── .env.example
└── .gitignore
```

---

## Step 1 — Set up Supabase

1. Go to [supabase.com](https://supabase.com) → open your project (or create one).
2. **Run the schema**: Dashboard → **SQL Editor** → paste the contents of `supabase/schema.sql` → **Run**.
3. **Create Storage buckets**: Dashboard → **Storage** → **New bucket**:
   - `lodge-photos` — toggle **Public** ON
   - `profile-images` — toggle **Public** ON
4. Note your credentials: Dashboard → **Project Settings** → **API**:
   - `Project URL` → `SUPABASE_URL`
   - `service_role` key (secret!) → `SUPABASE_SERVICE_ROLE_KEY`

---

## Step 2 — Set up Vercel

### Option A — CLI (recommended)

```bash
npm install -g vercel
cd lodgekonnect-vercel
npm install
vercel login
vercel                     # first deploy (follow prompts)
```

### Option B — GitHub import
1. Push this folder to a GitHub repo.
2. Go to [vercel.com](https://vercel.com) → **Add New Project** → import the repo.
3. Framework preset: **Other**.
4. Root directory: leave as-is (or set to the folder you pushed).

---

## Step 3 — Add environment variables in Vercel

Dashboard → your project → **Settings** → **Environment Variables**.  
Add each variable from `.env.example`:

| Variable | Value |
|---|---|
| `SUPABASE_URL` | `https://xxxx.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | your service role key |
| `ALLOWED_ORIGINS` | `https://yourdomain.com` |
| `PRODUCTION_ORIGIN` | `https://yourdomain.com` |
| `NODE_ENV` | `production` |

Then **redeploy** for the variables to take effect.

---

## Step 4 — Update your frontend API calls

Replace all PHP paths in your HTML/JS files:

| Old (PHP) | New (Vercel) |
|---|---|
| `/api/login.php` | `/api/login` |
| `/api/register.php` | `/api/register` |
| `/api/logout.php` | `/api/logout` |
| `/api/verify.php` | `/api/verify` |
| `/api/lodges.php` | `/api/lodges` |
| `/api/lodge_update.php` | `/api/lodge_update` |
| `/api/lodge_delete.php` | `/api/lodge_delete` |
| `/api/profile.php` | `/api/profile` |
| `/api/notifications.php` | `/api/notifications` |
| `/api/roommates.php` | `/api/roommates` |
| `/api/favorites.php` | `/api/favorites` |

### Auth header pattern
All protected endpoints read a Bearer token from the `Authorization` header.  
Update your fetch calls like this:

```js
const token = localStorage.getItem('lk_token');

const res = await fetch('/api/profile', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  }
});
```

For `multipart/form-data` requests (lodge/profile image uploads), **omit** `Content-Type`
and append the token to the FormData instead:

```js
const form = new FormData();
form.append('token', localStorage.getItem('lk_token'));
form.append('lodge_name', 'Sunrise Hostel');
// ...
await fetch('/api/lodges', { method: 'POST', body: form });
```

---

## API reference

### POST `/api/login`
**Body (JSON):** `loginId`, `password`, `userType`  
**Returns:** `{ success, token, user_id, user_type, user_name, redirect, … }`

### POST `/api/register`
**Body (JSON):** `full_name`, `email`, `phone`, `password`, `confirm_password`,
`user_type`, `gender`, `department`\*, `level`\*, `lodge_name`†, `location`†, `lodge_description`†  
\*student only  †caretaker only

### POST `/api/logout`
**Body (JSON):** `token`

### POST `/api/verify`
**Body (JSON):** `token`

### GET `/api/lodges`
**Query params:** `location`, `gender`, `min_price`, `max_price`, `caretaker_id`, `q` (search)

### POST `/api/lodges`
**Auth required.** Multipart form: `lodge_name`, `location`, `price`, `description`,
`room_number`, `gender_preference`, `amenities`, `photos[]`, `token`

### POST `/api/lodge_update`
**Auth required.** Multipart form: `lodge_id` + same fields as POST lodges

### POST `/api/lodge_delete`
**Auth required.** JSON: `lodge_id`

### GET `/api/profile`
**Auth required.**

### POST `/api/profile`
**Auth required.** Multipart form: `department`, `level`, `bio`, `matching_bio`,
`available_for_matching`, `preferences` (JSON string), `profile_image`, `token`

### GET `/api/notifications`
**Auth required.**

### POST `/api/notifications`
**Auth required.** JSON: `action: "mark_read"`, `notification_id` (optional — omit to mark all)

### GET `/api/roommates`
**Query params:** `q`, `gender`, `level`, `department`, `max_budget`

### GET `/api/favorites`
**Auth required.**

### POST `/api/favorites`
**Auth required.** JSON: `lodge_id` (toggles add/remove)

---

## Local development

```bash
cp .env.example .env.local   # fill in your values
npm install
vercel dev                   # runs all /api/* functions locally on :3000
```
