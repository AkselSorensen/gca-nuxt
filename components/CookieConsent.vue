<template>
  <Teleport to="body">
    <Transition name="drop">
      <div v-if="visible" class="cookie-overlay" @click.self="dismiss">
        <div class="cookie-card anim-scale">
          <!-- Vue principale -->
          <template v-if="!showDetails">
            <div class="cookie-icon">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2"><path d="M21 15.9v.1a3 3 0 0 1-3 3h-1a2 2 0 0 0-2 2 2 2 0 0 1-2 2H7a4 4 0 0 1-4-4V8a4 4 0 0 1 4-4h1a2 2 0 0 1 2 2v.1"/><circle cx="17" cy="8" r="1"/><circle cx="13" cy="7" r="1"/><circle cx="16" cy="12" r="1"/><circle cx="8" cy="12" r="1"/><circle cx="6" cy="7" r="1"/></svg>
            </div>
            <h3>{{ t('cookie.title') }}</h3>
            <p class="cookie-text">{{ t('cookie.text') }}</p>
            <div class="cookie-actions">
              <button class="btn-accept" @click="acceptAll">{{ t('cookie.accept') }}</button>
              <button class="btn-refuse" @click="refuseAll">{{ t('cookie.refuse') }}</button>
              <button class="btn-more" @click="showDetails = true">
                {{ t('cookie.more') }}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
              </button>
            </div>
          </template>

          <!-- Détails -->
          <template v-else>
            <div class="cookie-head">
              <div>
                <h3>{{ t('cookie.manage') }}</h3>
                <p class="cookie-sub">{{ t('cookie.manage_sub') }}</p>
              </div>
              <button class="cookie-back" @click="showDetails = false">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
                {{ t('cookie.back') }}
              </button>
            </div>

            <div class="cookie-groups">
              <!-- Essentiels -->
              <div class="cookie-group">
                <div class="cookie-group-head">
                  <div>
                    <strong>{{ t('cookie.essential') }}</strong>
                    <p>{{ t('cookie.essential_desc') }}</p>
                  </div>
                  <span class="badge-always">{{ t('cookie.always') }}</span>
                </div>
                <div class="cookie-list">
                  <div v-for="c in essentialCookies" :key="c.name" class="cookie-row">
                    <div class="cookie-info">
                      <code>{{ c.name }}</code>
                      <span>{{ c.desc }}</span>
                    </div>
                    <span class="switch on" :aria-label="t('cookie.active')"><span class="knob"></span></span>
                  </div>
                </div>
              </div>

              <!-- Fonctionnels -->
              <div class="cookie-group">
                <div class="cookie-group-head">
                  <div>
                    <strong>{{ t('cookie.prefs') }}</strong>
                    <p>{{ t('cookie.prefs_desc') }}</p>
                  </div>
                  <label class="switch" :class="{ on: prefsCookies }"><input type="checkbox" v-model="prefsCookies" /><span class="knob"></span></label>
                </div>
                <div class="cookie-list">
                  <div v-for="c in preferenceCookies" :key="c.name" class="cookie-row">
                    <div class="cookie-info">
                      <code>{{ c.name }}</code>
                      <span>{{ c.desc }}</span>
                    </div>
                    <span class="switch" :class="{ on: prefsCookies }"><span class="knob"></span></span>
                  </div>
                </div>
              </div>

              <!-- Analyse -->
              <div class="cookie-group">
                <div class="cookie-group-head">
                  <div>
                    <strong>{{ t('cookie.analytics') }}</strong>
                    <p>{{ t('cookie.analytics_desc') }}</p>
                  </div>
                  <span class="badge-none">{{ t('cookie.none') }}</span>
                </div>
              </div>
            </div>

            <div class="cookie-actions">
              <button class="btn-accept" @click="acceptAll">Tout accepter</button>
              <button class="btn-refuse" @click="refuseAll">Tout refuser</button>
              <button class="btn-save" @click="savePrefs">{{ t('cookie.save') }}</button>
            </div>
          </template>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
const visible = ref(false)
const showDetails = ref(false)
const prefsCookies = ref(true)
const { t } = useLang()

const essentialCookies = [
  { name: 'connect.sid', desc: t('cookie.desc_session') },
  { name: 'gsa-cart', desc: t('cookie.desc_cart') },
  { name: 'gsa-locale', desc: t('cookie.desc_locale') },
]
const preferenceCookies = [
  { name: 'gsa-cookie-consent', desc: t('cookie.desc_consent') },
  { name: 'gsa-return', desc: t('cookie.desc_return') },
]

function loadConsent() {
  try {
    const raw = localStorage.getItem('gsa-cookie-consent')
    if (raw) {
      const data = JSON.parse(raw)
      if (data.prefs !== undefined) prefsCookies.value = data.prefs
      return true
    }
  } catch { /* ignore */ }
  return false
}

