#!/usr/bin/env python3
"""Recompresse les images base64 stockées en DB (PNG lourds → JPEG léger).
Usage: python scripts/recompress_media.py
- lit toutes les rows product_media avec url LIKE 'data:'
- redimensionne à max 1200px de large, JPEG qualité 0.82
- réécrit l'url (data:image/jpeg;base64,...)
"""
import base64
import io
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)) + '/..')

from PIL import Image  # noqa: E402
import dotenv  # noqa: E402
import psycopg2  # noqa: E402

dotenv.load_dotenv()

conn = psycopg2.connect(os.environ['DATABASE_URL'], sslmode='require')
cur = conn.cursor()

cur.execute("SELECT id, product_id, url, media_type FROM product_media WHERE url LIKE 'data:%'")
rows = cur.fetchall()
print(f'Images base64 trouvées : {len(rows)}')

for media_id, product_id, url, media_type in rows:
    m = re.match(r'data:([^;,]+);base64,(.*)$', url, re.S)
    if not m:
        print(f'  media {media_id}: URL non base64, skip')
        continue
    raw = base64.b64decode(m.group(2))
    before = len(raw)
    try:
        img = Image.open(io.BytesIO(raw))
        img = img.convert('RGB')
        # redimensionne si plus large que 1200px
        if img.width > 1200:
            ratio = 1200 / img.width
            img = img.resize((1200, int(img.height * ratio)), Image.LANCZOS)
        buf = io.BytesIO()
        img.save(buf, 'JPEG', quality=82, optimize=True, progressive=True)
        jpeg = buf.getvalue()
        after = len(jpeg)
        new_url = 'data:image/jpeg;base64,' + base64.b64encode(jpeg).decode()
        cur.execute(
            "UPDATE product_media SET url = %s, thumbnail_url = %s, media_type = 'image' WHERE id = %s",
            (new_url, new_url, media_id),
        )
        print(f'  media {media_id} (product {product_id}): {before//1024} Ko -> {after//1024} Ko ({media_type} -> image)')
    except Exception as e:
        print(f'  media {media_id}: ERREUR {e}')

conn.commit()
cur.close()
conn.close()
print('Terminé.')
