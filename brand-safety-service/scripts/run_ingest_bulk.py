import os
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
env = os.environ.copy()
env['PYTHONPATH'] = str(ROOT)

args = ['python3', str(ROOT / 'scripts' / 'ingest_uspto_bulk.py')]
args.extend(os.sys.argv[1:])
subprocess.run(args, check=True, env=env)