function saveConsent(prefs: boolean) {
  try {
    localStorage.setItem('gsa-cookie-consent', JSON.stringify({ prefs, at: Date.now() }))
  } catch { /* ignore */ }
}

function acceptAll() { prefsCookies.value = true; saveConsent(true); dismiss() }
function refuseAll() { prefsCookies.value = false; saveConsent(false); dismiss() }
function savePrefs() { saveConsent(prefsCookies.value); dismiss() }
function dismiss() {
  visible.value = false
  setTimeout(() => { showDetails.value = false }, 300)
}

onMounted(() => {
  // Affiche le popup seulement si aucun choix n'a été enregistré
  setTimeout(() => {
    if (!loadConsent()) visible.value = true
  }, 1200)
})
</script>

<style scoped>
.cookie-overlay { position: fixed; inset: 0; z-index: 400; display: grid; place-items: center; background: rgba(10,14,20,0.6); backdrop-filter: blur(4px); }
.cookie-card { width: min(560px, 92vw); padding: 30px 28px; border-radius: 18px; border: 1px solid var(--border); background: var(--bg-card); box-shadow: 0 24px 64px rgba(0,0,0,0.4); display: grid; gap: 14px; }
.cookie-icon { width: 54px; height: 54px; border-radius: 14px; background: rgba(47,125,246,0.08); border: 1px solid rgba(47,125,246,0.15); display: grid; place-items: center; }
.cookie-card h3 { margin: 0; font-size: 1.15rem; font-weight: 800; }
.cookie-text { margin: 0; color: var(--text-secondary); font-size: .9rem; line-height: 1.7; }
.cookie-sub { margin: 4px 0 0; color: var(--text-muted); font-size: .8rem; }

.cookie-actions { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 4px; }
.btn-accept { flex: 1; min-width: 130px; padding: 12px 18px; border: none; border-radius: 10px; background: linear-gradient(135deg, var(--primary), var(--accent)); color: #fff; font-weight: 700; font-size: .88rem; cursor: pointer; transition: filter .2s; }
.btn-accept:hover { filter: brightness(1.1); }
.btn-refuse { padding: 12px 18px; border: 1px solid var(--border); border-radius: 10px; background: transparent; color: var(--text-secondary); font-weight: 600; font-size: .88rem; cursor: pointer; transition: all .2s; }
.btn-refuse:hover { background: rgba(255,255,255,0.04); }
.btn-more, .btn-save { display: inline-flex; align-items: center; gap: 6px; padding: 12px 16px; border: none; border-radius: 10px; background: rgba(47,125,246,0.1); color: var(--primary); font-weight: 600; font-size: .88rem; cursor: pointer; transition: background .2s; }
.btn-more:hover, .btn-save:hover { background: rgba(47,125,246,0.18); }

.cookie-head { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
.cookie-back { display: inline-flex; align-items: center; gap: 6px; background: transparent; border: none; color: var(--text-muted); font-size: .8rem; cursor: pointer; font-weight: 600; }
.cookie-back:hover { color: var(--text); }

.cookie-groups { display: grid; gap: 12px; max-height: 46vh; overflow-y: auto; padding-right: 4px; }
.cookie-group { padding: 14px 16px; border: 1px solid var(--border); border-radius: 12px; background: var(--bg-surface); display: grid; gap: 10px; }
.cookie-group-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; }
.cookie-group-head strong { font-size: .9rem; }
.cookie-group-head p { margin: 4px 0 0; color: var(--text-muted); font-size: .78rem; line-height: 1.5; }
.badge-always { font-size: .68rem; font-weight: 700; color: var(--green); background: rgba(110,231,183,0.08); border: 1px solid rgba(110,231,183,0.2); padding: 4px 10px; border-radius: 999px; white-space: nowrap; }
.badge-none { font-size: .68rem; font-weight: 700; color: var(--text-muted); background: rgba(255,255,255,0.03); border: 1px solid var(--border); padding: 4px 10px; border-radius: 999px; white-space: nowrap; }
.cookie-list { display: grid; gap: 8px; }
.cookie-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 8px 10px; border-radius: 8px; background: rgba(255,255,255,0.02); }
.cookie-info { display: grid; gap: 2px; min-width: 0; }
.cookie-info code { font-size: .78rem; color: var(--primary); background: rgba(47,125,246,0.08); padding: 2px 7px; border-radius: 5px; width: fit-content; }
.cookie-info span { font-size: .75rem; color: var(--text-muted); }

.switch { position: relative; width: 38px; height: 22px; border-radius: 999px; background: rgba(255,255,255,0.08); border: 1px solid var(--border); cursor: pointer; transition: background .2s; flex-shrink: 0; display: inline-block; }
.switch .knob { position: absolute; top: 2px; left: 2px; width: 16px; height: 16px; border-radius: 50%; background: var(--text-muted); transition: all .2s; }
.switch.on { background: rgba(47,125,246,0.35); border-color: var(--primary); }
.switch.on .knob { left: 18px; background: #fff; }
.switch input { display: none; }
</style>
