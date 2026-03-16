#!/bin/bash
# ─────────────────────────────────────────────────────────────────
# Vercel build script — injects environment variables into app.js
# Run automatically by Vercel before serving (see vercel.json)
# ─────────────────────────────────────────────────────────────────

set -e

if [ -z "$SUPABASE_URL" ]; then
  echo "ERROR: SUPABASE_URL env var is not set" >&2
  exit 1
fi

if [ -z "$SUPABASE_ANON" ]; then
  echo "ERROR: SUPABASE_ANON env var is not set" >&2
  exit 1
fi

echo "Injecting Supabase config into app.js..."
# Path is relative to Vercel's working directory (Stranded/) not the script location
sed -i "s|%%SUPABASE_URL%%|${SUPABASE_URL}|g" imstranded/app.js
sed -i "s|%%SUPABASE_ANON_KEY%%|${SUPABASE_ANON}|g" imstranded/app.js
echo "Done."