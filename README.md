# americandelegation.com

The site for The American Delegation.

- `site/` holds every page, image and file on the site.
- `schedule.json` lists pages that stay hidden until their release time.
- `build.py` builds the live site into `dist/`. Netlify runs it on every deploy.
- `.github/workflows/release.yml` checks at 45 past each hour and asks Netlify to rebuild when a release is coming up. Builds run 20 minutes ahead of the clock, so a 6 a.m. release goes up around 5:46.

Inside any page, content that changes at a release is wrapped like this:

    <!--live 2026-11-19T06:00-05:00-->new version<!--before-->old version<!--/live-->

Preview the site at another moment with `python3 build.py --at 2026-11-19T12:00Z`.
