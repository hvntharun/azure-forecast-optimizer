import subprocess
import sys
import os

project_dir = os.path.dirname(os.path.abspath(__file__))
# Try to find npm.cmd automatically
npm_path = None
for candidate in [r"C:\Program Files\nodejs\npm.cmd", r"C:\Program Files\nodejs\npm", "npm"]:
    if os.path.isfile(candidate):
        npm_path = candidate
        break
if npm_path is None:
    # Fallback to just 'npm' if not found
    npm_path = "npm"

print(f"Using npm path: {npm_path}")
print("Running: npm run build")
subprocess.run([npm_path, "run", "build"], check=True, cwd=project_dir)

print("Running: npm run deploy:prod")
subprocess.run([npm_path, "run", "deploy:prod"], check=True, cwd=project_dir)

print("Running: python upload_to_databricks.py")
subprocess.run([sys.executable, "upload_to_databricks.py"], check=True, cwd=project_dir)

print("Deployment to Databricks completed successfully.")
