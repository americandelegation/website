// Netlify runs this at 45 minutes past every hour. If a release in schedule.json
// or a <!--live--> block is due in the next 30 minutes (or passed in the last 15),
// it calls the build hook so the site rebuilds with the new pages.
import times from './release-times.mjs';

export default async () => {
  const now = Date.now();
  const due = times.filter(t => { const ms = Date.parse(t); return ms > now - 15 * 60e3 && ms <= now + 30 * 60e3; });
  if (!due.length) return new Response('Nothing due');
  const hook = process.env.NETLIFY_BUILD_HOOK;
  if (!hook) return new Response('NETLIFY_BUILD_HOOK is not set', { status: 500 });
  await fetch(hook, { method: 'POST', body: '{}' });
  return new Response('Rebuild requested for ' + due.join(', '));
};

export const config = { schedule: '45 * * * *' };
