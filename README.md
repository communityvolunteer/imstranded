# ImStranded.org

> **"I'm Stranded. You're not."**

Peer-to-peer mutual aid + real-time crisis resource hub for people stranded by the Gulf conflict. Built to be deployed in under 30 minutes by one person with no backend experience.

Powered by $ALONE.

---

## What this does

- **Live sitrep bar** — estimated stranded, flights cancelled, airports closed, land routes open. Updates every 30 min automatically via GitHub Actions
- **Crisis map** — all affected countries, color-coded risk, airspace status, clickable popups
- **Country cards** — embassy contacts (US, UK, AU), exit routes, active NGOs, per country
- **Give / Get Help board** — real-time, persistent. Locals offer spare rooms, rides, supplies. Stranded people post requests. Contact info public by design — self-policing
- **Resources** — curated NGOs, hotlines, community Telegram groups
- **Auto-updater** — GitHub Actions cron pulls US State Dept, UK FCDO, ReliefWeb, AviationStack every 30 min. Zero cost.

---

## Stack

| Layer | Tool | Cost |
|---|---|---|
| Hosting | GitHub Pages | Free |
| Database + Realtime | Supabase | Free |
| Auto-updater | GitHub Actions | Free |
| Map | Leaflet.js | Free |
| Domain | imstranded.org | ~$10/yr |
| Airspace data | AviationStack | Free (100 req/mo) |

Total running cost: **~$10/year** (just the domain).

---

## Setup — 30 minutes start to finish

### Step 1 — Get the code on GitHub (5 min)

1. Go to [github.com](https://github.com) and create a free account if you don't have one
2. Click **+** → **New repository**
3. Name it `imstranded` (or anything you want)
4. Set to **Public**
5. Click **Create repository**
6. Open the repo, click **Add file** → **Upload files**
7. Upload everything from this zip — maintain the folder structure:
   ```
   index.html
   data.json
   supabase-setup.sql
   scraper/
     update.js
   .github/
     workflows/
       update-data.yml
   README.md
   ```
8. Commit directly to main

---

### Step 2 — Enable GitHub Pages (2 min)

1. In your repo, go to **Settings** → **Pages** (left sidebar)
2. Under **Source**, select **Deploy from a branch**
3. Branch: **main** / Folder: **/ (root)**
4. Click **Save**
5. Wait ~60 seconds — your site is live at `https://YOUR-USERNAME.github.io/imstranded`

> **Custom domain:** In Pages settings, add `imstranded.org` under Custom Domain. Then in your domain registrar (Cloudflare recommended), add a CNAME record pointing `www` to `YOUR-USERNAME.github.io` and four A records pointing to GitHub's IPs: `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`

---

### Step 3 — Set up Supabase (10 min)

This powers the live Give/Get Help board — posts persist, stream in real time to all visitors.

1. Go to [supabase.com](https://supabase.com) → **Start your project** (free, no credit card)
2. Create a new project — pick any name, any region (choose closest to Gulf for speed)
3. Wait ~2 min for it to provision
4. Go to **SQL Editor** (left sidebar) → **New query**
5. Open `supabase-setup.sql` from this zip, copy the entire contents, paste into the editor
6. Click **Run** — you should see "Success. No rows returned"
7. Go to **Project Settings** → **API**
8. Copy two values:
   - **Project URL** — looks like `https://abcdefghijkl.supabase.co`
   - **anon public** key — long string starting with `eyJ...`
9. Open `index.html` in VS Code
10. Find these two lines near the top of the `<script>` section:
    ```javascript
    const SUPABASE_URL  = 'https://YOUR_PROJECT_ID.supabase.co';
    const SUPABASE_ANON = 'YOUR_ANON_PUBLIC_KEY';
    ```
11. Replace with your actual values
12. Save the file
13. Upload the updated `index.html` to your GitHub repo (drag and drop onto the repo page, commit)

The help board is now live and persistent. Posts appear in real time for everyone.

---

### Step 4 — Enable the auto-updater (5 min)

This runs the scraper every 30 minutes and keeps `data.json` fresh automatically.

**Get a free AviationStack key (optional but recommended):**
1. Go to [aviationstack.com](https://aviationstack.com) → Get Free API Key
2. Sign up — free tier gives 100 requests/month (the scraper uses ~1,440/month at 30 min intervals, so upgrade to their $9.99/mo Starter plan if the site gets traffic, or just run it hourly to stay in free tier — change `*/30` to `0 * * * *` in the workflow file)

**Add the key to GitHub:**
1. In your GitHub repo → **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. Name: `AVIATIONSTACK_KEY`
4. Value: your AviationStack key
5. Click **Add secret**

**Enable Actions:**
1. Go to the **Actions** tab in your repo
2. If prompted, click **I understand my workflows, go ahead and enable them**
3. Click on **Auto-update crisis data** in the left sidebar
4. Click **Run workflow** → **Run workflow** to test it manually first
5. Check that it ran green — then it'll run automatically every 30 min forever

> **Without AviationStack key:** Everything still works. The sitrep bar shows baseline hardcoded figures. Only airport status won't auto-update.

---

### Step 5 — Update content (ongoing)

**To update country advisories, airspace status, or exit routes manually:**
1. Open `index.html` in VS Code
2. Find the `COUNTRIES` array near the top of the `<script>` section
3. Edit any country's `advisory`, `airspace`, `borders`, or `status` fields
4. Save and push to GitHub — Pages deploys in ~30 seconds

**To update the sitrep baseline manually:**
1. Open `data.json`
2. Edit the values under `"sitrep":`
3. Push to GitHub

**To update the news ticker:**
1. Open `data.json`
2. Edit the `"news_ticker"` array
3. Push to GitHub

---

## Moderation

The help board is self-moderating by design — contact info is public on every post, so bad actors expose themselves. Anyone can flag a post as suspicious with one click — it's immediately hidden from all viewers.

To review flagged posts:
1. Go to your Supabase dashboard → **Table Editor** → `help_posts`
2. Filter by `flagged = true`
3. Delete rows that are genuinely bad, or set `flagged = false` to restore legitimate ones

---

## Adding more countries / embassies

The site currently covers: UAE, Bahrain, Kuwait, Qatar, Oman, Saudi Arabia, Iran, Iraq, Jordan.

To add India, Philippines, Pakistan embassies (huge expat populations in Gulf — PRs welcome):

In `index.html`, find a country in the `COUNTRIES` array and add to its `embassy` object:
```javascript
embassy: {
  usa: { phone: "...", email: "...", step: "https://step.state.gov" },
  uk:  { phone: "...", web: "..." },
  ind: { phone: "...", web: "https://www.cgidubai.gov.in" },   // add this
  phl: { phone: "...", web: "https://dubaipcg.dfa.gov.ph" },   // and this
}
```

---

## Contributing

This is open source. PRs welcome at `github.com/YOUR-USERNAME/imstranded`.

Priority needs:
- [ ] More embassy contacts — India, Philippines, Pakistan, Bangladesh, Nepal
- [ ] Verified Telegram/WhatsApp group links per country
- [ ] Arabic, Hindi, Tagalog, Urdu translations
- [ ] Persistent backend for land route status (currently manual)
- [ ] SMS alert integration (Twilio free tier)

---

## The coin

$ALONE is the community token that funds server scaling and development as ImStranded grows. Launched via Bankrbot.

*"$ALONE exists so nobody stays that way."*

---

## License

CC0 — public domain. No attribution required. Copy it, fork it, translate it, deploy it anywhere. People's lives may depend on it.
