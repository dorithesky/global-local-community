#!/usr/bin/env python3
import os
import subprocess
from pathlib import Path
from datetime import datetime

workspace = Path('/Users/scottmoon/.openclaw/workspace')
status_path = workspace / 'venture-builder/docs/status-2026-04-08.md'
log_path = workspace / 'venture-builder/docs/progress-log.md'
body_core = status_path.read_text() if status_path.exists() else 'No status file found.'
progress_log = log_path.read_text() if log_path.exists() else 'No logged improvements for this window.'
now = datetime.now().strftime('%Y-%m-%d %H:%M KST')
subject = f'Venture builder progress update - {now}'
body = f"""Hi Scott,

Two-hour window update ending {now}.

What improved in this window:
{progress_log}

Current project status:
{body_core}

If no improvements are listed above, then no meaningful product or GTM improvement was made in this window.

-Dori
"""
cmd = [
    'python3',
    str(workspace / 'skills/agentmail/scripts/send_email.py'),
    '--inbox', 'dori@agentmail.to',
    '--to', 'scottchmoon@gmail.com',
    '--subject', subject,
    '--text', body,
]
env = os.environ.copy()
if not env.get('AGENTMAIL_API_KEY'):
    raise SystemExit('AGENTMAIL_API_KEY missing')
subprocess.run(cmd, check=True, env=env)
