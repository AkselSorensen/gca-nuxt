import io, re

p = "composables/useLang.ts"
s = io.open(p, encoding="utf-8", newline="").read()

fr = """    'catalogue.all': 'Tout',
    'catalogue.sort_by': 'Trier par',
    'catalogue.platform': 'Plateforme',
    'catalogue.max_price': 'Prix max.',
    'catalogue.options': 'Options',
    'catalogue.min_rating': 'Note minimale',
    'catalogue.reset': 'Réinitialiser',
    'catalogue.sort_popular': 'Les plus populaires',
    'catalogue.sort_newest': 'Plus récents',
    'catalogue.sort_price_asc': 'Prix croissant',
    'catalogue.sort_price_desc': 'Prix décroissant',
    'catalogue.sort_rating': 'Mieux notés',
    'catalogue.sort_discount': 'Promotions',
    'catalogue.sort_trending': 'Tendances',
    'catalogue.platform_gmod': "Garry's Mod",
    'catalogue.platform_ue': 'Unreal Engine',
    'catalogue.no_results': 'Aucun produit ne correspond à vos filtres.',
    'catalogue.results': '{n} produit(s)',
"""

en = """    'catalogue.all': 'All',
    'catalogue.sort_by': 'Sort by',
    'catalogue.platform': 'Platform',
    'catalogue.max_price': 'Max price',
    'catalogue.options': 'Options',
    'catalogue.min_rating': 'Min rating',
    'catalogue.reset': 'Reset',
    'catalogue.sort_popular': 'Most popular',
    'catalogue.sort_newest': 'Newest',
    'catalogue.sort_price_asc': 'Price: low to high',
    'catalogue.sort_price_desc': 'Price: high to low',
    'catalogue.sort_rating': 'Top rated',
    'catalogue.sort_discount': 'Deals',
    'catalogue.sort_trending': 'Trending',
    'catalogue.platform_gmod': "Garry's Mod",
    'catalogue.platform_ue': 'Unreal Engine',
    'catalogue.no_results': 'No products match your filters.',
    'catalogue.results': '{n} product(s)',
"""

# Insere apres la derniere cle du bloc fr (avant la fermeture du bloc)
def insert_after_last(s, anchor_start, block):
    # anchor: la derniere ligne '  },' qui ferme le bloc fr = premiere occurrence apres 'fr: {'
    idx = s.find(anchor_start)
    end = s.find("\n  },", idx)
    return s[:end] + "\n" + block + s[end:]

# Bloc fr : apres '  fr: {' jusqu'au premier '  },'
s = insert_after_last(s, "  fr: {", fr.rstrip())
s = insert_after_last(s, "  en: {", en.rstrip())
io.open(p, "w", encoding="utf-8", newline="").write(s)
print("cles catalogue ajoutees")

# verif alignement
keys = re.findall(r"'([\w.]+)':", s)
from collections import Counter
c = Counter(keys)
dups = [k for k, v in c.items() if v > 2]
print("cles x3+:", dups if dups else "aucune")
