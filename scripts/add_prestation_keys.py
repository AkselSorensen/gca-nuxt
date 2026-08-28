import io, re

p = "composables/useLang.ts"
s = io.open(p, encoding="utf-8", newline="").read()

fr = """    'prestation.subtitle': 'Game Design & Modélisation 3D',
    'prestation.gd_title': 'Game Design',
    'prestation.gd_desc': "Nous concevons des mécaniques de jeu pensées pour votre projet, quelle que soit sa plateforme. De l'idée initiale à l'équilibrage final, nous transformons vos concepts en expériences cohérentes, engageantes et adaptées à vos joueurs.",
    'prestation.gd_l1': 'Conception de mécaniques sur mesure',
    'prestation.gd_l2': 'Équilibrage et progression',
    'prestation.gd_l3': 'Game Design Document (GDD)',
    'prestation.m3d_title': 'Modélisation 3D architecturale & props',
    'prestation.m3d_desc': "Création de bâtiments, environnements et props sur mesure pour vos projets sous Unreal Engine. Des modèles pensés pour s'intégrer efficacement à votre projet, avec une attention particulière portée aux détails, aux textures et à l'optimisation.",
    'prestation.m3d_l1': 'Bâtiments et structures architecturales',
    'prestation.m3d_l2': 'Environnements et éléments de décor',
    'prestation.m3d_l3': 'Props et objets sur mesure',
    'prestation.discord_cta': 'Pour toute commande ou question, rendez-vous sur le discord',
"""
en = """    'prestation.subtitle': 'Game Design & 3D Modeling',
    'prestation.gd_title': 'Game Design',
    'prestation.gd_desc': "We design game mechanics tailored to your project, whatever its platform. From the initial idea to the final balancing, we turn your concepts into coherent, engaging experiences adapted to your players.",
    'prestation.gd_l1': 'Custom mechanic design',
    'prestation.gd_l2': 'Balancing and progression',
    'prestation.gd_l3': 'Game Design Document (GDD)',
    'prestation.m3d_title': 'Architectural 3D modeling & props',
    'prestation.m3d_desc': "Creation of custom buildings, environments and props for your Unreal Engine projects. Models designed to integrate efficiently into your project, with particular attention to details, textures and optimization.",
    'prestation.m3d_l1': 'Buildings and architectural structures',
    'prestation.m3d_l2': 'Environments and scenery elements',
    'prestation.m3d_l3': 'Custom props and objects',
    'prestation.discord_cta': 'For any order or question, join the Discord',
"""

def insert_after_last(s, anchor_start, block):
    idx = s.find(anchor_start)
    end = s.find("\n  },", idx)
    return s[:end] + "\n" + block + s[end:]

s = insert_after_last(s, "  fr: {", fr.rstrip())
s = insert_after_last(s, "  en: {", en.rstrip())
io.open(p, "w", encoding="utf-8", newline="").write(s)
print("cles prestation ajoutees")

# ---- Patch template ----
p2 = "pages/prestation.vue"
t = io.open(p2, encoding="utf-8", newline="").read()
repl = [
  ("<p>Game Design & Modélisation 3D</p>", "<p>{{ t('prestation.subtitle') }}</p>"),
  ("<h2>Game Design</h2>", "<h2>{{ t('prestation.gd_title') }}</h2>"),
  (t.split("Nous concevons des mécaniques")[1].split("</p>")[0], ""),
]
# description 1
old1 = "Nous concevons des mécaniques de jeu pensées pour votre projet, quelle que soit sa plateforme. De l'idée initiale à l'équilibrage final, nous transformons vos concepts en expériences cohérentes, engageantes et adaptées à vos joueurs."
t = t.replace(old1, "{{ t('prestation.gd_desc') }}", 1)
t = t.replace("Conception de mécaniques sur mesure", "{{ t('prestation.gd_l1') }}", 1)
t = t.replace("Équilibrage et progression", "{{ t('prestation.gd_l2') }}", 1)
t = t.replace("Game Design Document (GDD)", "{{ t('prestation.gd_l3') }}", 1)
t = t.replace("<h2>Modélisation 3D architecturale &amp; props</h2>", "<h2>{{ t('prestation.m3d_title') }}</h2>", 1)
old2 = "Création de bâtiments, environnements et props sur mesure pour vos projets sous Unreal Engine. Des modèles pensés pour s'intégrer efficacement à votre projet, avec une attention particulière portée aux détails, aux textures et à l'optimisation."
t = t.replace(old2, "{{ t('prestation.m3d_desc') }}", 1)
t = t.replace("Bâtiments et structures architecturales", "{{ t('prestation.m3d_l1') }}", 1)
t = t.replace("Environnements et éléments de décor", "{{ t('prestation.m3d_l2') }}", 1)
t = t.replace("Props et objets sur mesure", "{{ t('prestation.m3d_l3') }}", 1)
t = t.replace("Pour toute commande ou question, rendez-vous sur le discord", "{{ t('prestation.discord_cta') }}", 1)
io.open(p2, "w", encoding="utf-8", newline="").write(t)
print("prestation.vue patche")
