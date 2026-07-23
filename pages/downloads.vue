1|<template>
2|  <div ref="pageRef" class="downloads-page">
3|    <div class="container">
4|      <div class="page-header anim-up">
5|        <h1>Mes téléchargements</h1>
6|        <p>Retrouvez tous vos achats et téléchargez vos fichiers.</p>
7|      </div>
8|
9|      <div v-if="loading" class="loading-state anim-up">
10|        <div class="loader"></div>
11|        <span>Chargement de vos achats…</span>
12|      </div>
13|
14|      <div v-else-if="error" class="error-state anim-up">
15|        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--red)" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
16|        <h2>Erreur</h2>
17|        <p>{{ error }}</p>
18|        <button class="btn-retry" @click="fetchPurchases">Réessayer</button>
19|      </div>
20|
21|      <!-- Manuel : coller l'ID de session Stripe -->
22|      <div v-if="!checkoutSessionId && !purchases.length" class="manual-confirm anim-up">
23|        <p>Vous avez payé mais rien ne s'affiche ? Collez l'ID de session Stripe ici :</p>
24|        <div class="manual-row">
25|          <input v-model="manualSessionId" placeholder="cs_test_..." class="manual-input" />
26|          <button class="btn-confirm" @click="confirmManual">Confirmer</button>
27|        </div>
28|      </div>
29|
30|      <div v-else-if="!purchases.length" class="empty-state anim-up">
31|        <!-- Paiement en attente de confirmation -->
32|        <div v-if="checkoutSessionId" class="confirm-banner">
33|          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#f5b342" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
34|          <div><strong>Paiement reçu !</strong><span>Confirmation en cours…</span></div>
35|          <button class="btn-confirm" @click="retryConfirm">Vérifier</button>
36|          <button v-if="checkoutSessionId && !retrying" class="btn-force" @click="forceConfirm" style="background:#ef4444;padding:8px 14px;border-radius:6px;border:none;color:#fff;font-size:.72rem;font-weight:700;cursor:pointer;font-family:inherit;">Force</button>
37|        </div>
38|        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="1"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
39|        <h2>Aucun téléchargement</h2>
40|        <p>Vous n'avez encore rien acheté sur la marketplace.</p>
41|        <NuxtLink to="/catalogue" class="btn-browse">Parcourir le catalogue</NuxtLink>
42|      </div>
43|
44|      <div v-else class="purchases-list anim-up">
45|        <article v-for="item in purchases" :key="item.order_item_id" class="purchase-card">
46|          <div class="purchase-thumb">
47|            <img :src="item.thumbnail || '/placeholder.svg'" :alt="item.title" />
48|          </div>
49|          <div class="purchase-info">
50|            <h3>{{ item.title }}</h3>
51|            <div class="purchase-meta">
52|              <span class="meta-cat">{{ item.category_name }}</span>
53|              <span class="meta-date">Acheté le {{ formatDate(item.purchase_date) }}</span>
54|              <span class="meta-price">{{ Number(item.price).toFixed(2) }}€</span>
55|            </div>
56|            <div v-if="item.files?.length" class="purchase-files">
57|              <div v-for="f in item.files" :key="f.id" class="file-row">
58|                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
59|                <span class="file-name">{{ f.filename }}</span>
60|                <span class="file-size">{{ formatSize(f.file_size) }}</span>
61|                <button class="btn-dl" @click="download(item.order_item_id)" :disabled="downloading === item.order_item_id">
62|                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
63|                  {{ downloading === item.order_item_id ? 'Téléchargement…' : 'Télécharger' }}
64|                </button>
65|              </div>
66|            </div>
67|            <div v-else class="no-files">
68|              <span>Aucun fichier disponible pour ce produit.</span>
69|            </div>
70|          </div>
71|        </article>
72|      </div>
73|    </div>
74|    <ToastNotif ref="toastRef" />
75|  </div>
76|</template>
77|
78|<script setup lang="ts">
79|definePageMeta({ layout: 'default' })
80|
81|const config = useRuntimeConfig()
82|const api = config.public.apiOrigin
83|const pageRef = ref<HTMLElement | null>(null)
84|const toastRef = ref<InstanceType<typeof ToastNotif> | null>(null)
85|
86|const purchases = ref<any[]>([])
87|const loading = ref(true)
88|const error = ref('')
89|const downloading = ref<number | null>(null)
90|const checkoutSessionId = ref('')
91|const manualSessionId = ref('')
92|
93|async function fetchPurchases() {
94|  loading.value = true; error.value = ''
95|  try {
96|    const controller = new AbortController()
97|    const timeout = setTimeout(() => controller.abort(), 15000)
98|    const data = await $fetch(api + '/api/user/purchases', { credentials: 'include', signal: controller.signal })
99|    clearTimeout(timeout)
100|    purchases.value = data.items || []
101|  } catch (e: any) {
102|    if (e?.statusCode === 401) {
103|      error.value = 'Vous devez être connecté pour voir vos achats.'
104|    } else {
105|      error.value = 'Impossible de charger vos achats. Réessayez plus tard.'
106|    }
107|  } finally {
108|    loading.value = false
109|  }
110|}
111|
112|async function download(orderItemId: number) {
113|  downloading.value = orderItemId
114|  try {
115|    const data = await $fetch(api + '/api/download/' + orderItemId, { credentials: 'include' })
116|    
117|    if (data.files?.length === 1) {
118|      // Un seul fichier → redirect direct
119|      window.location.href = data.files[0].url
120|    } else if (data.files?.length > 1) {
121|      // Multiples fichiers → ouvrir dans des nouveaux onglets
122|      data.files.forEach((f: any) => window.open(f.url, '_blank'))
123|    }
124|    toastRef.value?.show('success', 'Téléchargement démarré ✓')
125|  } catch (e: any) {
126|    const msg = e?.data?.message || e?.message || 'Erreur de téléchargement'
127|    toastRef.value?.show('error', msg)
128|  } finally {
129|    downloading.value = null
130|  }
131|}
132|
133|function formatDate(dateStr: string) {
134|  return new Date(dateStr).toLocaleDateString('fr-FR', {
135|    day: 'numeric', month: 'long', year: 'numeric'
136|  })
137|}
138|
139|function formatSize(bytes: number) {
140|  if (!bytes) return ''
141|  if (bytes < 1024) return bytes + ' o'
142|  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' Ko'
143|  return (bytes / (1024 * 1024)).toFixed(1) + ' Mo'
144|}
145|
146|async function retryConfirm() {
147|  if (!checkoutSessionId.value) return
148|  try {
149|    const res = await $fetch('/api/checkout/nitro-confirm?session_id=' + checkoutSessionId.value, { credentials: 'include' })




154|    fetchPurchases()
155|  } catch (e: any) {
156|    toastRef.value?.show('error', e?.data?.message || 'Erreur de confirmation')
157|  }
158|}
159|
160|async function forceConfirm() {
161|  if (!checkoutSessionId.value) return
162|  try {
163|    const res = await $fetch(api + '/api/checkout/debug-confirm', {
164|      method: 'POST', credentials: 'include', body: { sessionId: checkoutSessionId.value }
165|    })
166|    toastRef.value?.show('success', 'Commande forcée !')
167|    checkoutSessionId.value = ''
168|    fetchPurchases()
169|  } catch (e: any) {
170|    toastRef.value?.show('error', e?.data?.message || 'Erreur force')
171|  }
172|}
173|
174|async function confirmManual() {
175|  const sid = manualSessionId.value.trim()
176|  if (!sid) return
177|  try {
178|    const res = await $fetch(api + '/api/checkout/confirm-session', {
179|      method: 'POST', credentials: 'include', body: { sessionId: sid }
180|    })
181|    toastRef.value?.show('success', 'Commande confirmée !')
182|    manualSessionId.value = ''
183|    await new Promise(r => setTimeout(r, 500))
184|    window.location.reload()
185|  } catch (e: any) {
186|    const msg = e?.data?.message || e?.message || 'Erreur'
187|    toastRef.value?.show('error', msg)
188|  }
189|}
190|
191|onMounted(async () => {
192|  const { load, pageEntrance } = await import('~/composables/useAnimation')
193|  const { gsap } = await load()
194|  if (gsap) pageEntrance(gsap, pageRef.value)
195|
196|  // If redirected from Stripe after payment, confirm the session
197|  const params = new URLSearchParams(window.location.search)
198|  const sessionId = params.get('session_id')
199|  if (params.get('confirmed') === '1' && sessionId) {
200|    checkoutSessionId.value = sessionId
201|    // Auto-confirm with a small delay for Stripe processing
202|    await new Promise(r => setTimeout(r, 1500))
203|    await retryConfirm()
204|  }
205|
206|  fetchPurchases()
207|})
208|</script>
209|
210|<style scoped>
211|.downloads-page { padding: 32px 0 80px; min-height: 60vh; }
212|
213|.page-header { margin-bottom: 32px; }
214|.page-header h1 { font-size: 1.6rem; font-weight: 900; letter-spacing: -.03em; margin: 0 0 6px; }
215|.page-header p { color: var(--text-secondary); font-size: .95rem; margin: 0; }
216|
217|.loading-state { display: flex; flex-direction: column; align-items: center; gap: 16px; padding: 80px 0; color: var(--text-muted); }
218|.loader { width: 32px; height: 32px; border: 3px solid var(--border); border-top-color: var(--primary); border-radius: 50%; animation: spin .6s linear infinite; }
219|@keyframes spin { to { transform: rotate(360deg); } }
220|
221|.error-state { display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 60px 0; text-align: center; }
222|.error-state h2 { margin: 0; font-size: 1.2rem; }
223|.error-state p { color: var(--text-secondary); margin: 0; }
224|.btn-retry { padding: 10px 24px; border-radius: 8px; border: 1px solid var(--border); background: var(--bg-card); color: var(--text); font-size: .85rem; font-weight: 600; cursor: pointer; font-family: inherit; }
225|
226|.empty-state { display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 80px 0; text-align: center; }
227|.empty-state h2 { margin: 0; font-size: 1.2rem; }
228|.empty-state p { color: var(--text-secondary); margin: 0; }
229|.btn-browse { margin-top: 8px; padding: 12px 28px; border-radius: 10px; background: linear-gradient(135deg, var(--primary), var(--accent)); color: #fff; font-size: .9rem; font-weight: 700; text-decoration: none; }
230|
231|.purchases-list { display: grid; gap: 16px; }
232|
233|.purchase-card { display: flex; gap: 20px; padding: 16px; border-radius: 12px; border: 1px solid var(--border); background: var(--bg-card); }
234|@media (max-width: 640px) { .purchase-card { flex-direction: column; } }
235|
236|.purchase-thumb { width: 120px; height: 80px; border-radius: 8px; overflow: hidden; flex-shrink: 0; background: var(--bg-surface); }
237|.purchase-thumb img { width: 100%; height: 100%; object-fit: cover; }
238|
239|.purchase-info { flex: 1; min-width: 0; display: grid; gap: 8px; }
240|.purchase-info h3 { margin: 0; font-size: 1rem; font-weight: 700; }
241|
242|.purchase-meta { display: flex; flex-wrap: wrap; gap: 10px; font-size: .78rem; color: var(--text-muted); }
243|.meta-cat { padding: 2px 8px; border-radius: 4px; background: rgba(47,125,246,0.06); border: 1px solid rgba(47,125,246,0.12); color: var(--primary); font-weight: 600; }
244|.meta-date { color: var(--text-secondary); }
245|.meta-price { font-weight: 700; color: var(--text); }
246|
247|.purchase-files { display: grid; gap: 6px; margin-top: 4px; }
248|.file-row { display: flex; align-items: center; gap: 8px; padding: 8px 12px; border-radius: 6px; background: var(--bg-surface); border: 1px solid var(--border); font-size: .82rem; }
249|.file-row svg { color: var(--primary); flex-shrink: 0; }
250|.file-name { flex: 1; font-weight: 600; color: var(--text); min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
251|.file-size { color: var(--text-muted); font-size: .75rem; flex-shrink: 0; }
252|
253|.btn-dl { display: flex; align-items: center; gap: 5px; padding: 6px 14px; border-radius: 6px; border: none; background: linear-gradient(135deg, var(--primary), var(--accent)); color: #fff; font-size: .78rem; font-weight: 700; cursor: pointer; font-family: inherit; transition: all .15s; flex-shrink: 0; }
254|.btn-dl:hover:not(:disabled) { opacity: .9; }
255|.btn-dl:disabled { opacity: .5; cursor: not-allowed; }
256|
257|.no-files { padding: 8px 0; font-size: .82rem; color: var(--text-muted); }
258|.confirm-banner { display:flex;align-items:center;gap:12px;padding:16px 20px;border-radius:12px;border:1px solid rgba(245,179,66,0.2);background:rgba(245,179,66,0.04);width:100%;max-width:400px;margin-bottom:16px; }
259|.confirm-banner div { display:grid;gap:2px;text-align:left;flex:1; }
260|.confirm-banner strong { font-size:.85rem;font-weight:700; }
261|.confirm-banner span { font-size:.75rem;color:var(--text-muted); }
262|.btn-confirm { padding:8px 18px;border-radius:6px;border:none;background:linear-gradient(135deg,#f5b342,#f59e0b);color:#fff;font-size:.78rem;font-weight:700;cursor:pointer;font-family:inherit;transition:all .15s; }
263|.manual-confirm { text-align:center;padding:32px 20px;max-width:480px;margin:0 auto; }
264|.manual-confirm p { font-size:.85rem;color:var(--text-secondary);margin-bottom:12px; }
265|.manual-row { display:flex;gap:8px; }
266|.manual-input { flex:1;padding:10px 14px;border-radius:8px;border:1px solid var(--border);background:var(--bg-surface);color:var(--text);font-size:.85rem;outline:none;font-family:monospace; }
267|.manual-input:focus { border-color:var(--primary); }
268|</style>
269|