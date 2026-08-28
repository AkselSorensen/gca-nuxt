import io

p = "pages/catalogue.vue"
s = io.open(p, encoding="utf-8", newline="").read()

repl = [
  # Pills Tout
  (">Tout <span class=\"pill-count\">", ">{{ t('catalogue.all') }} <span class=\"pill-count\">"),
  # Titres filtres (desktop + mobile)
  ("</svg> Trier par</h4>", "</svg> {{ t('catalogue.sort_by') }}</h4>"),
  ("</svg> Plateforme</h4>", "</svg> {{ t('catalogue.platform') }}</h4>"),
  ("</svg> Prix max.</h4>", "</svg> {{ t('catalogue.max_price') }}</h4>"),
  ("</svg> Options</h4>", "</svg> {{ t('catalogue.options') }}</h4>"),
  ("</svg> Note minimale</h4>", "</svg> {{ t('catalogue.min_rating') }}</h4>"),
  (">Réinitialiser</button>", ">{{ t('catalogue.reset') }}</button>"),
  # Options de tri : labels statiques -> t()
  ("label: 'Les plus populaires'", "label: t('catalogue.sort_popular')"),
  ("label: 'Plus récents'", "label: t('catalogue.sort_newest')"),
  ("label: 'Prix croissant'", "label: t('catalogue.sort_price_asc')"),
  ("label: 'Prix décroissant'", "label: t('catalogue.sort_price_desc')"),
  ("label: 'Mieux notés'", "label: t('catalogue.sort_rating')"),
  ("label: 'Promotions'", "label: t('catalogue.sort_discount')"),
  ("label: 'Tendances'", "label: t('catalogue.sort_trending')"),
  # Plateformes
  ('const platformOptions = ["Garry\'s Mod", \'Unreal Engine\']',
   'const platformOptions = [t(\'catalogue.platform_gmod\'), t(\'catalogue.platform_ue\')]'),
]

count = 0
for old, new in repl:
    if old in s:
        s = s.replace(old, new, 1)
        count += 1
    else:
        print("ABSENT:", old[:60])

# sortOptions doit etre reactive -> computed + besoin de t
# on remplace 'const sortOptions = [' par 'const sortOptions = computed(() => [' et ferme la parenthèse
old_open = "const sortOptions = ["
if old_open in s:
    s = s.replace(old_open, "const sortOptions = computed(() => [", 1)
    # fermer le computed apres le ']' de fin de tableau : trouver 'const ratingOptions'
    idx = s.find("const ratingOptions")
    if idx != -1:
        # le ']' du tableau sortOptions est juste avant 'const ratingOptions' ; inserer '))'
        s = s[:idx] + "]))\n" + s[idx:]
    count += 1

io.open(p, "w", encoding="utf-8", newline="").write(s)
print("replacements:", count)

# verifier useLang dispo dans le script
if "useLang()" not in s:
    print("ATTENTION: useLang() pas declare dans catalogue.vue")
