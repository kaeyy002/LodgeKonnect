# LodgeKonnect v2 — Supabase + Vercel Edition

Lodge & Roommate Finder for FUTO Students.  
Backend: **Supabase (PostgreSQL)** · Frontend host: **GitHub Pages** · API: **Vercel Serverless Functions**

---

## Project structure

```
LodgeKonnect/
├── api/                   ← Vercel serverless functions (Node.js)
│   ├── login.js
│   ├── register.js
│   ├── verify.js
│   ├── logout.js
│   ├── lodges.js
│   ├── lodge_update.js
│   ├── lodge_delete.js
│   ├── profile.js
│   ├── notifications.js
│   └── roommates.js
├── lib/
│   └── supabase.js        ← shared Supabase client + helpers
├── supabase/
│   └── schema.sql         ← run this in Supabase SQL editor
├── assets/
│   ├── css/
│   │   ├── main.css
│   │   └── brand.css
│   └── js/
│       └── app.js         ← update API.base after Vercel deploy
├── index.html
├── login.html
├── signup.html
├── dashboard.html
├── dashboardcaretaker.html
├── package.json
├── vercel.json
└── .gitignore
```

---

## STEP 1 — Set up Supabase

1. Go to **https://supabase.com** → Sign up / Log in
2. Click **"New project"**
   - Name: `lodgekonnect`
   - Database password: choose a strong password (save it!)
   - Region: pick the closest to Nigeria (e.g. Europe West)
3. Wait ~2 minutes for the project to spin up
4. In the left sidebar → **SQL Editor** → click **"New query"**
5. Open the file `supabase/schema.sql` from this repo, copy all the text, paste it into the editor, and click **Run**
6. You should see "Success" — your tables are now created

### Get your Supabase keys

1. Left sidebar → **Project Settings** (gear icon) → **API**
2. Copy these two values (you'll need them for Vercel):
   - **Project URL** — looks like `https://abcxyz.supabase.co`
   - **service_role** key (under "Project API keys", click "Reveal") — starts with `eyJ...`

> ⚠️ Never share the service_role key. It's server-only (Vercel keeps it secret).

### Create a Storage bucket for photos

1. Left sidebar → **Storage** → **New bucket**
2. Name it: `lodge-photos`
3. Toggle **Public bucket** ON (so photos display without auth)
4. Click **Save**

---

## STEP 2 — Deploy to Vercel

1. Go to **https://vercel.com** → Sign up with GitHub
2. Click **"Add New Project"** → Import your `LodgeKonnect` GitHub repo
3. Vercel will detect it automatically. Click **Deploy** (leave all settings as default)
4. After deploy, go to your project → **Settings** → **Environment Variables**
5. Add these two variables:

| Name | Value |
|------|-------|
| `SUPABASE_URL` | your Project URL from Step 1 |
| `SUPABASE_SERVICE_ROLE_KEY` | your service_role key from Step 1 |

6. Go to **Deployments** → click the three dots on the latest deploy → **Redeploy** (so the env vars take effect)
7. Copy your Vercel URL — it looks like `https://lodgekonnect-abc123.vercel.app`

---

## STEP 3 — Update the frontend API URL

1. Open `assets/js/app.js` in vscode.dev
2. Find this line near the top:
   ```js
   base: 'https://lodgekonnect.vercel.app/api',
   ```
3. Replace `lodgekonnect.vercel.app` with your actual Vercel URL from Step 2
4. Save the file and commit it to GitHub

---

## STEP 4 — Fix CSS on GitHub Pages (the styling issue)

The CSS wasn't loading on the live site because the `assets/` folder was missing from the repo.  
All CSS and JS files are now included in this zip. Upload them all to GitHub:

1. Go to **https://vscode.dev/github/kaeyy002/LodgeKonnect**
2. Drag and drop these folders into the file tree:
   - `assets/` (the whole folder — contains css/ and js/)
3. Commit the changes with message: `fix: add assets folder with CSS and JS`
4. Wait ~30 seconds, then refresh `https://kaeyy002.github.io/LodgeKonnect/`
5. The site should now be fully styled ✅

---

## STEP 5 — Upload everything to GitHub via vscode.dev

1. Go to **https://vscode.dev/github/kaeyy002/LodgeKonnect**
2. Upload these folders/files (drag & drop into the sidebar):
   - `api/` folder
   - `lib/` folder
   - `supabase/` folder
   - `assets/` folder
   - `package.json`
   - `vercel.json`
   - `.gitignore`
   - All `.html` files
3. Commit with message: `feat: migrate to Supabase + Vercel`
4. Vercel will auto-redeploy within seconds

---

## API endpoints (after Vercel deploy)

| Method | Endpoint | Auth needed |
|--------|----------|-------------|
| POST | `/api/register` | No |
| POST | `/api/login` | No |
| POST | `/api/verify` | No |
| POST | `/api/logout` | No |
| GET | `/api/lodges` | No |
| POST | `/api/lodges` | Yes (caretaker) |
| POST | `/api/lodge_update` | Yes (caretaker) |
| POST | `/api/lodge_delete` | Yes (caretaker) |
| GET | `/api/profile` | Yes |
| POST | `/api/profile` | Yes |
| GET | `/api/notifications` | Yes |
| POST | `/api/notifications` | Yes |
| GET | `/api/roommates` | No |

---

## Photo uploads

Photos are no longer uploaded to the server. Instead:
1. The client uploads directly to **Supabase Storage** (bucket: `lodge-photos`)
2. The resulting public URL is sent to the API (in the `photos` array field)
3. The API saves the URL to the `lodge_photos` table

For the upload widget to work, add the Supabase JS client to your HTML pages:
```html
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js"></script>
```
Then use `supabase.storage.from('lodge-photos').upload(...)` in your frontend JS.
