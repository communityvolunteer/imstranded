export default function handler(req, res) {
  res.setHeader('Content-Type', 'application/javascript');
  res.setHeader('Cache-Control', 'no-store');
  res.send(
    `window.__SB_URL__="${process.env.SUPABASE_URL}";` +
    `window.__SB_ANON__="${process.env.SUPABASE_ANON}";`
  );
}