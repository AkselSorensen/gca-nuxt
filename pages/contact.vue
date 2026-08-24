<template>
  <div ref="pageRef" class="page-static">
    <div class="container contact-wrap">
      <div class="page-header anim-up">
        <h1>Contact</h1>
        <p>Une question, une commande, un problème après-achat ? Écrivez-nous.</p>
      </div>

      <div class="contact-grid anim-card">
        <!-- Formulaire -->
        <div class="contact-form-card">
          <form @submit.prevent="submit">
            <div class="form-row">
              <div class="field"><label>Nom *</label><input v-model="form.name" type="text" placeholder="Votre nom" required /></div>
              <div class="field"><label>Email *</label><input v-model="form.email" type="email" placeholder="vous@exemple.com" required /></div>
            </div>
            <div class="field"><label>Sujet</label>
              <select v-model="form.subject">
                <option value="" disabled>Sélectionner</option>
                <option>Question sur un produit</option>
                <option>Commande / Téléchargement</option>
                <option>Problème après-achat</option>
                <option>Devenir vendeur</option>
                <option>Prestation Game Design / 3D</option>
                <option>Autre</option>
              </select>
            </div>
            <div class="field"><label>Message *</label><textarea v-model="form.message" rows="6" placeholder="Décrivez votre demande..." required></textarea></div>
            <!-- Honeypot anti-spam -->
            <input v-model="form.website" type="text" class="hp-field" tabindex="-1" autocomplete="off" />

            <p v-if="error" class="contact-error">{{ error }}</p>
            <div v-if="success" class="contact-success">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--green)" stroke-width="2"><path d="M22 2 11 13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
              <span>{{ successMsg }}</span>
            </div>

            <button class="btn-send" :disabled="sending">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
              {{ sending ? 'Envoi…' : 'Envoyer le message' }}
            </button>
          </form>
        </div>

        <!-- Infos -->
        <div class="contact-info">
          <div class="ci-block">
            <div class="ci-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.37a19.79 19.79 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128c.126-.094.252-.192.372-.291a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg></div>
            <div>
              <h3>Discord — réponse rapide</h3>
              <p>Pour une réponse immédiate, rejoignez le serveur communautaire.</p>
              <a href="https://discord.gg/KDsEzGRnKs" target="_blank" rel="noopener" class="ci-link">discord.gg/KDsEzGRnKs</a>
            </div>
          </div>

          <div class="ci-block">
            <div class="ci-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg></div>
            <div>
              <h3>Par email</h3>
              <p>Le formulaire envoie directement votre message à l'équipe GSA.</p>
              <span class="ci-mail">gsa.storee@yahoo.com</span>
            </div>
          </div>

          <div class="ci-block">
            <div class="ci-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg></div>
            <div>
              <h3>Délai de réponse</h3>
              <p>Support de premier niveau sous 7 jours après un achat. Réponse sous 24-48h en moyenne.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const config = useRuntimeConfig()
const api = config.public.apiOrigin

const form = reactive({ name: '', email: '', subject: '', message: '', website: '' })
const sending = ref(false)
const error = ref('')
const success = ref(false)
const successMsg = ref('')

async function submit() {
  sending.value = true
  error.value = ''
  success.value = false
  try {
    const res = await $fetch(api + '/api/contact', {
      method: 'POST',
      body: { ...form },
    })
    if (res?.delivered === false) {
      success.value = true
      successMsg.value = 'Message enregistré — la configuration email sera bientôt active. Rejoignez le Discord pour une réponse immédiate.'
    } else {
      success.value = true
      successMsg.value = 'Votre message a bien été envoyé ! Nous vous répondrons sous 24-48h.'
    }
    form.name = ''; form.email = ''; form.subject = ''; form.message = ''
  } catch (e: any) {
    error.value = e?.data?.statusMessage || 'Une erreur est survenue. Réessayez ou passez par Discord.'
  } finally {
    sending.value = false
  }
}

const pageRef = ref<HTMLElement | null>(null)
onMounted(async () => {
  const { load, pageEntrance } = await import('~/composables/useAnimation')
  const { gsap } = await load()
  if (gsap) pageEntrance(gsap, pageRef.value)
})
</script>

<style scoped>
.page-static { padding:40px 0 64px; }
.contact-wrap { max-width: 960px; }
.page-header { margin-bottom: 40px; }
.page-header h1 { font-size: 2rem; font-weight: 900; letter-spacing: -.03em; }
.page-header p { color: var(--text-secondary); margin-top: 8px; font-size: 1.02rem; }

.contact-grid { display: grid; grid-template-columns: 1.4fr 1fr; gap: 24px; align-items: start; }
@media (max-width: 860px) { .contact-grid { grid-template-columns: 1fr; } }

.contact-form-card { padding: 28px; background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius-lg); }
.contact-form-card form { display: grid; gap: 14px; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
@media (max-width: 560px) { .form-row { grid-template-columns: 1fr; } }
.field { display: grid; gap: 6px; }
.field label { font-size: .78rem; font-weight: 700; color: var(--text-secondary); }
.field input, .field select, .field textarea { padding: 11px 13px; border-radius: 10px; border: 1px solid var(--border); background: var(--bg-surface); color: var(--text); font-size: .9rem; font-family: inherit; transition: border-color .2s; width: 100%; box-sizing: border-box; }
.field input:focus, .field select:focus, .field textarea:focus { outline: none; border-color: var(--primary); }
.field textarea { resize: vertical; min-height: 130px; }
.hp-field { display: none; }

.contact-error { margin: 0; color: var(--red); font-size: .85rem; }
.contact-success { display: flex; align-items: center; gap: 8px; padding: 12px 14px; border-radius: 10px; background: rgba(110,231,183,0.08); border: 1px solid rgba(110,231,183,0.2); color: var(--green); font-size: .85rem; }
.btn-send { display: inline-flex; align-items: center; justify-content: center; gap: 8px; padding: 13px; border: none; border-radius: 10px; background: linear-gradient(135deg, var(--primary), var(--accent)); color: #fff; font-weight: 700; font-size: .92rem; cursor: pointer; transition: filter .2s, transform .2s; }
.btn-send:hover:not(:disabled) { filter: brightness(1.1); transform: translateY(-1px); }
.btn-send:disabled { opacity: .5; cursor: not-allowed; }

.contact-info { display: grid; gap: 14px; }
.ci-block { display: flex; gap: 14px; padding: 20px; background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius-lg); }
.ci-icon { width: 42px; height: 42px; min-width: 42px; border-radius: 11px; background: rgba(47,125,246,0.08); border: 1px solid rgba(47,125,246,0.15); display: grid; place-items: center; color: var(--primary); }
.ci-block h3 { margin: 0; font-size: .95rem; font-weight: 800; }
.ci-block p { margin: 4px 0 0; color: var(--text-muted); font-size: .8rem; line-height: 1.6; }
.ci-link { display: inline-block; margin-top: 6px; color: #5865f2; font-weight: 700; font-size: .82rem; text-decoration: none; }
.ci-link:hover { text-decoration: underline; }
.ci-mail { display: inline-block; margin-top: 6px; color: var(--text-secondary); font-size: .8rem; font-weight: 600; }
</style>
