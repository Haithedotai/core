import subprocess
import os

exe_path = os.path.join('target', 'release', 'main')

try:
    subprocess.run([exe_path], check=True)
except Exception as e:
    print(f"Failed to run {exe_path}: {e}")