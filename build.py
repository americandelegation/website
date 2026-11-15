"""Build the American Delegation site with timed releases.

Netlify runs this on every build. It copies site/ into dist/ and applies the
release schedule, so pages built ahead go live on their own.

Two ways to time a release:

1. schedule.json maps a path in site/ (a page folder or a file) to the moment
   it goes live. Until then it is left out of dist/ entirely.

2. Inside any .html, .xml or .txt file, wrap content that changes at a release:

       <!--live 2026-11-19T06:00-05:00-->shown from that moment<!--before-->shown until then<!--/live-->

   The <!--before--> part is optional. Blocks can nest: put the whole earlier
   block inside the <!--before--> part of the next one.

Builds run 20 minutes ahead of the clock (LEAD_MINUTES), so a release
goes up shortly before its time rather than after it.

Usage:
    python3 build.py                      build for right now, plus the lead
    python3 build.py --at 2026-11-19T12:00Z   preview the site at another moment
    python3 build.py --due 3600 --ahead 1800
                                          exit 0 if a release falls between an hour ago and 30 minutes from now
    python3 build.py --upcoming           list scheduled releases
"""
import json, os, re, shutil, sys
from datetime import datetime, timezone, timedelta

ROOT = os.path.dirname(os.path.abspath(__file__))
SRC, OUT = os.path.join(ROOT, 'site'), os.path.join(ROOT, 'dist')
TEXT = ('.html', '.xml', '.txt', '.webmanifest')
LEAD_MINUTES = 20
NOLIVE = r'(?:(?!<!--live ).)*?'
BLOCK = re.compile(r'<!--live ([0-9T:+\-Z]+)-->(' + NOLIVE + r')(?:<!--before-->(' + NOLIVE + r'))?<!--/live-->', re.S)
TIMES = re.compile(r'<!--live ([0-9T:+\-Z]+)-->')


def when(s):
    s = s.strip().replace('Z', '+00:00')
    if len(s) == 10:
        s += 'T00:00:00+00:00'
    t = datetime.fromisoformat(s)
    if t.tzinfo is None:
        raise SystemExit(f'Release time needs a time zone offset: {s}')
    return t


def schedule():
    p = os.path.join(ROOT, 'schedule.json')
    if not os.path.exists(p):
        return {}
    data = json.load(open(p, encoding='utf-8'))
    return {k.strip('/'): when(v) for k, v in data.items() if not k.startswith('_')}


def all_times():
    times = list(schedule().values())
    for dp, _, fs in os.walk(SRC):
        for f in fs:
            if f.endswith(TEXT):
                times += [when(m.group(1)) for m in TIMES.finditer(open(os.path.join(dp, f), encoding='utf-8').read())]
    return sorted(set(times))


def build(now):
    sched = schedule()
    hidden = {k for k, t in sched.items() if t > now}
    if os.path.exists(OUT):
        shutil.rmtree(OUT)
    n = 0
    for dp, ds, fs in os.walk(SRC):
        rel = os.path.relpath(dp, SRC).replace(os.sep, '/')
        rel = '' if rel == '.' else rel
        ds[:] = [d for d in ds if f'{rel}/{d}'.strip('/') not in hidden]
        os.makedirs(os.path.join(OUT, rel), exist_ok=True)
        for f in fs:
            r = f'{rel}/{f}'.strip('/')
            if r in hidden or f == '.DS_Store':
                continue
            src, dst = os.path.join(dp, f), os.path.join(OUT, rel, f)
            if f.endswith(TEXT):
                s = open(src, encoding='utf-8').read()
                while BLOCK.search(s):  # innermost blocks first, so blocks can nest
                    s = BLOCK.sub(lambda m: m.group(2) if when(m.group(1)) <= now else (m.group(3) or ''), s)
                open(dst, 'w', encoding='utf-8').write(s)
            else:
                shutil.copy2(src, dst)
            n += 1
    upcoming = [t for t in all_times() if t > now]
    print(f'Built {n} files for {now.isoformat(timespec="minutes")}. Held back: {", ".join(sorted(hidden)) or "nothing"}.')
    print(f'Next release: {upcoming[0].isoformat(timespec="minutes") if upcoming else "none scheduled"}')


if __name__ == '__main__':
    a = sys.argv[1:]
    now = datetime.now(timezone.utc)
    if '--at' in a:
        now = when(a[a.index('--at') + 1])
    elif '--due' not in a:
        now += timedelta(minutes=LEAD_MINUTES)
    if '--upcoming' in a:
        for t in all_times():
            print(t.isoformat(timespec='minutes'), '(live)' if t <= now else '')
    elif '--due' in a:
        back = timedelta(seconds=int(a[a.index('--due') + 1]))
        ahead = timedelta(seconds=int(a[a.index('--ahead') + 1])) if '--ahead' in a else timedelta(0)
        due = [t for t in all_times() if now - back < t <= now + ahead]
        print('Due:', ', '.join(t.isoformat(timespec='minutes') for t in due) or 'nothing')
        sys.exit(0 if due else 1)
    else:
        build(now)
