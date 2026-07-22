1|<template>
2|  <div class="admin-page">
3|    <aside class="admin-sidebar">
4|      <div class="sidebar-brand">
5|        <NuxtLink to="/" class="brand-icon">G</NuxtLink>
6|        <h1>Dashboard</h1>
7|        <span class="badge">Admin</span>
8|      </div>
9|      <nav class="sidebar-nav">
10|        <button v-for="t in tabs" :key="t.id" class="nav-btn" :class="{ active: activeTab === t.id }" @click="activeTab = t.id">
11|          <span v-html="t.icon"></span>
12|          {{ t.label }}
13|        </button>
14|      </nav>
15|      <div class="sidebar-footer">
16|        <NuxtLink to="/" class="back-link">Retour au site</NuxtLink>
17|        <button @click="logout" class="btn-logout">Déconnexion</button>
18|      </div>
19|    </aside>
20|    <main class="admin-main">
21|
22|      <!-- ==================== PRODUITS ==================== -->
23|      <div v-if="activeTab === 'products'" class="tab-content">
24|        <div class="tab-header"><h2>Produits</h2><button class="btn-primary" @click="openProductForm">+ Ajouter un produit</button></div>
25|        <div class="table-wrap">
26|          <table v-if="products.length" class="admin-table">
27|            <thead><tr><th>Image</th><th>Titre</th><th>Catégorie</th><th>Prix</th><th>Ventes</th><th>Actions</th></tr></thead>
28|            <tbody>
29|              <tr v-for="p in products" :key="p.id">
30|                <td><img :src="p.thumbnail || p.media?.[0]?.thumbnail || p.media?.[0]?.url || ''" class="thumb" /></td>
31|                <td><strong>{{ p.title }}</strong></td>
32|                <td><span class="badge-cat">{{ p.category || p.categoryName || '—' }}</span></td>
33|                <td class="price-cell">{{ Number(p.price).toFixed(2) }}€</td>
34|                <td>{{ p.sales || 0 }}</td>
35|                <td class="actions">
36|                  <button class="btn-action" title="Modifier" @click="editProduct(p)"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>
37|                  <button class="btn-action danger" title="Supprimer" @click="deleteProduct(p.id)"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg></button>
38|                </td>
39|              </tr>
40|            </tbody>
41|          </table>
42|          <div v-else class="empty-tab">Aucun produit.</div>
43|        </div>
44|      </div>
45|
46|      <!-- ==================== UTILISATEURS ==================== -->
47|      <div v-if="activeTab === 'users'" class="tab-content">
48|        <div class="tab-header"><h2>Utilisateurs</h2></div>
49|        <div class="table-wrap">
50|          <table v-if="users.length" class="admin-table">
51|            <thead><tr><th>ID</th><th>Nom</th><th>Email</th><th>Rôle</th><th>Date</th></tr></thead>
52|            <tbody>
53|              <tr v-for="u in users" :key="u.id">
54|                <td>{{ u.id }}</td>
55|                <td><strong>{{ u.username }}</strong></td>
56|                <td>{{ u.email }}</td>
57|                <td><span class="role-badge" :class="u.role">{{ u.role }}</span></td>
58|                <td>{{ u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—' }}</td>
59|              </tr>
60|            </tbody>
61|          </table>
62|          <div v-else class="empty-tab">Aucun utilisateur.</div>
63|        </div>
64|      </div>
65|
66|      <!-- ==================== MISE EN AVANT ==================== -->
67|      <div v-if="activeTab === 'featured'" class="tab-content">
68|        <div class="tab-header"><h2>Mise en avant</h2></div>
69|        <p class="tab-desc">Gérez les bannières affichées sur la page d'accueil — photos uniquement, sans texte ni produit.</p>
70|        
71|        <div class="featured-groups">
72|          <!-- Collaborateur -->
73|          <div class="group-card">
74|            <div class="group-header"><h3>Collaborateur</h3></div>
75|            <div class="group-grid">
76|              <div v-for="(item, i) in featuredCollab" :key="i" class="fitem">
77|                <div class="fpreview" v-if="item.image"><img :src="item.image" alt="" /></div>
78|                <div class="fnopreview" v-else><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg><span>Ajouter une image</span></div>
79|                <div class="fname">{{ item.name || 'Sans nom' }}</div>
80|                <button class="fremove" @click="removeFeat('collab', i)"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
81|              </div>
82|              <div class="fadd" @click="addFeat('collab')">
83|                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
84|                <span>Ajouter</span>
85|              </div>
86|            </div>
87|          </div>
88|
89|          <!-- Communauté -->
90|          <div class="group-card">
91|            <div class="group-header"><h3>Communauté</h3></div>
92|            <div class="group-grid">
93|              <div v-for="(item, i) in featuredComm" :key="i" class="fitem">
94|                <div class="fpreview" v-if="item.image"><img :src="item.image" alt="" /></div>
95|                <div class="fnopreview" v-else><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg><span>Ajouter une image</span></div>
96|                <div class="fname">{{ item.name || 'Sans nom' }}</div>
97|                <button class="fremove" @click="removeFeat('comm', i)"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
98|              </div>
99|              <div class="fadd" @click="addFeat('comm')">
100|                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
101|                <span>Ajouter</span>
102|              </div>
103|            </div>
104|          </div>
105|        </div>
106|
107|        <button class="btn-primary" :disabled="savingFeatured" @click="saveFeatured">
108|          <span v-if="savingFeatured" class="spinner"></span>
109|          {{ savingFeatured ? 'Enregistrement…' : 'Enregistrer la mise en avant' }}
110|        </button>
111|      </div>
112|
113|      <!-- ==================== PAGES / CONFIG ==================== -->
114|      <div v-if="activeTab === 'pages'" class="tab-content">
115|        <div class="tab-header"><h2>Configuration des pages</h2></div>
116|        <div class="page-editors">
117|          <div v-for="page in editablePages" :key="page.key" class="editor-card">
118|            <div class="editor-header">
119|              <h3>{{ page.label }}</h3>
120|              <div class="editor-actions">
121|                <button class="btn-ghost btn-sm" @click="page.showPreview = !page.showPreview">
122|                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
123|                  {{ page.showPreview ? 'Masquer' : 'Aperçu' }}
124|                </button>
125|                <button class="btn-primary btn-sm" :disabled="page.saving" @click="savePage(page)">
126|                  <span v-if="page.saving" class="spinner" style="width:14px;height:14px;border-width:2px;"></span>
127|                  <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
128|                  {{ page.saving ? 'Sauvegarde…' : 'Enregistrer' }}
129|                </button>
130|                <span v-if="page.saved" class="saved-msg">Enregistré ✓</span>
131|              </div>
132|            </div>
133|            <div class="editor-layout" v-if="!page.showPreview">
134|              <textarea v-model="page.raw" rows="16" class="editor-textarea" placeholder="Données JSON…"></textarea>
135|            </div>
136|            <div v-else class="preview-wrap">
137|              <div class="preview-json">{{ page.raw }}</div>
138|            </div>
139|          </div>
140|        </div>
141|      </div>
142|
143|      <!-- ==================== AMBASSADEURS ==================== -->
144|      <div v-if="activeTab === 'ambassadors'" class="tab-content">
145|        <div class="tab-header"><h2>Ambassadeurs</h2><button class="btn-primary-sm" @click="showAmbForm = true">+ Nouveau code</button></div>
146|        <p class="tab-desc">Codes promo associés à des ambassadeurs pour le suivi des recommandations.</p>
147|        <div v-if="ambLoading" class="loading">Chargement…</div>
148|        <table v-else class="admin-table">
149|          <thead><tr><th>Code</th><th>Remise</th><th>Ambassadeur</th><th>Contact</th><th>Utilisations</th><th>Points</th></tr></thead>
150|          <tbody>
151|            <tr v-for="c in ambCodes" :key="c.id">
152|              <td><strong>{{ c.code }}</strong></td>
153|              <td>{{ c.discount_type === 'percent' ? c.discount_value + '%' : c.discount_value + '€' }}</td>
154|              <td>{{ c.ambassador_name || '—' }}</td>
155|              <td>{{ c.ambassador_contact || '—' }}</td>
156|              <td>{{ c.max_uses ? c.redemption_count + '/' + c.max_uses : c.redemption_count }}</td>
157|              <td>{{ c.points_balance || 0 }}</td>
158|            </tr>
159|          </tbody>
160|        </table>
161|      </div>
162|
163|      <!-- Demandes Vendeurs -->
164|      <div v-if="activeTab === 'sellers'" class="tab-content">
165|        <div class="tab-header"><h2>Demandes vendeurs</h2><span v-if="sellerRequests.length" class="tab-badge">{{ sellerRequests.length }} en attente</span></div>
166|        <div class="table-wrap">
167|          <table v-if="sellerRequests.length" class="admin-table">
168|            <thead><tr><th>Email</th><th>Boutique</th><th>Description</th><th>Discord</th><th>Date</th><th>Actions</th></tr></thead>
169|            <tbody>
170|              <tr v-for="r in sellerRequests" :key="r.id">
171|                <td><strong>{{ r.displayName || r.email }}</strong></td>
172|                <td>{{ r.shopName || '—' }}</td>
173|                <td><span class="desc-preview" :title="r.sellerDescription">{{ r.sellerDescription?.substring(0, 60) || '—' }}{{ r.sellerDescription?.length > 60 ? '…' : '' }}</span></td>
174|                <td>{{ r.discordTag || '—' }}</td>
175|                <td>{{ new Date(r.createdAt).toLocaleDateString('fr-FR') }}</td>
176|                <td class="actions">
177|                  <button class="btn-action" title="Approuver" @click="approveSeller(r.id)"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6ee7b7" stroke-width="2"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg></button>
178|                  <button class="btn-action danger" title="Refuser" @click="rejectSeller(r.id)"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f87171" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
179|                </td>
180|              </tr>
181|            </tbody>
182|          </table>
183|          <div v-else class="empty-tab">Aucune demande en attente.</div>
184|        </div>
185|      </div>
186|
187|    </main>
188|  </div>
189|  <ToastNotif ref="toastRef" />
190|  <ConfirmModal ref="confirmRef" />
191|
192|  <!-- Name prompt for featured -->
193|  <div v-if="featPrompt.show" ref="featOverlay" class="modal-overlay" @click.self="cancelFeat">
194|    <div ref="featCard" class="prompt-card">
195|      <div class="modal-header"><h3>Ajouter</h3></div>
196|      <div class="modal-body">
197|        <div class="field"><label>Nom</label><input v-model="featPrompt.name" @keyup.enter="confirmFeatName" type="text" placeholder="Nom de la personne" /></div>
198|      </div>
199|      <div class="modal-actions">
200|        <button class="btn-cancel" @click="cancelFeat">Annuler</button>
201|        <button class="btn-primary" @click="confirmFeatName">Continuer</button>
202|      </div>
203|    </div>
204|  </div>
205|
206|  <!-- Product form modal -->
207|  <div v-if="showProductForm" ref="prodOverlay" class="modal-overlay" @click.self="closeProductForm">
208|    <div ref="prodCard" class="form-modal">
209|      <div class="modal-header"><h3>Créer un produit</h3><button class="modal-close" @click="closeProductForm"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button></div>
210|      <div class="modal-body form-body">
211|        <div class="field"><label>Titre</label><input v-model="productForm.title" type="text" placeholder="Pack Bâtiments..." /></div>
212|        <div class="field"><label>Description courte</label><input v-model="productForm.shortDescription" type="text" placeholder="Courte description..." /></div>
213|        <div class="field"><label>Description longue</label><textarea v-model="productForm.description" rows="4" placeholder="Description détaillée..."></textarea></div>
214|        <div class="field"><label>Installation</label><textarea v-model="productForm.installation" rows="3" placeholder="Instructions d'installation..."></textarea></div>
215|        <div class="form-row">
216|          <div class="field"><label>Catégorie</label><select v-model="productForm.categorySlug"><option value="" disabled>Sélectionner</option><option v-for="c in categories" :key="c.slug" :value="c.slug">{{ c.name }}</option></select></div>
217|          <div class="field"><label>Vendeur</label><select v-model="productForm.sellerSlug"><option value="" disabled>Sélectionner</option><option v-for="s in sellers" :key="s.slug" :value="s.slug">{{ s.username }}</option></select></div>
218|        </div>
219|        <div class="form-row">
220|          <div class="field"><label>Prix (€)</label><input v-model="productForm.price" type="number" step="0.01" min="0" /></div>
221|          <div class="field"><label>Remise (%)</label><input v-model="productForm.discountPercent" type="number" min="0" max="100" /></div>
222|        </div>
223|        <div class="field">
224|          <label>Image du produit (Thumbnail)</label>
225|          <div v-if="!uploadThumb" class="thumb-zone" @click="thumbInput?.click()" @dragover.prevent @drop.prevent="handleThumbUpload">
226|            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
227|            <span>Cliquez ou glissez une image ici</span>
228|            <small>PNG, JPG (Max 2 Mo)</small>
229|          </div>
230|          <div v-else class="thumb-preview">
231|            <img :src="uploadThumb" alt="Preview" />
232|            <button class="thumb-remove" @click="removeThumb"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
233|          </div>
234|          <input ref="thumbInput" type="file" accept="image/png,image/jpeg" style="display:none" @change="handleThumbUpload" />
235|        </div>
236|        <div class="field"><label>Tags</label><input v-model="productForm.tags" type="text" placeholder="tag1, tag2, tag3" /><small style="font-size:.75rem;color:var(--text-muted);margin-top:-4px;">Séparés par des virgules</small></div>
237|
238|        <!-- Product file upload -->
239|        <div class="field">
240|          <label>Fichier du produit (zip, pour téléchargement)</label>
241|          <div v-if="!uploadFile" class="file-zone" @click="fileInput?.click()" @dragover.prevent @drop.prevent="handleFileUpload">
242|            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><polyline points="9 15 12 12 15 15"/></svg>
243|            <span>Glissez votre fichier zip ici</span>
244|            <small v-if="uploadFileName">{{ uploadFileName }}</small>
245|            <small v-else>Max 2 Go</small>
246|          </div>
247|          <div v-else class="file-preview">
248|            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--green)" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><polyline points="9 15 12 12 15 15"/></svg>
249|            <span class="file-name">{{ uploadFileName }}</span>
250|            <span class="file-size">{{ formatSize(uploadFileSize) }}</span>
251|            <button class="file-remove" @click="removeFile"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
252|          </div>
253|          <input ref="fileInput" type="file" accept=".zip,.rar,.7z" style="display:none" @change="handleFileUpload" />
254|        </div>
255|        <label class="checkbox-row"><input type="checkbox" v-model="productForm.isHidden" /><span>Cacher ce produit sur le catalogue (Visible uniquement par l'admin)</span></label>
256|      </div>
257|      <div class="modal-actions">
258|        <button class="btn-ghost" @click="closeProductForm">Annuler</button>
259|        <button class="btn-primary" @click="saveProduct">Créer le produit</button>
260|      </div>
261|    </div>
262|  </div>
263|
264|  <!-- Ambassador form modal -->
265|  <div v-if="showAmbForm" ref="ambOverlay" class="modal-overlay" @click.self="showAmbForm = false">
266|    <div ref="ambCard" class="form-modal" style="max-width:480px">
267|      <div class="modal-header"><h3>Nouveau code ambassadeur</h3><button class="modal-close" @click="showAmbForm = false"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button></div>
268|      <div class="modal-body form-body">
269|        <div class="field"><label>Code <small>(optionnel)</small></label><input v-model="ambForm.code" type="text" placeholder="ex: AMI20" /></div>
270|        <div class="field"><label>Nom de l'ambassadeur *</label><input v-model="ambForm.name" type="text" placeholder="Jean Dupont" required /></div>
271|        <div class="field"><label>Contact</label><input v-model="ambForm.contact" type="text" placeholder="Discord, email..." /></div>
272|        <div class="form-row">
273|          <div class="field" style="flex:1"><label>Type</label><select v-model="ambForm.discountType"><option value="percent">Pourcentage</option><option value="fixed">Montant fixe</option></select></div>
274|          <div class="field" style="flex:1"><label>Valeur</label><input v-model.number="ambForm.discountValue" type="number" min="1" :max="ambForm.discountType === 'percent' ? 100 : 999" placeholder="20" /></div>
275|        </div>
276|        <div class="form-row">
277|          <div class="field" style="flex:1"><label>Utilisations max</label><input v-model.number="ambForm.maxUses" type="number" min="0" placeholder="Illimité" /></div>
278|          <div class="field" style="flex:1"><label>Points par utilisation</label><input v-model.number="ambForm.points" type="number" min="1" placeholder="1" /></div>
279|        </div>
280|        <div class="field"><label>Note / Récompense</label><input v-model="ambForm.reward" type="text" placeholder="Ex: 1 mois de commission à 20%" /></div>
281|      </div>
282|      <div class="modal-actions">
283|        <button class="btn-ghost" @click="showAmbForm = false">Annuler</button>
284|        <button class="btn-primary" :disabled="ambSaving" @click="saveAmbCode">{{ ambSaving ? 'Création…' : 'Créer le code' }}</button>
285|      </div>
286|    </div>
287|  </div>
288|</template>
289|
290|<script setup lang="ts">
291|definePageMeta({ layout: 'auth' })
292|const { user, logout } = useAuth()
293|const config = useRuntimeConfig()
294|const api = config.public.apiOrigin
295|
296|// Redirect if not admin
297|if (user.value?.role !== 'admin') navigateTo('/')
298|
299|const activeTab = ref('products')
300|const tabs = [
301|  { id:'products', label:'Produits', icon:'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>' },
302|  { id:'users', label:'Utilisateurs', icon:'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>' },
303|  { id:'featured', label:'Mise en avant', icon:'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>' },
304|  { id:'pages', label:'Pages', icon:'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>' },
305|  { id:'ambassadors', label:'Ambassadeurs', icon:'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>' },
306|  { id:'sellers', label:'Vendeurs', icon:'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>' },
307|]
308|
309|// ─── Ambassadors ──────────────────────────────────────
310|const ambCodes = ref<any[]>([])
311|const ambLoading = ref(false)
312|const showAmbForm = ref(false)
313|const ambSaving = ref(false)
314|const ambForm = reactive({
315|  code: '', name: '', contact: '', discountType: 'percent', discountValue: 0, maxUses: 0, points: 1, reward: ''
316|})
317|
318|async function loadAmbCodes() {
319|  ambLoading.value = true
320|  try {
321|    const res = await $fetch(api + '/api/admin/promo-codes')
322|    ambCodes.value = res.codes || res || []
323|  } catch { ambCodes.value = [] }
324|  finally { ambLoading.value = false }
325|}
326|
327|async function saveAmbCode() {
328|  if (!ambForm.name || ambForm.discountValue <= 0) return
329|  ambSaving.value = true
330|  try {
331|    await $fetch(api + '/api/admin/promo-codes', {
332|      method: 'POST',
333|      body: {
334|        code: ambForm.code.trim() || undefined,
335|        ambassadorName: ambForm.name.trim(),
336|        ambassadorContact: ambForm.contact.trim(),
337|        discountType: ambForm.discountType,
338|        discountValue: ambForm.discountValue,
339|        maxRedemptions: ambForm.maxUses > 0 ? ambForm.maxUses : null,
340|        pointsPerRedemption: ambForm.points,
341|        rewardNote: ambForm.reward.trim()
342|      }
343|    })
344|    showAmbForm.value = false
345|    toastRef.value?.show('success', 'Code ambassadeur créé')
346|    loadAmbCodes()
347|    Object.assign(ambForm, { code: '', name: '', contact: '', discountType: 'percent', discountValue: 0, maxUses: 0, points: 1, reward: '' })
348|  } catch (e: any) {
349|    toastRef.value?.show('error', e?.data?.message || 'Erreur')
350|  }
351|  finally { ambSaving.value = false }
352|}
353|
354|// ─── Products ──────────────────────────────────────────
355|const products = ref<any[]>([])
356|const sellerRequests = ref<any[]>([])
357|const showProductForm = ref(false)
358|const categories = ref<{slug:string;name:string}[]>([])
359|const sellers = ref<{slug:string;username:string}[]>([])
360|
361|const productForm = reactive({
362|  title:'', shortDescription:'', description:'', installation:'',
363|  categorySlug:'', sellerSlug:'', price:0, discountPercent:0,
364|  tags:'', thumbnail:'', isHidden:false
365|})
366|
367|const toastRef = ref<InstanceType<typeof ToastNotif> | null>(null)
368|const confirmRef = ref<InstanceType<typeof ConfirmModal> | null>(null)
369|const prodOverlay = ref<HTMLElement | null>(null)
370|const prodCard = ref<HTMLElement | null>(null)
371|
372|async function animateProdIn() {
373|  if (!prodOverlay.value || !prodCard.value) return
374|  let gsap: any
375|  try { const mod = await import('gsap'); gsap = mod.default } catch { return }
376|  gsap.set(prodOverlay.value, { opacity: 0 }); gsap.set(prodCard.value, { opacity: 0, scale: .92, y: 15 })
377|  gsap.to(prodOverlay.value, { opacity: 1, duration: .2, ease: 'power2.out' })
378|  gsap.to(prodCard.value, { opacity: 1, scale: 1, y: 0, duration: .3, ease: 'back.out(1.6)', delay: .05 })
379|}
380|function openProductForm() {
381|  Object.assign(productForm, { title:'', shortDescription:'', description:'', installation:'', categorySlug:'', sellerSlug:'', price:0, discountPercent:0, tags:'', thumbnail:'', isHidden:false })
382|  uploadThumb.value = ''; removeFile()
383|  showProductForm.value = true
384|  nextTick(() => animateProdIn())
385|}
386|function closeProductForm() { showProductForm.value = false }
387|
388|const uploadThumb = ref('')
389|const thumbInput = ref<HTMLInputElement | null>(null)
390|function handleThumbUpload(e: any) {
391|  const file = e.target?.files?.[0] || e.dataTransfer?.files?.[0]
392|  if (!file) return
393|  if (file.size > 2*1024*1024) return toastRef.value?.show('error', 'Max 2 Mo')
394|  const reader = new FileReader()
395|  reader.onload = () => {
396|    uploadThumb.value = reader.result as string
397|    productForm.thumbnail = reader.result as string
398|  }
399|  reader.readAsDataURL(file)
400|}
401|function removeThumb() { uploadThumb.value = ''; productForm.thumbnail = '' }
402|
403|// ─── Product File Upload ──────────────────────────────
404|const uploadFile = ref<File | null>(null)
405|const uploadFileName = ref('')
406|const uploadFileSize = ref(0)
407|const fileInput = ref<HTMLInputElement | null>(null)
408|function handleFileUpload(e: any) {
409|  const file = e.target?.files?.[0] || e.dataTransfer?.files?.[0]
410|  if (!file) return
411|  uploadFile.value = file
412|  uploadFileName.value = file.name
413|  uploadFileSize.value = file.size
414|}
415|function removeFile() {
416|  uploadFile.value = null
417|  uploadFileName.value = ''
418|  uploadFileSize.value = 0
419|}
420|function formatSize(bytes: number) {
421|  if (!bytes) return ''
422|  if (bytes < 1024) return bytes + ' o'
423|  if (bytes < 1024*1024) return (bytes/1024).toFixed(1) + ' Ko'
424|  if (bytes < 1024*1024*1024) return (bytes/(1024*1024)).toFixed(1) + ' Mo'
425|  return (bytes/(1024*1024*1024)).toFixed(2) + ' Go'
426|}
427|
428|async function saveProduct() {
429|  if (!productForm.title || !productForm.price) return toastRef.value?.show('error', 'Titre et prix requis')
430|  try {
431|    const res = await $fetch(api + '/api/admin/products', { method:'POST', body: {
432|      ...productForm,
433|      tags: productForm.tags.split(',').map((t:string) => t.trim()).filter(Boolean)
434|    }})
435|
436|    // Upload fichier produit vers R2 si un fichier a été sélectionné
437|    const productId = res?.id || res?.productId
438|    if (uploadFile.value && productId) {
439|      const reader = new FileReader()
440|      const base64 = await new Promise<string>((resolve, reject) => {
441|        reader.onload = () => {
442|          const dataUrl = reader.result as string
443|          resolve(dataUrl.split(',')[1]) // Remove data:...;base64, prefix
444|        }
445|        reader.onerror = reject
446|        reader.readAsDataURL(uploadFile.value)
447|      })
448|
449|      await $fetch(api + '/api/admin/products/' + productId + '/upload', {
450|        method: 'POST',
451|        body: {
452|          filename: uploadFileName.value,
453|          data_base64: base64
454|        }
455|      })
456|    }
457|
458|    showProductForm.value = false; loadProducts()
459|    toastRef.value?.show('success', 'Produit créé' + (uploadFile.value ? ' + fichier uploadé' : ''))
460|  } catch (e: any) {
461|    toastRef.value?.show('error', e?.data?.message || e?.message || 'Erreur')
462|  }
463|}
464|
465|async function loadFormData() {
466|  try {
467|    const b = await $fetch(api + '/api/bootstrap')
468|    categories.value = b.categories || []
469|    sellers.value = b.collaborators?.map((n:string) => ({ slug: n.toLowerCase().replace(/\s+/g,'-'), username: n })) || []
470|  } catch {}
471|}
472|
473|async function loadProducts() {
474|  try {
475|    const res = await $fetch(api + '/api/products?limit=100')
476|    products.value = res.items || res.products || res
477|  } catch { products.value = [] }
478|}
479|async function deleteProduct(id: number) {
480|  const ok = await confirmRef.value?.ask({ title:'Supprimer le produit', message:'Cette action est irréversible.', confirmText:'Supprimer', danger:true })
481|  if (!ok) return
482|  try { await $fetch(api + '/api/admin/products/' + id, { method: 'DELETE' , credentials: 'include' }); loadProducts(); toastRef.value?.show('success', 'Produit supprimé') }
483|  catch { toastRef.value?.show('error', 'Impossible de supprimer le produit') }
484|}
485|
486|// ─── Users ─────────────────────────────────────────────
487|const users = ref<any[]>([])
488|async function loadUsers() {
489|  try {
490|    const res = await $fetch(api + '/api/admin/users')
491|    users.value = res.users || res
492|  } catch { users.value = [] }
493|}
494|
495|// ─── Seller Requests ────────────────────────────────────
496|async function loadSellerRequests() {
497|  try {
498|    const res = await $fetch(api + '/api/admin/seller-requests')
499|    sellerRequests.value = res.items || []
500|  } catch { sellerRequests.value = [] }
501|