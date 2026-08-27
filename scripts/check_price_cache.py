# Vérif : un changement de prix côté admin est-il visible IMMÉDIATEMENT sur la marketplace ?
# (purge du cache SWR). Change le prix, lit /catalogue, puis REMET le prix d'origine.
import http.cookiejar, json, os, re, sys, urllib.request

BASE = "https://gsa-store.fr"

env = {}
with open(os.path.join(os.path.dirname(__file__), "..", ".env"), encoding="utf-8") as f:
    for line in f:
        if "=" in line and not line.strip().startswith("#"):
            k, v = line.split("=", 1)
            env[k.strip()] = v.strip().strip('"').strip("'")

cj = http.cookiejar.CookieJar()
op = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(cj))


def call(path, data=None, method="GET", raw=False):
    body = json.dumps(data).encode() if data is not None else None
    req = urllib.request.Request(BASE + path, data=body, method=method,
                                 headers={"Content-Type": "application/json"} if body else {})
    try:
        with op.open(req, timeout=60) as r:
            txt = r.read().decode("utf-8", "replace")
            return r.status, (txt if raw else json.loads(txt or "{}"))
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode("utf-8", "replace")[:300]


print("login:", call("/api/auth/login", {"email": env["ADMIN_EMAIL"], "password": env["ADMIN_PASSWORD"]}, "POST")[0])

st, prods = call("/api/admin/products")
items = prods.get("items", prods) if isinstance(prods, dict) else prods
p = [x for x in items if not x.get("is_hidden")][0]
base_price = float(p.get("old_price") or p.get("price"))
print(f"produit test: {p['slug']} (id {p['id']}) — prix base {base_price}")


def payload(price):
    return {
        "title": p.get("title"), "shortDescription": p.get("short_description") or "",
        "description": p.get("description") or "", "installation": p.get("installation") or "",
        "categorySlug": p.get("category_slug"), "categories": [],
        "sellerSlug": p.get("seller_slug"), "price": price,
        "discountPercent": p.get("discount_percent") or 0,
        "platform": p.get("platform") or "Garry's Mod", "videoUrl": p.get("video_url") or "",
        "tags": p.get("tags") or [], "thumbnail": "", "isHidden": bool(p.get("is_hidden")),
    }


new_price = round(base_price + 7.77, 2)
st, res = call(f"/api/admin/products/{p['id']}", payload(new_price), "PATCH")
print("PATCH nouveau prix", new_price, "->", st, (res if st != 200 else "ok"))

st, html = call("/catalogue", raw=True)
found_new = f"{new_price:.2f}".replace(".", ",") in html or str(new_price) in html
print("marketplace (immédiat) contient le nouveau prix :", "OUI ✓" if found_new else "NON ✗")

st, api = call(f"/api/products/{p['slug']}")
print("API detail price:", api.get("price") if isinstance(api, dict) else api)

st, res = call(f"/api/admin/products/{p['id']}", payload(base_price), "PATCH")
print("PATCH restauration", base_price, "->", st)
st, api = call(f"/api/products/{p['slug']}")
print("API detail price apres restauration:", api.get("price") if isinstance(api, dict) else api)
