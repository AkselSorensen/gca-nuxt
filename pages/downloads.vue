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
21|      <div v-else-if="!purchases.length" class="empty-state anim-up">
22|        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="1"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
23|        <h2>Aucun téléchargement</h2>
24|        <p>Vous n'avez encore rien acheté sur la marketplace.</p>
25|        <NuxtLink to="/catalogue" class="btn-browse">Parcourir le catalogue</NuxtLink>
26|      </div>
27|
28|      <div v-else class="purchases-list anim-up">
29|        <div v-for="item in purchases" :key="item.order_item_id" class="dl-card">
30|          <div class="dl-card-top">
31|            <div class="dl-thumb">
32|              <img :src="item.thumbnail || '/placeholder.svg'" :alt="item.title" />
33|            </div>
34|            <div class="dl-info">
35|              <h3 class="dl-title">{{ item.title }}</h3>
36|              <div class="dl-meta">
37|                <span class="dl-cat">{{ item.category_name }}</span>
38|                <span class="dl-date">Acheté le {{ formatDate(item.purchase_date) }}</span>
39|              </div>
40|              <div class="dl-price">{{ Number(item.price).toFixed(2) }}€</div>
41|            </div>
42|          </div>
43|          <div v-if="item.files?.length" class="dl-files">
44|            <div v-for="f in item.files" :key="f.id" class="dl-file">
45|              <div class="dl-file-left">
46|                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
47|                <span class="dl-filename">{{ f.filename }}</span>
48|                <span class="dl-filesize">{{ formatSize(f.file_size) }}</span>
49|              </div>
50|              <button class="dl-btn" @click="download(item.order_item_id)" :disabled="downloading === item.order_item_id">
51|                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
52|                <span v-if="downloading !== item.order_item_id">Télécharger</span>
53|                <span v-else>Chargement…</span>
54|              </button>
55|            </div>
56|          </div>
57|          <div v-else class="dl-nofiles">
58|            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
59|            <span>Aucun fichier disponible</span>
60|          </div>
61|        </div>
62|      </div>
63|    </div>
64|    <ToastNotif ref="toastRef" />
65|  </div>
66|</template>
67|
68|<script setup lang="ts">
69|definePageMeta({ layout: 'default' })
70|
71|const config = useRuntimeConfig()
72|const api = config.public.apiOrigin
73|const pageRef = ref<HTMLElement | null>(null)
74|const toastRef = ref<InstanceType<typeof ToastNotif> | null>(null)
75|
76|const purchases = ref<any[]>([])
77|const loading = ref(true)
78|const error = ref('')
79|const downloading = ref<number | null>(null)
82|
83|async function fetchPurchases() {
84|  loading.value = true; error.value = ''
85|  try {
86|    const data = await $fetch(api + '/api/user/purchases', { credentials: 'include' })
87|    purchases.value = data.items || []
88|  } catch (e: any) {
89|    if (e?.statusCode === 401) {
90|      error.value = 'Vous devez être connecté pour voir vos achats.'
91|    } else {
92|      error.value = 'Impossible de charger vos achats. Réessayez plus tard.'
93|    }
94|  } finally {
95|    loading.value = false
96|  }
97|}
98|
99|async function download(orderItemId: number) {
100|  downloading.value = orderItemId
101|  try {
102|    const data = await $fetch(api + '/api/download/' + orderItemId, { credentials: 'include' })
103|    
104|    if (data.files?.length === 1) {
105|      // Un seul fichier → redirect direct
106|      window.location.href = data.files[0].url
107|    } else if (data.files?.length > 1) {
108|      // Multiples fichiers → ouvrir dans des nouveaux onglets
109|      data.files.forEach((f: any) => window.open(f.url, '_blank'))
110|    }
111|    toastRef.value?.show('success', 'Téléchargement démarré ✓')
112|  } catch (e: any) {
113|    const msg = e?.data?.message || e?.message || 'Erreur de téléchargement'
114|    toastRef.value?.show('error', msg)
115|  } finally {
116|    downloading.value = null
117|  }
118|}
119|
120|function formatDate(dateStr: string) {
121|  return new Date(dateStr).toLocaleDateString('fr-FR', {
122|    day: 'numeric', month: 'long', year: 'numeric'
123|  })
124|}
125|
126|function formatSize(bytes: number) {
127|  if (!bytes) return ''
128|  if (bytes < 1024) return bytes + ' o'
129|  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' Ko'
130|  return (bytes / (1024 * 1024)).toFixed(1) + ' Mo'
131|}
132|
135|  try {
136|    const res = await $fetch(api + '/api/checkout/confirm-session', {
138|    })
139|    toastRef.value?.show('success', 'Paiement confirmé !')
141|    fetchPurchases()
142|  } catch (e: any) {
143|    toastRef.value?.show('error', e?.data?.message || 'Erreur de confirmation')
144|  }
145|}
146|
149|  try {
150|    const res = await $fetch(api + '/api/checkout/debug-confirm', {
152|    })
153|    toastRef.value?.show('success', 'Commande forcée !')
155|    fetchPurchases()
156|  } catch (e: any) {
157|    toastRef.value?.show('error', e?.data?.message || 'Erreur force')
158|  }
159|}
160|
163|  if (!sid) return
164|  try {
165|    const res = await $fetch(api + '/api/checkout/confirm-session', {
166|      method: 'POST', credentials: 'include', body: { sessionId: sid }
167|    })
168|    toastRef.value?.show('success', 'Commande confirmée !')
170|    await new Promise(r => setTimeout(r, 500))
171|    window.location.reload()
172|  } catch (e: any) {
173|    const msg = e?.data?.message || e?.message || 'Erreur'
174|    toastRef.value?.show('error', msg)
175|  }
176|}
177|
178|onMounted(async () => {
179|  const { load, pageEntrance } = await import('~/composables/useAnimation')
180|  const { gsap } = await load()
181|  if (gsap) pageEntrance(gsap, pageRef.value)
182|
183|  // If redirected from Stripe after payment, confirm the session
184|  const params = new URLSearchParams(window.location.search)
185|  const sessionId = params.get('session_id')
186|  if (params.get('confirmed') === '1' && sessionId) {
188|    // Auto-confirm with a small delay for Stripe processing
189|    await new Promise(r => setTimeout(r, 1500))
191|  }
192|
193|  fetchPurchases()
194|})
195|</script>
196|
197|<style scoped>
198|.downloads-page { padding: 32px 0 80px; min-height: 60vh; }
199|
200|.page-header { margin-bottom: 32px; }
201|.page-header h1 { font-size: 1.6rem; font-weight: 900; letter-spacing: -.03em; margin: 0 0 6px; }
202|.page-header p { color: var(--text-secondary); font-size: .95rem; margin: 0; }
203|
204|.loading-state { display: flex; flex-direction: column; align-items: center; gap: 16px; padding: 80px 0; color: var(--text-muted); }
205|.loader { width: 32px; height: 32px; border: 3px solid var(--border); border-top-color: var(--primary); border-radius: 50%; animation: spin .6s linear infinite; }
206|@keyframes spin { to { transform: rotate(360deg); } }
207|
208|.error-state { display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 60px 0; text-align: center; }
209|.error-state h2 { margin: 0; font-size: 1.2rem; }
210|.error-state p { color: var(--text-secondary); margin: 0; }
211|.btn-retry { padding: 10px 24px; border-radius: 8px; border: 1px solid var(--border); background: var(--bg-card); color: var(--text); font-size: .85rem; font-weight: 600; cursor: pointer; font-family: inherit; }
212|
213|.empty-state { display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 80px 0; text-align: center; }
214|.empty-state h2 { margin: 0; font-size: 1.2rem; }
215|.empty-state p { color: var(--text-secondary); margin: 0; }
216|.btn-browse { margin-top: 8px; padding: 12px 28px; border-radius: 10px; background: linear-gradient(135deg, var(--primary), var(--accent)); color: #fff; font-size: .9rem; font-weight: 700; text-decoration: none; }
217|
218|.purchases-list { display: grid; gap: 16px; }
219|
220|.purchase-card { display: flex; gap: 20px; padding: 16px; border-radius: 12px; border: 1px solid var(--border); background: var(--bg-card); }
221|@media (max-width: 640px) { .purchase-card { flex-direction: column; } }
222|
223|.purchase-thumb { width: 120px; height: 80px; border-radius: 8px; overflow: hidden; flex-shrink: 0; background: var(--bg-surface); }
224|.purchase-thumb img { width: 100%; height: 100%; object-fit: cover; }
225|
226|.purchase-info { flex: 1; min-width: 0; display: grid; gap: 8px; }
227|.purchase-info h3 { margin: 0; font-size: 1rem; font-weight: 700; }
228|
229|.purchase-meta { display: flex; flex-wrap: wrap; gap: 10px; font-size: .78rem; color: var(--text-muted); }
230|.meta-cat { padding: 2px 8px; border-radius: 4px; background: rgba(47,125,246,0.06); border: 1px solid rgba(47,125,246,0.12); color: var(--primary); font-weight: 600; }
231|.meta-date { color: var(--text-secondary); }
232|.meta-price { font-weight: 700; color: var(--text); }
233|
234|.purchase-files { display: grid; gap: 6px; margin-top: 4px; }
235|.file-row { display: flex; align-items: center; gap: 8px; padding: 8px 12px; border-radius: 6px; background: var(--bg-surface); border: 1px solid var(--border); font-size: .82rem; }
236|.file-row svg { color: var(--primary); flex-shrink: 0; }
237|.file-name { flex: 1; font-weight: 600; color: var(--text); min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
238|.file-size { color: var(--text-muted); font-size: .75rem; flex-shrink: 0; }
239|
240|.btn-dl { display: flex; align-items: center; gap: 5px; padding: 6px 14px; border-radius: 6px; border: none; background: linear-gradient(135deg, var(--primary), var(--accent)); color: #fff; font-size: .78rem; font-weight: 700; cursor: pointer; font-family: inherit; transition: all .15s; flex-shrink: 0; }
241|.btn-dl:hover:not(:disabled) { opacity: .9; }
242|.btn-dl:disabled { opacity: .5; cursor: not-allowed; }
243|
244|.no-files { padding: 8px 0; font-size: .82rem; color: var(--text-muted); }
245|.confirm-banner { display:flex;align-items:center;gap:12px;padding:16px 20px;border-radius:12px;border:1px solid rgba(245,179,66,0.2);background:rgba(245,179,66,0.04);width:100%;max-width:400px;margin-bottom:16px; }
246|.confirm-banner div { display:grid;gap:2px;text-align:left;flex:1; }
247|.confirm-banner strong { font-size:.85rem;font-weight:700; }
248|.confirm-banner span { font-size:.75rem;color:var(--text-muted); }
249|.btn-confirm { padding:8px 18px;border-radius:6px;border:none;background:linear-gradient(135deg,#f5b342,#f59e0b);color:#fff;font-size:.78rem;font-weight:700;cursor:pointer;font-family:inherit;transition:all .15s; }
250|.manual-confirm { text-align:center;padding:32px 20px;max-width:480px;margin:0 auto; }
251|.manual-confirm p { font-size:.85rem;color:var(--text-secondary);margin-bottom:12px; }
252|.manual-row { display:flex;gap:8px; }
253|.manual-input { flex:1;padding:10px 14px;border-radius:8px;border:1px solid var(--border);background:var(--bg-surface);color:var(--text);font-size:.85rem;outline:none;font-family:monospace; }
254|.manual-input:focus { border-color:var(--primary); }
255|</style>
256|