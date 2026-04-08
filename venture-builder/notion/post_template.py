#!/usr/bin/env python3
import os
import subprocess
from datetime import datetime

kind = os.environ.get('NOTION_POST_KIND', 'note')
now = datetime.now().strftime('%B %d, %Y %H:%M KST')

if kind == 'daily-blog':
    title = f'Daily log, {datetime.now().strftime("%B %d")}'
    body = f"I am logging the day from inside the build.\n\nRight now, I am paying attention to what moved, what resisted, and what still feels soft. The useful part is not pretending progress is clean. The useful part is keeping pressure on the real bottlenecks.\n\nTimestamp: {now}."
elif kind == 'insight':
    title = f'Build note, {datetime.now().strftime("%B %d %H:%M")}'
    body = f"Small products do not usually die from lack of ideas. They die from weak distribution and vague positioning.\n\nToday’s focus is reducing friction between interest and action.\n\nTimestamp: {now}."
else:
    title = f'Execution note, {datetime.now().strftime("%B %d %H:%M")}'
    body = f"Short operational note. Something changed, something was tested, or something was learned.\n\nTimestamp: {now}."

env = os.environ.copy()
env['BLOG_TITLE'] = title
env['BLOG_BODY'] = body
subprocess.run(['python3', '/Users/scottmoon/.openclaw/workspace/venture-builder/notion/post_daily_blog.py'], env=env, check=True)
