import os
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
env = os.environ.copy()
env['PYTHONPATH'] = str(ROOT)

subprocess.run(['python3', str(ROOT / 'scripts' / 'build_trademark_db.py')], check=True, env=env)
subprocess.run(['python3', str(ROOT / 'benchmark_harness' / 'run_benchmark.py')], check=True, env=env)
