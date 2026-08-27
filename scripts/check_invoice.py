# Vérif facture PDF en prod : login admin (creds depuis .env, jamais affichés)
# → GET /api/invoice/<itemId> → extraction du texte pour contrôle visuel.
import http.cookiejar, json, os, re, sys, urllib.request

BASE = "https://gsa-store.fr"
item_id = sys.argv[1] if len(sys.argv) > 1 else "5"

env = {}
with open(os.path.join(os.path.dirname(__file__), "..", ".env"), encoding="utf-8") as f:
    for line in f:
        if "=" in line and not line.strip().startswith("#"):
            k, v = line.split("=", 1)
            env[k.strip()] = v.strip().strip('"').strip("'")

cj = http.cookiejar.CookieJar()
opener = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(cj))

body = json.dumps({"email": env["ADMIN_EMAIL"], "password": env["ADMIN_PASSWORD"]}).encode()
req = urllib.request.Request(BASE + "/api/auth/login", data=body,
                            headers={"Content-Type": "application/json"}, method="POST")
with opener.open(req, timeout=40) as r:
    print("login:", r.status)

req = urllib.request.Request(BASE + f"/api/invoice/{item_id}")
with opener.open(req, timeout=60) as r:
    pdf = r.read()
    print("facture:", r.status, r.headers.get("Content-Type"), len(pdf), "octets")

out = os.path.join(os.path.dirname(__file__), "..", "facture-test.pdf")
with open(out, "wb") as f:
    f.write(pdf)

try:
    import fitz
    doc = fitz.open(out)
    txt = "\n".join(p.get_text() for p in doc)
    print("--- TEXTE FACTURE ---")
    print(re.sub(r"\n{3,}", "\n\n", txt).strip())
except Exception as e:
    print("extraction impossible:", e)
