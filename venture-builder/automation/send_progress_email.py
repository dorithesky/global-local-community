#!/usr/bin/env python3
import os
import subprocess
from pathlib import Path
from datetime import datetime

workspace = Path('/Users/scottmoon/.openclaw/workspace')
status_path = workspace / 'venture-builder/docs/status-2026-04-08.md'
body = status_path.read_text() if status_path.exists() else 'No status file found.'
now = datetime.now().strftime('%Y-%m-%d %H:%M KST')
subject = f'Venture builder progress update - {now}'
cmd = [
    'python3',
    str(workspace / 'skills/agentmail/scripts/send_email.py'),
    '--inbox', 'dori@agentmail.to',
    '--to', 'scottchmoon@gmail.com',
    '--subject', subject,
    '--text', body,
]
env = os.environ.copy()
api_key = env.get('AGENTMAIL_API_KEY')
if not api_key:
    raise SystemExit('AGENTMAIL_API_KEY missing')
subprocess.run(cmd, check=True, env=env)
