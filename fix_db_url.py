import subprocess, os, sys

# Change to project dir
os.chdir(r'C:\Users\danie\hermes-workspace\inventaris-greentek-next')

# Remove old DATABASE_URL first
proc = subprocess.run(['vercel', 'env', 'rm', 'DATABASE_URL', 'production', '--scope', 'greentek-s-projects'], 
    input='y\n', capture_output=True, text=True, timeout=15)
print('rm:', proc.stdout, proc.stderr)

# Set new DATABASE_URL with real password
url = 'postgresql://neondb_owner:npg_zcnO28lJLjVX@ep-damp-cell-ato5lvtb.c-9.us-east-1.aws.neon.tech/neondb?sslmode=require'
proc = subprocess.run(['vercel', 'env', 'add', 'DATABASE_URL', 'production', '--scope', 'greentek-s-projects'],
    input=url, capture_output=True, text=True, timeout=15)
print('add:', proc.stdout, proc.stderr)
