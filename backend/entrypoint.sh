#!/bin/sh
set -e

echo "Waiting for database..."
python -c "
import time, os, psycopg
dsn = f\"host={os.environ.get('POSTGRES_HOST','localhost')} dbname={os.environ.get('POSTGRES_DB','sabthok')} user={os.environ.get('POSTGRES_USER','sabthok')} password={os.environ.get('POSTGRES_PASSWORD','sabthok')}\"
for i in range(30):
    try:
        conn = psycopg.connect(dsn)
        conn.close()
        break
    except Exception:
        time.sleep(1)
else:
    raise Exception('Database not ready after 30s')
"

echo "Creating migrations..."
python manage.py makemigrations --noinput

echo "Running migrations..."
python manage.py migrate --noinput

echo "Collecting static files..."
python manage.py collectstatic --noinput

# Seed sample data if SEED_DATA=true
if [ "$SEED_DATA" = "true" ]; then
    echo "Seeding sample data..."
    python manage.py seed_data
fi

exec "$@"
