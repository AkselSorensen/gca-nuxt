<template>
  <div class="admin-page">
    <aside class="admin-sidebar">
      <div class="sidebar-brand">
        <NuxtLink to="/" class="brand-icon">G</NuxtLink>
        <h1>Dashboard</h1>
        <span class="badge">Admin</span>
      </div>
      <nav class="sidebar-nav">
        <button v-for="t in tabs" :key="t.id" class="nav-btn" :class="{ active: activeTab === t.id }" @click="activeTab = t.id">
          <span v-html="t.icon"></span>
          {{ t.label }}
        </button>
      </nav>
      <div class="sidebar-footer">
        <NuxtLink to="/" class="back-link">Retour au site</NuxtLink>
        <button @click="logout" class="btn-logout">Déconnexion</button>
      </div>
    </aside>
    <main class="admin-main">

      <!-- ==================== PRODUITS ==================== -->
      <div v-if="activeTab === 'products'" class="tab-content">
        <div class="tab-header"><h2>Produits</h2><button class="btn-primary" @click="openProductForm">+ Ajouter un produit</button></div>
        <div class="table-wrap">
          <table v-if="products.length" class="admin-table">
            <thead><tr><th>Image</th><th>Titre</th><th>Catégorie</th><th>Prix</th><th>Ventes</th><th>Actions</th></tr></thead>
            <tbody>
              <tr v-for="p in products" :key="p.id">
                <td><img :src="p.thumbnail || p.media?.[0]?.thumbnail || p.media?.[0]?.url || ''" class="thumb" /></td>
                <td><strong>{{ p.title }}</strong></td>
                <td><span class="badge-cat">{{ p.category || p.categoryName || '—' }}</span></td>
                <td class="price-cell">{{ Number(p.price).toFixed(2) }}€</td>
                <td>{{ p.sales || 0 }}</td>
                <td class="actions">
                  <button class="btn-action" title="Modifier" @click="editProduct(p)"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>
                  <button class="btn-action danger" title="Supprimer" @click="deleteProduct(p.id)"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg></button>
                </td>
              </tr>
            </tbody>
          </table>
          <div v-else class="empty-tab">Aucun produit.</div>
        </div>
      </div>

      <!-- ==================== UTILISATEURS ==================== -->
      <div v-if="activeTab === 'users'" class="tab-content">
        <div class="tab-header">
          <h2>Utilisateurs</h2>
          <div class="tab-actions">
            <input v-model="userSearch" type="text" class="user-search" placeholder="Rechercher (nom, email)…" />
            <select v-model="userRoleFilter" class="rev-filter">
              <option value="all">Tous les rôles</option>
              <option value="seller">Vendeurs</option>
              <option value="customer">Clients</option>
              <option value="admin">Admins</option>
            </select>
          </div>
        </div>
        <div class="table-wrap">
          <table v-if="filteredUsers.length" class="admin-table">
            <thead><tr><th>ID</th><th>Nom</th><th>Email</th><th>Rôle</th><th>Commission</th><th>Date</th></tr></thead>
            <tbody>
              <tr v-for="u in filteredUsers" :key="u.id">
                <td>{{ u.id }}</td>
                <td><strong>{{ u.displayName || u.username }}</strong></td>
                <td>{{ u.email }}</td>
                <td><span class="role-badge" :class="u.role">{{ u.role }}</span></td>
                <td>
                  <template v-if="u.role === 'seller' || u.role === 'admin'">
                    <div class="comm-edit">
                      <input type="number" min="0" max="100" step="0.5" v-model.number="u.commissionPercent" @keyup.enter="saveCommission(u)" />
                      <span class="comm-pct">%</span>
                      <button class="btn-action" title="Enregistrer la commission" @click="saveCommission(u)">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
                      </button>
                    </div>
                  </template>
                  <span v-else class="muted">—</span>
                </td>
                <td>{{ u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—' }}</td>
              </tr>
            </tbody>
          </table>
          <div v-else class="empty-tab">{{ users.length ? 'Aucun utilisateur ne correspond au filtre.' : 'Aucun utilisateur.' }}</div>
        </div>
      </div>

      <!-- ==================== MISE EN AVANT ==================== -->
      <div v-if="activeTab === 'featured'" class="tab-content">
        <div class="tab-header"><h2>Mise en avant</h2></div>
        <p class="tab-desc">Gérez les bannières affichées sur la page d'accueil, photos uniquement, sans texte ni produit.</p>
        
        <div class="featured-groups">
          <!-- Collaborateur -->
          <div class="group-card">
            <div class="group-header"><h3>Collaborateur</h3></div>
            <div class="group-grid">
              <div v-for="(item, i) in featuredCollab" :key="i" class="fitem">
                <div class="fpreview" v-if="item.image"><img :src="item.image" alt="" /></div>
                <div class="fnopreview" v-else><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg><span>Ajouter une image</span></div>
                <div class="fname">{{ item.name || 'Sans nom' }}</div>
                <button class="fremove" @click="removeFeat('collab', i)"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
              </div>
              <div class="fadd" @click="addFeat('collab')">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                <span>Ajouter</span>
              </div>
            </div>
          </div>

          <!-- Communauté -->
          <div class="group-card">
            <div class="group-header"><h3>Communauté</h3></div>
            <div class="group-grid">
              <div v-for="(item, i) in featuredComm" :key="i" class="fitem">
                <div class="fpreview" v-if="item.image"><img :src="item.image" alt="" /></div>
                <div class="fnopreview" v-else><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg><span>Ajouter une image</span></div>
                <div class="fname">{{ item.name || 'Sans nom' }}</div>
                <button class="fremove" @click="removeFeat('comm', i)"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
              </div>
              <div class="fadd" @click="addFeat('comm')">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                <span>Ajouter</span>
              </div>
            </div>
          </div>
        </div>

        <button class="btn-primary" :disabled="savingFeatured" @click="saveFeatured">
          <span v-if="savingFeatured" class="spinner"></span>
          {{ savingFeatured ? 'Enregistrement…' : 'Enregistrer la mise en avant' }}
        </button>
      </div>

      <!-- ==================== PAGES / CONFIG ==================== -->
      <div v-if="activeTab === 'pages'" class="tab-content">
        <div class="tab-header"><h2>Configuration des pages</h2></div>
        <div class="page-editors">
          <div v-for="page in editablePages" :key="page.key" class="editor-card">
            <div class="editor-header">
              <h3>{{ page.label }}</h3>
              <div class="editor-actions">
                <button class="btn-ghost btn-sm" @click="page.showPreview = !page.showPreview">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  {{ page.showPreview ? 'Masquer' : 'Aperçu' }}
                </button>
                <button class="btn-primary btn-sm" :disabled="page.saving" @click="savePage(page)">
                  <span v-if="page.saving" class="spinner" style="width:14px;height:14px;border-width:2px;"></span>
                  <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
                  {{ page.saving ? 'Sauvegarde…' : 'Enregistrer' }}
                </button>
                <span v-if="page.saved" class="saved-msg">Enregistré ✓</span>
              </div>
            </div>
            <div class="editor-layout" v-if="!page.showPreview">
              <textarea v-model="page.raw" rows="16" class="editor-textarea" placeholder="Données JSON…"></textarea>
            </div>
            <div v-else class="preview-wrap">
              <div class="preview-json">{{ page.raw }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- ==================== AMBASSADEURS ==================== -->
      <div v-if="activeTab === 'ambassadors'" class="tab-content">
        <div class="tab-header">
          <h2>Ambassadeurs</h2>
          <div class="tab-actions">
            <button class="admin-btn" @click="showAmbForm = true">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Nouveau code
            </button>
          </div>
        </div>
        <p class="tab-desc">Codes promo associés à des ambassadeurs pour le suivi des recommandations.</p>
        <div v-if="ambLoading" class="loading">Chargement…</div>
        <table v-else class="admin-table">
          <thead><tr><th>Code</th><th>Remise</th><th>Ambassadeur</th><th>Contact</th><th>Utilisations</th><th>Points</th></tr></thead>
          <tbody>
            <tr v-for="c in ambCodes" :key="c.id">
              <td><strong>{{ c.code }}</strong></td>
              <td>{{ c.discount_type === 'percent' ? c.discount_value + '%' : c.discount_value + '€' }}</td>
              <td>{{ c.ambassador_name || '—' }}</td>
              <td>{{ c.ambassador_contact || '—' }}</td>
              <td>{{ c.max_uses ? c.redemption_count + '/' + c.max_uses : c.redemption_count }}</td>
              <td>{{ c.points_balance || 0 }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Demandes Vendeurs -->
      <div v-if="activeTab === 'sellers'" class="tab-content">
        <div class="tab-header">
          <h2>Demandes vendeurs</h2>
          <div class="tab-actions">
            <span v-if="sellerRequests.length" class="tab-badge">{{ sellerRequests.length }} en attente</span>
            <button class="admin-btn-icon" @click="loadSellerRequests" title="Rafraîchir">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
            </button>
          </div>
        </div>
        <div class="table-wrap">
          <table v-if="sellerRequests.length" class="admin-table">
            <thead><tr><th>Email</th><th>Boutique</th><th>Description</th><th>Discord</th><th>Date</th><th>Actions</th></tr></thead>
            <tbody>
              <tr v-for="r in sellerRequests" :key="r.id">
                <td><strong>{{ r.displayName || r.email }}</strong></td>
                <td>{{ r.shopName || '—' }}</td>
                <td><span class="desc-preview" :title="r.sellerDescription">{{ r.sellerDescription?.substring(0, 60) || '—' }}{{ r.sellerDescription?.length > 60 ? '…' : '' }}</span></td>
                <td>{{ r.discordTag || '—' }}</td>
                <td>{{ new Date(r.createdAt).toLocaleDateString('fr-FR') }}</td>
                <td class="actions">
                  <button class="btn-action" title="Approuver" @click="approveSeller(r.id)"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6ee7b7" stroke-width="2"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg></button>
                  <button class="btn-action danger" title="Refuser" @click="rejectSeller(r.id)"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f87171" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
                </td>
              </tr>
            </tbody>
          </table>
          <div v-else class="empty-tab">Aucune demande en attente.</div>
        </div>
      </div>

      <!-- ==================== TAGS ==================== -->
      <div v-if="activeTab === 'tags'" class="tab-content">
        <div class="tab-header">
          <h2>Tags</h2>
          <div class="tab-actions">
            <input v-model="newTagName" placeholder="Nouveau tag…" class="tag-add-input" @keyup.enter="addTag" />
            <button class="btn-primary" @click="addTag">+ Ajouter</button>
          </div>
        </div>
        <div class="table-wrap">
          <table v-if="tagList.length" class="admin-table">
            <thead><tr><th>Nom</th><th>Actions</th></tr></thead>
            <tbody>
              <tr v-for="tg in tagList" :key="tg.id">
                <td>
                  <template v-if="editingTagId === tg.id">
                    <input v-model="editTagName" class="tag-add-input" style="max-width:220px" @keyup.enter="saveTagRename(tg)" @keyup.esc="editingTagId = null" />
                  </template>
                  <template v-else><span class="tag-badge">#{{ tg.name }}</span></template>
                </td>
                <td class="actions">
                  <button class="btn-action" title="Renommer" @click="startTagRename(tg)"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>
                  <button class="btn-action danger" title="Supprimer" @click="deleteTag(tg)"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f87171" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg></button>
                </td>
              </tr>
            </tbody>
          </table>
          <div v-else class="empty-tab">Aucun tag. Créez votre premier tag.</div>
        </div>
      </div>

      <!-- ==================== REVENUS ==================== -->
      <div v-if="activeTab === 'revenue'" class="tab-content">
        <div class="tab-header">
          <h2>Revenus</h2>
          <div class="tab-actions">
            <span v-if="revenue" class="rev-mode-badge" :class="revenue.stripeMode === 'LIVE' ? 'live' : 'test'">
              {{ revenue.stripeMode === 'LIVE' ? '● LIVE' : '● TEST' }}
            </span>
            <select v-if="revenue?.sellersList?.length" v-model="sellerFilter" class="rev-filter">
              <option value="all">Tous les vendeurs</option>
              <option v-for="s in revenue.sellersList" :key="s.id" :value="s.id">
                {{ s.name }} ({{ s.commissionPercent }}%)
              </option>
            </select>
            <button class="admin-btn-icon" @click="loadRevenue" title="Rafraîchir">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
            </button>
          </div>
        </div>

        <div v-if="revenueLoading" class="rev-loading">Chargement des revenus…</div>

        <template v-else-if="revenue">
          <!-- Infos compte -->
          <div class="rev-account">
            <span class="rev-account-id">{{ revenue.accountId || '—' }}</span>
            <span v-if="revenue.accountEmail" class="rev-account-email">{{ revenue.accountEmail }}</span>
          </div>

          <!-- Cartes stats -->
          <div class="rev-cards">
            <div class="rev-card">
              <span class="rev-card-label">Solde disponible</span>
              <strong class="rev-card-val">{{ fmtMoney(revenue.balance?.available?.[0]?.amount) }}</strong>
              <span class="rev-card-sub">{{ revenue.balance?.available?.[0]?.currency?.toUpperCase() || 'EUR' }}</span>
            </div>
            <div class="rev-card">
              <span class="rev-card-label">En attente</span>
              <strong class="rev-card-val muted">{{ fmtMoney(revenue.balance?.pending?.[0]?.amount) }}</strong>
              <span class="rev-card-sub">pending</span>
            </div>
            <div class="rev-card">
              <span class="rev-card-label">Encaissé (charges)</span>
              <strong class="rev-card-val">{{ fmtMoney(revenue.stats?.chargesTotal) }}</strong>
              <span class="rev-card-sub">total payé par les clients</span>
            </div>
            <div class="rev-card">
              <span class="rev-card-label">Transféré aux vendeurs</span>
              <strong class="rev-card-val">{{ fmtMoney(revenue.stats?.transfersTotal) }}</strong>
              <span class="rev-card-sub">75% part vendeur</span>
            </div>
            <div class="rev-card highlight">
              <span class="rev-card-label">Net plateforme</span>
              <strong class="rev-card-val">{{ fmtMoney(revenue.stats?.netTotal) }}</strong>
              <span class="rev-card-sub">= encaissé − reversé aux vendeurs (commission)</span>
            </div>
          </div>

          <!-- Commandes DB -->
          <h3 class="rev-section-title">Commandes (base de données)</h3>
          <div class="table-wrap">
            <table v-if="filteredOrders.length" class="admin-table">
              <thead><tr><th>#</th><th>Date</th><th>Client</th><th>Vendeur(s)</th><th>Total payé</th><th>Part vendeur</th><th>Commission plateforme</th></tr></thead>
              <tbody>
                <tr v-for="o in filteredOrders" :key="o.id">
                  <td>{{ o.id }}</td>
                  <td>{{ new Date(o.createdAt).toLocaleDateString('fr-FR') }} {{ new Date(o.createdAt).toLocaleTimeString('fr-FR', {hour:'2-digit',minute:'2-digit'}) }}</td>
                  <td>
                    <div v-if="o.buyerName || o.buyerEmail" class="buyer-cell">
                      <span v-if="o.buyerName" class="buyer-name">{{ o.buyerName }}</span>
                      <span v-if="o.buyerEmail" class="buyer-email">{{ o.buyerEmail }}</span>
                    </div>
                    <span v-else class="muted">—</span>
                  </td>
                  <td><span v-if="o.sellers" class="seller-cell">{{ o.sellers }}</span><span v-else class="muted">—</span></td>
                  <td class="price-cell">{{ fmtMoney(o.total) }}</td>
                  <td>{{ fmtMoney(o.sellerNet) }}</td>
                  <td class="price-cell">{{ fmtMoney(o.platformFee) }}</td>
                </tr>
              </tbody>
            </table>
            <div v-else class="empty-tab">{{ sellerFilter === 'all' ? 'Aucune commande enregistrée.' : 'Aucune commande pour ce vendeur.' }}</div>
          </div>

          <!-- Paiements Stripe -->
          <h3 class="rev-section-title">Paiements Stripe (charges)</h3>
          <div class="table-wrap">
            <table v-if="filteredCharges.length" class="admin-table">
              <thead><tr><th>ID</th><th>Date</th><th>Client</th><th>Vendeur</th><th>Montant</th><th>Statut</th></tr></thead>
              <tbody>
                <tr v-for="c in filteredCharges" :key="c.id">
                  <td class="mono">{{ c.id }}</td>
                  <td>{{ new Date(c.created).toLocaleDateString('fr-FR') }} {{ new Date(c.created).toLocaleTimeString('fr-FR', {hour:'2-digit',minute:'2-digit'}) }}</td>
                  <td>{{ c.email || '—' }}</td>
                  <td>
                    <span v-if="c.sellerName" class="seller-cell">{{ c.sellerName }}<template v-if="c.sellerPercent"> ({{ c.sellerPercent }}%)</template></span>
                    <span v-else-if="c.transferDestination" class="mono muted">{{ c.transferDestination }}</span>
                    <span v-else class="muted">—</span>
                  </td>
                  <td class="price-cell">{{ fmtMoney(c.amount) }} {{ c.currency?.toUpperCase() }}</td>
                  <td><span class="rev-status" :class="c.status">{{ c.status }}</span></td>
                </tr>
              </tbody>
            </table>
            <div v-else class="empty-tab">{{ sellerFilter === 'all' ? 'Aucun paiement Stripe trouvé (mode test : utilise la carte 4000 0000 0000 0077).' : 'Aucun paiement pour ce vendeur.' }}</div>
          </div>

          <!-- Transferts vendeurs -->
          <h3 class="rev-section-title">Transferts vendeurs</h3>
          <div class="table-wrap">
            <table v-if="revenue.transfers?.length" class="admin-table">
              <thead><tr><th>ID</th><th>Date</th><th>Destination</th><th>Montant</th><th>Statut</th></tr></thead>
              <tbody>
                <tr v-for="t in revenue.transfers" :key="t.id">
                  <td class="mono">{{ t.id }}</td>
                  <td>{{ new Date(t.created).toLocaleDateString('fr-FR') }} {{ new Date(t.created).toLocaleTimeString('fr-FR', {hour:'2-digit',minute:'2-digit'}) }}</td>
                  <td class="mono">{{ t.destination }}</td>
                  <td class="price-cell">{{ fmtMoney(t.amount) }} {{ t.currency?.toUpperCase() }}</td>
                  <td><span class="rev-status" :class="t.status">{{ t.status }}</span></td>
                </tr>
              </tbody>
            </table>
            <div v-else class="empty-tab">Aucun transfert.</div>
          </div>
        </template>

        <div v-else class="rev-loading error">Impossible de charger les revenus.</div>
      </div>

    </main>
  </div>
  <ToastNotif ref="toastRef" />
  <ConfirmModal ref="confirmRef" />

  <!-- Name prompt for featured -->
  <div v-if="featPrompt.show" ref="featOverlay" class="modal-overlay" @click.self="cancelFeat">
    <div ref="featCard" class="prompt-card">
      <div class="modal-header"><h3>Ajouter</h3></div>
      <div class="modal-body">
        <div class="field"><label>Nom</label><input v-model="featPrompt.name" @keyup.enter="confirmFeatName" type="text" placeholder="Nom de la personne" /></div>
      </div>
      <div class="modal-actions">
        <button class="btn-cancel" @click="cancelFeat">Annuler</button>
        <button class="btn-primary" @click="confirmFeatName">Continuer</button>
      </div>
    </div>
  </div>

  <!-- Product form modal -->
  <div v-if="showProductForm" ref="prodOverlay" class="modal-overlay" @click.self="closeProductForm">
    <div ref="prodCard" class="form-modal form-modal-lg">
      <div class="modal-header"><h3>{{ editingId ? 'Modifier le produit' : 'Créer un produit' }}</h3><button class="modal-close" @click="closeProductForm"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button></div>
      <div class="modal-body form-body">
        <div class="form-grid-2">
          <div class="form-left">
            <div class="field"><label>Titre</label><input v-model="productForm.title" type="text" placeholder="Pack Bâtiments..." /></div>
            <div class="field"><label>Description courte</label><input v-model="productForm.shortDescription" type="text" placeholder="Courte description..." /></div>
            <div class="field"><label>Description longue</label><textarea v-model="productForm.description" rows="5" placeholder="Description détaillée du produit..."></textarea></div>
            <div class="field"><label>Installation</label><textarea v-model="productForm.installation" rows="3" placeholder="Instructions d'installation..."></textarea></div>
          </div>
          <div class="form-right">
            <div class="form-row">
              <div class="field"><label>Catégorie</label><select v-model="productForm.categorySlug"><option value="" disabled>Sélectionner</option><option v-for="c in categories" :key="c.slug" :value="c.slug">{{ c.name }}</option></select></div>
              <div class="field half"><label>Vendeur</label><select v-model="productForm.sellerSlug"><option value="" disabled>Sélectionner</option><option v-for="s in sellers" :key="s.slug" :value="s.slug">{{ s.username }}</option></select></div>
            </div>
            <div class="form-row">
              <div class="field"><label>Plateforme</label>
                <select v-if="!platformCustom" v-model="productForm.platform">
                  <option v-if="productForm.platform && !platformPresets.includes(productForm.platform)" :value="productForm.platform">{{ productForm.platform }}</option>
                  <option v-for="pf in platformPresets" :key="pf" :value="pf">{{ pf }}</option>
                  <option value="__custom">Autre…</option>
                </select>
                <input v-else v-model="productForm.platform" type="text" placeholder="Nom de la plateforme" @blur="platformCustom = false" />
              </div>
            </div>
            <div class="form-row">
              <div class="field"><label>Prix (€)</label><input v-model="productForm.price" type="number" step="0.01" min="0" placeholder="0.00" /></div>
              <div class="field"><label>Remise (%)</label><input v-model="productForm.discountPercent" type="number" min="0" max="100" placeholder="0" /></div>
            </div>
            <div class="field">
              <label>Image du produit</label>
              <div v-if="!uploadThumb" class="thumb-zone" @click="thumbInput?.click()" @dragover.prevent @drop.prevent="handleThumbUpload">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                <span>Cliquez ou glissez une image</span>
                <small>PNG, JPG, WEBP (Max 8 Mo)</small>
              </div>
              <div v-else class="thumb-preview">
                <img :src="uploadThumb" alt="Preview" />
                <button class="thumb-remove" @click="removeThumb"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
              </div>
              <input ref="thumbInput" type="file" accept="image/png,image/jpeg" style="display:none" @change="handleThumbUpload" />
            </div>
            <div v-if="editingId" class="field">
              <label>Images existantes</label>
              <div class="media-grid">
                <div v-for="m in productMedia" :key="m.id" class="media-item">
                  <img :src="m.thumbnail || m.url" alt="" />
                  <button class="media-remove" @click="removeMedia(m.id)" title="Retirer cette image"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
                </div>
                <button class="media-add" @click="addMediaImage" title="Ajouter une image"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg></button>
              </div>
            </div>
            <div class="field"><label>Tags</label>
              <div class="tag-dropdown">
                <div class="tag-trigger" @click="tagOpen = !tagOpen">
                  <span v-if="selectedTags.length">{{ selectedTags.length }} tag(s) sélectionné(s)</span>
                  <span v-else class="ph">Sélectionner des tags…</span>
                  <svg :class="{ open: tagOpen }" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
                </div>
                <div v-if="tagOpen" class="tag-menu">
                  <label v-for="t in allTags" :key="t" class="tag-opt" :class="{ checked: selectedTags.includes(t) }">
                    <input type="checkbox" :checked="selectedTags.includes(t)" @change="toggleTag(t)" />
                    <span>#{{ t }}</span>
                  </label>
                  <div v-if="!allTags.length" class="tag-empty">Aucun tag disponible</div>
                </div>
              </div>
              <div v-if="selectedTags.length" class="tag-pills">
                <span v-for="t in selectedTags" :key="t" class="tag-pill">
                  #{{ t }}
                  <button @click="removeTag(t)"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
                </span>
              </div>
            </div>
            <div class="field">
              <label>Fichier du produit (zip)</label>
              <div v-if="!uploadFile" class="file-zone" @click="fileInput?.click()" @dragover.prevent @drop.prevent="handleFileUpload">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><polyline points="9 15 12 12 15 15"/></svg>
                <span>Glissez votre fichier zip ici</span>
                <small v-if="uploadFileName">{{ uploadFileName }}</small>
                <small v-else>Max 2 Go</small>
              </div>
              <div v-else class="file-preview">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--green)" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><polyline points="9 15 12 12 15 15"/></svg>
                <span class="file-name">{{ uploadFileName }}</span>
                <button class="thumb-remove" @click="removeFile"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
              </div>
            </div>
            <input ref="fileInput" type="file" accept=".zip,.rar,.7z" style="display:none" @change="handleFileUpload" />
          </div>
        </div>
      </div>
      <div class="modal-actions">
        <label class="check-field"><input type="checkbox" v-model="productForm.isHidden" /> Masqué (caché du catalogue)</label>
        <div class="modal-action-btns">
          <button class="btn-cancel" @click="closeProductForm">Annuler</button>
          <button class="btn-primary" :disabled="saving" @click="saveProduct">{{ saving ? 'Enregistrement…' : (editingId ? 'Enregistrer les modifications' : (uploadFile ? 'Créer et uploader' : 'Créer le produit')) }}</button>
        </div>
      </div>
    </div>
  </div>

  <!-- Ambassador form modal -->
  <div v-if="showAmbForm" ref="ambOverlay" class="modal-overlay" @click.self="showAmbForm = false">
    <div ref="ambCard" class="form-modal" style="max-width:480px">
      <div class="modal-header"><h3>Nouveau code ambassadeur</h3><button class="modal-close" @click="showAmbForm = false"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button></div>
      <div class="modal-body form-body">
        <div class="field"><label>Code <small>(optionnel)</small></label><input v-model="ambForm.code" type="text" placeholder="ex: AMI20" /></div>
        <div class="field"><label>Nom de l'ambassadeur *</label><input v-model="ambForm.name" type="text" placeholder="Jean Dupont" required /></div>
        <div class="field"><label>Contact</label><input v-model="ambForm.contact" type="text" placeholder="Discord, email..." /></div>
        <div class="form-row">
          <div class="field" style="flex:1"><label>Type</label><select v-model="ambForm.discountType"><option value="percent">Pourcentage</option><option value="fixed">Montant fixe</option></select></div>
          <div class="field" style="flex:1"><label>Valeur</label><input v-model.number="ambForm.discountValue" type="number" min="1" :max="ambForm.discountType === 'percent' ? 100 : 999" placeholder="20" /></div>
        </div>
        <div class="form-row">
          <div class="field" style="flex:1"><label>Utilisations max</label><input v-model.number="ambForm.maxUses" type="number" min="0" placeholder="Illimité" /></div>
          <div class="field" style="flex:1"><label>Points par utilisation</label><input v-model.number="ambForm.points" type="number" min="1" placeholder="1" /></div>
        </div>
        <div class="field"><label>Note / Récompense</label><input v-model="ambForm.reward" type="text" placeholder="Ex: 1 mois de commission à 20%" /></div>
      </div>
      <div class="modal-actions">
        <button class="btn-ghost" @click="showAmbForm = false">Annuler</button>
        <button class="btn-primary" :disabled="ambSaving" @click="saveAmbCode">{{ ambSaving ? 'Création…' : 'Créer le code' }}</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'auth' })
const { user, logout } = useAuth()
const config = useRuntimeConfig()
const api = config.public.apiOrigin

// Redirect if not admin
if (user.value?.role !== 'admin') navigateTo('/')

const activeTab = ref('products')
const tabs = [
  { id:'products', label:'Produits', icon:'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>' },
  { id:'users', label:'Utilisateurs', icon:'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>' },
  { id:'featured', label:'Mise en avant', icon:'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>' },
  { id:'pages', label:'Pages', icon:'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>' },
  { id:'ambassadors', label:'Ambassadeurs', icon:'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>' },
  { id:'sellers', label:'Vendeurs', icon:'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>' },
  { id:'tags', label:'Tags', icon:'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.83z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>' },
  { id:'revenue', label:'Revenus', icon:'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>' },
]

// ─── Ambassadors ──────────────────────────────────────
const ambCodes = ref<any[]>([])
const ambLoading = ref(false)
const showAmbForm = ref(false)
const ambSaving = ref(false)
const ambForm = reactive({
  code: '', name: '', contact: '', discountType: 'percent', discountValue: 0, maxUses: 0, points: 1, reward: ''
})

// ─── Tags ─────────────────────────────────────────────
const tagList = ref<any[]>([])
const newTagName = ref('')
const editingTagId = ref<number | null>(null)
const editTagName = ref('')

async function loadTags() {
  try {
    const r = await $fetch(api + '/api/admin/tags', { credentials: 'include' })
    tagList.value = r.tags || []
    // Le dropdown produit attend des strings
    allTags.value = tagList.value.map((t: any) => t.name)
  } catch { allTags.value = []; tagList.value = [] }
}
async function addTag() {
  const name = newTagName.value.trim()
  if (!name) return
  try {
    await $fetch(api + '/api/admin/tags', { credentials: 'include', method: 'POST', body: { name } })
    newTagName.value = ''
    toastRef.value?.show('success', 'Tag créé')
    await loadTags()
  } catch (e: any) {
    toastRef.value?.show('error', e?.data?.message || 'Erreur')
  }
}
function startTagRename(tg: any) { editingTagId.value = tg.id; editTagName.value = tg.name }
async function saveTagRename(tg: any) {
  const name = editTagName.value.trim()
  if (!name || name === tg.name) { editingTagId.value = null; return }
  try {
    await $fetch(api + '/api/admin/tags/' + tg.id, { credentials: 'include', method: 'PATCH', body: { name } })
    editingTagId.value = null
    toastRef.value?.show('success', 'Tag renommé')
    await loadTags()
  } catch (e: any) {
    toastRef.value?.show('error', e?.data?.message || 'Erreur')
  }
}
async function deleteTag(tg: any) {
  const ok = await confirmRef.value?.ask({ title: 'Supprimer le tag', message: `Le tag "#${tg.name}" sera retiré de tous les produits.`, confirmText: 'Supprimer', danger: true })
  if (!ok) return
  try {
    await $fetch(api + '/api/admin/tags/' + tg.id, { credentials: 'include', method: 'DELETE' })
    toastRef.value?.show('success', 'Tag supprimé')
    await loadTags()
  } catch (e: any) {
    toastRef.value?.show('error', e?.data?.message || 'Erreur')
  }
}
async function loadAmbCodes() {
  ambLoading.value = true
  try {
    const res = await $fetch(api + '/api/admin/promo-codes', { credentials: 'include' })
    ambCodes.value = res.codes || res || []
  } catch { ambCodes.value = [] }
  finally { ambLoading.value = false }
}

async function saveAmbCode() {
  if (!ambForm.name || ambForm.discountValue <= 0) return
  ambSaving.value = true
  try {
    await $fetch(api + '/api/admin/promo-codes', { credentials: 'include',
      method: 'POST',
      body: {
        code: ambForm.code.trim() || undefined,
        ambassadorName: ambForm.name.trim(),
        ambassadorContact: ambForm.contact.trim(),
        discountType: ambForm.discountType,
        discountValue: ambForm.discountValue,
        maxRedemptions: ambForm.maxUses > 0 ? ambForm.maxUses : null,
        pointsPerRedemption: ambForm.points,
        rewardNote: ambForm.reward.trim()
      }
    })
    showAmbForm.value = false
    toastRef.value?.show('success', 'Code ambassadeur créé')
    loadAmbCodes()
    Object.assign(ambForm, { code: '', name: '', contact: '', discountType: 'percent', discountValue: 0, maxUses: 0, points: 1, reward: '' })
  } catch (e: any) {
    toastRef.value?.show('error', e?.data?.message || 'Erreur')
  }
  finally { ambSaving.value = false }
}

// ─── Products ──────────────────────────────────────────
const products = ref<any[]>([])
const sellerRequests = ref<any[]>([])
const showProductForm = ref(false)
const categories = ref<{slug:string;name:string}[]>([])
const sellers = ref<{slug:string;username:string}[]>([])

const productForm = reactive({
  title:'', shortDescription:'', description:'', installation:'',
  categorySlug:'', sellerSlug:'', price:0, discountPercent:0, platform:"Garry's Mod",
  tags:'', thumbnail:'', isHidden:false
})
const editingId = ref<number | null>(null)
const platformPresets = ["Garry's Mod", 'Unreal Engine', 'FiveM', 'Nanos']
const platformCustom = ref(false)
watch(() => productForm.platform, (v) => {
  if (v === '__custom') { platformCustom.value = true; productForm.platform = '' }
})
const productMedia = ref<any[]>([])

const toastRef = ref<InstanceType<typeof ToastNotif> | null>(null)
const confirmRef = ref<InstanceType<typeof ConfirmModal> | null>(null)
const saving = ref(false)
const prodOverlay = ref<HTMLElement | null>(null)
const prodCard = ref<HTMLElement | null>(null)

async function animateProdIn() {
  if (!prodOverlay.value || !prodCard.value) return
  let gsap: any
  try { const mod = await import('gsap'); gsap = mod.default } catch { return }
  gsap.set(prodOverlay.value, { opacity: 0 }); gsap.set(prodCard.value, { opacity: 0, scale: .92, y: 15 })
  gsap.to(prodOverlay.value, { opacity: 1, duration: .2, ease: 'power2.out' })
  gsap.to(prodCard.value, { opacity: 1, scale: 1, y: 0, duration: .3, ease: 'back.out(1.6)', delay: .05 })
}
function openProductForm() {
  editingId.value = null
  productMedia.value = []
  Object.assign(productForm, { title:'', shortDescription:'', description:'', installation:'', categorySlug:'', sellerSlug:'', price:0, discountPercent:0, platform:"Garry's Mod", tags:'', thumbnail:'', isHidden:false })
  uploadThumb.value = ''; removeFile()
  selectedTags.value = []; newTag.value = ''
  showProductForm.value = true
  nextTick(() => animateProdIn())
}
function editProduct(p: any) {
  editingId.value = p.id
  productMedia.value = (p.media || []).map((m: any) => ({ id: m.id, url: m.url, thumbnail: m.thumbnail }))
  Object.assign(productForm, {
    title: p.title || '',
    shortDescription: p.short_description || '',
    description: p.description || '',
    installation: p.installation || '',
    categorySlug: p.category_slug || '',
    sellerSlug: p.seller_slug || '',
    price: Number(p.old_price || p.price || 0),
    discountPercent: Number(p.discount_percent || 0),
    platform: p.platform || "Garry's Mod",
    tags: (p.tags || []).join(', '),
    thumbnail: '',
    isHidden: Boolean(p.is_hidden)
  })
  selectedTags.value = p.tags || []
  newTag.value = ''
  uploadThumb.value = ''
  removeFile()
  showProductForm.value = true
  nextTick(() => animateProdIn())
}
async function removeMedia(mediaId: number) {
  if (!editingId.value) return
  try {
    await $fetch(api + '/api/admin/products/' + editingId.value + '/media/' + mediaId, { credentials: 'include', method: 'DELETE' })
    productMedia.value = productMedia.value.filter(m => m.id !== mediaId)
    toastRef.value?.show('success', 'Image retirée')
    loadProducts()
  } catch (e: any) {
    toastRef.value?.show('error', e?.data?.message || 'Erreur')
  }
}
function addMediaImage() {
  if (!editingId.value) return
  const input = document.createElement('input')
  input.type = 'file'; input.accept = 'image/png,image/jpeg,image/webp'
  input.onchange = async (e: any) => {
    const file = e.target?.files?.[0]
    if (!file) return
    if (file.size > 8*1024*1024) return toastRef.value?.show('error', 'Max 8 Mo')
    try {
      const compressed = await compressImage(file, 1600, 0.82)
      const res = await $fetch(api + '/api/admin/products/' + editingId.value + '/media', { credentials: 'include', method: 'POST', body: { url: compressed } })
      productMedia.value.push({ id: res.id, url: compressed, thumbnail: compressed })
      toastRef.value?.show('success', 'Image ajoutée')
      loadProducts()
    } catch (err: any) {
      toastRef.value?.show('error', err?.data?.message || 'Erreur')
    }
  }
  input.click()
}
function closeProductForm() { showProductForm.value = false }

const uploadThumb = ref('')
const allTags = ref<string[]>([])
const selectedTags = ref<string[]>([])
const newTag = ref('')
const tagOpen = ref(false)
const thumbInput = ref<HTMLInputElement | null>(null)
function handleThumbUpload(e: any) {
  const file = e.target?.files?.[0] || e.dataTransfer?.files?.[0]
  if (!file) return
  if (file.size > 8*1024*1024) return toastRef.value?.show('error', 'Max 8 Mo')
  const reader = new FileReader()
  reader.onload = () => {
    uploadThumb.value = reader.result as string
    productForm.thumbnail = reader.result as string
  }
  reader.readAsDataURL(file)
}
function removeThumb() { uploadThumb.value = ''; productForm.thumbnail = '' }

function toggleTag(t: string) {
  const idx = selectedTags.value.indexOf(t)
  if (idx > -1) selectedTags.value.splice(idx, 1)
  else selectedTags.value.push(t)
  productForm.tags = selectedTags.value.join(', ')
}
function removeTag(t: string) {
  selectedTags.value = selectedTags.value.filter(x => x !== t)
  productForm.tags = selectedTags.value.join(', ')
}

// ─── Product File Upload ──────────────────────────────
const uploadFile = ref<File | null>(null)
const uploadFileName = ref('')
const uploadFileSize = ref(0)
const fileInput = ref<HTMLInputElement | null>(null)
function handleFileUpload(e: any) {
  const file = e.target?.files?.[0] || e.dataTransfer?.files?.[0]
  if (!file) return
  uploadFile.value = file
  uploadFileName.value = file.name
  uploadFileSize.value = file.size
}
function removeFile() {
  uploadFile.value = null
  uploadFileName.value = ''
  uploadFileSize.value = 0
}
function formatSize(bytes: number) {
  if (!bytes) return ''
  if (bytes < 1024) return bytes + ' o'
  if (bytes < 1024*1024) return (bytes/1024).toFixed(1) + ' Ko'
  if (bytes < 1024*1024*1024) return (bytes/(1024*1024)).toFixed(1) + ' Mo'
  return (bytes/(1024*1024*1024)).toFixed(2) + ' Go'
}

async function saveProduct() {
  if (saving.value) return // anti double-clic (évite les doublons de fichiers)
  if (!productForm.title || !productForm.price) return toastRef.value?.show('error', 'Titre et prix requis')
  const isEdit = !!editingId.value
  saving.value = true
  try {
    const payload = {
      ...productForm,
      tags: productForm.tags.split(',').map((t:string) => t.trim()).filter(Boolean)
    }
    const res = isEdit
      ? await $fetch(api + '/api/admin/products/' + editingId.value, { credentials: 'include', method:'PATCH', body: payload })
      : await $fetch(api + '/api/admin/products', { credentials: 'include', method:'POST', body: payload })

    // Upload fichier produit vers R2 si un fichier a été sélectionné
    const productId = res?.id || res?.productId || res?.product?.id || editingId.value
    if (uploadFile.value && productId) {
      const reader = new FileReader()
      const base64 = await new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          const dataUrl = reader.result as string
          resolve(dataUrl.split(',')[1]) // Remove data:...;base64, prefix
        }
        reader.onerror = reject
        reader.readAsDataURL(uploadFile.value)
      })

      await $fetch(api + '/api/admin/products/' + productId + '/upload', { credentials: 'include',
        method: 'POST',
        body: {
          filename: uploadFileName.value,
          data_base64: base64
        }
      })
    }

    editingId.value = null
    showProductForm.value = false; loadProducts()
    toastRef.value?.show('success', isEdit ? 'Produit modifié' : ('Produit créé' + (uploadFile.value ? ' + fichier uploadé' : '')))
  } catch (e: any) {
    toastRef.value?.show('error', e?.data?.message || e?.message || 'Erreur')
  } finally {
    saving.value = false
  }
}

async function loadFormData() {
  try {
    const b = await $fetch(api + '/api/bootstrap', { credentials: 'include' })
    categories.value = b.categories || []
    // Vrais vendeurs depuis la DB (slug réel), fallback sur l'ancienne liste
    sellers.value = b.sellers?.length
      ? b.sellers.map((s: any) => ({ slug: s.slug, username: s.username }))
      : (b.collaborators?.map((n:string) => ({ slug: n.toLowerCase().replace(/\s+/g,'-'), username: n })) || [])
  } catch {}
}

async function loadProducts() {
  try {
    const res = await $fetch(api + '/api/admin/products', { credentials: 'include' })
    products.value = res.items || res.products || res
  } catch { products.value = [] }
}
async function deleteProduct(id: number) {
  const ok = await confirmRef.value?.ask({ title:'Supprimer le produit', message:'Cette action est irréversible.', confirmText:'Supprimer', danger:true })
  if (!ok) return
  try { await $fetch(api + '/api/admin/products/' + id, { credentials: 'include', method: 'DELETE' }); loadProducts(); toastRef.value?.show('success', 'Produit supprimé') }
  catch { toastRef.value?.show('error', 'Impossible de supprimer le produit') }
}

// ─── Users ─────────────────────────────────────────────
const users = ref<any[]>([])
const userRoleFilter = ref('all')
const userSearch = ref('')
const filteredUsers = computed(() => {
  const q = userSearch.value.trim().toLowerCase()
  return users.value.filter((u: any) => {
    if (userRoleFilter.value !== 'all' && u.role !== userRoleFilter.value) return false
    if (!q) return true
    const name = String(u.displayName || u.username || '').toLowerCase()
    const email = String(u.email || '').toLowerCase()
    return name.includes(q) || email.includes(q)
  })
})
async function loadUsers() {
  try {
    const res = await $fetch(api + '/api/admin/users', { credentials: 'include' })
    users.value = res.users || res
  } catch { users.value = [] }
}

// Commission propre au vendeur (0-100 %)
async function saveCommission(u: any) {
  try {
    const res = await $fetch(api + `/api/admin/users/${u.id}/commission`, {
      method: 'PATCH',
      credentials: 'include',
      body: { commissionPercent: u.commissionPercent },
    })
    u.commissionPercent = res.commissionPercent
    toastRef.value?.show('success', `Commission de ${u.displayName || u.username} → ${res.commissionPercent}%`)
  } catch (e: any) {
    toastRef.value?.show('error', e?.data?.message || 'Erreur lors de la mise à jour de la commission')
  }
}

// ─── Seller Requests ────────────────────────────────────
async function loadSellerRequests() {
  try {
    const res = await $fetch(api + '/api/admin/seller-requests', { credentials: 'include' })
    sellerRequests.value = res.items || []
    console.log('Seller requests loaded:', sellerRequests.value.length)
  } catch (e: any) {
    console.error('Seller requests error:', e?.data?.message || e?.message || e)
    sellerRequests.value = []
  }
}

async function approveSeller(id: number) {
  try {
    await $fetch(api + '/api/admin/seller-requests/' + id + '/approve', { credentials: 'include', method: 'POST' })
    toastRef.value?.show('success', 'Vendeur approuvé ✓')
    loadSellerRequests()
    loadFormData() // met à jour le dropdown vendeur du formulaire produit
  } catch (e: any) {
    toastRef.value?.show('error', e?.data?.message || 'Erreur')
  }
}

async function rejectSeller(id: number) {
  const confirmed = await confirmRef.value?.confirm('Refuser ce vendeur ?', 'Cette action est irréversible.')
  if (!confirmed) return
  try {
    await $fetch(api + '/api/admin/seller-requests/' + id + '/reject', { credentials: 'include', method: 'POST' })
    toastRef.value?.show('info', 'Vendeur refusé')
    loadSellerRequests()
  } catch (e: any) {
    toastRef.value?.show('error', e?.data?.message || 'Erreur')
  }
}

// ─── Revenue (dashboard Stripe) ──────────────────────────
const revenue = ref<any>(null)
const revenueLoading = ref(false)
// Filtre vendeur : 'all' ou id du vendeur (dropdown)
const sellerFilter = ref<number | 'all'>('all')
const filteredOrders = computed(() => {
  const orders = revenue.value?.orders || []
  if (sellerFilter.value === 'all') return orders
  return orders.filter((o: any) => (o.sellerIds || []).includes(sellerFilter.value))
})
const filteredCharges = computed(() => {
  const charges = revenue.value?.charges || []
  if (sellerFilter.value === 'all') return charges
  return charges.filter((c: any) => c.sellerUserId === sellerFilter.value)
})

async function loadRevenue() {
  revenueLoading.value = true
  try {
    const res = await $fetch(api + '/api/admin/revenue', { credentials: 'include' })
    revenue.value = res
  } catch (e: any) {
    revenue.value = null
    toastRef.value?.show('error', e?.data?.message || 'Erreur chargement revenus')
  } finally {
    revenueLoading.value = false
  }
}

function fmtMoney(v: any): string {
  const n = Number(v || 0)
  return n.toFixed(2).replace('.', ',') + ' €'
}

// ─── Featured ──────────────────────────────────────────
const featuredCollab = ref<{name:string;image:string}[]>([{name:'',image:''}])
const featuredComm = ref<{name:string;image:string}[]>([{name:'',image:''}])
const featPrompt = reactive({ show:false, group:'' as 'collab'|'comm', name:'' })
const savingFeatured = ref(false)

async function loadFeaturedData() {
  try {
    const b = await $fetch(api + '/api/bootstrap', { credentials: 'include' })
    const lc = b.landingConfig || []
    const collab = lc.find((c:any) => c.section_key === 'featured_collab')
    const comm = lc.find((c:any) => c.section_key === 'featured_comm')
    if (collab?.metadata?.items?.length) featuredCollab.value = collab.metadata.items
    if (comm?.metadata?.items?.length) featuredComm.value = comm.metadata.items
  } catch {}
}
function addFeat(group:'collab'|'comm') {
  featPrompt.show = true
  featPrompt.group = group
  featPrompt.name = ''
  nextTick(() => animateFeatIn())
}
function cancelFeat() {
  featPrompt.show = false
}
function confirmFeatName() {
  const name = featPrompt.name.trim()
  if (!name) return
  animateFeatOut()
  const fileInput = document.createElement('input')
  fileInput.type = 'file'; fileInput.accept = 'image/*'
  fileInput.onchange = async (e: any) => {
    const file = e.target.files?.[0]
    if (!file || file.size > 20*1024*1024) return toastRef.value?.show('error', 'Max 20 Mo')
    // Compress image to max 800px width to fit Vercel 4.5MB limit
    const compressed = await compressImage(file, 800, 0.7)
    const item = { name, image: compressed }
    if (featPrompt.group === 'collab') featuredCollab.value.push(item)
    else featuredComm.value.push(item)
  }
  fileInput.click()
}

const featOverlay = ref<HTMLElement | null>(null)
const featCard = ref<HTMLElement | null>(null)

function compressImage(file: File, maxW: number, quality: number): Promise<string> {
  return new Promise((resolve, reject) => {
    // For GIFs, keep original to preserve animation
    if (file.type === 'image/gif') {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(file)
      return
    }
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      let w = img.width, h = img.height
      if (w > maxW) { h = h * maxW / w; w = maxW }
      canvas.width = w; canvas.height = h
      canvas.getContext('2d')!.drawImage(img, 0, 0, w, h)
      resolve(canvas.toDataURL('image/jpeg', quality))
    }
    img.onerror = reject
    img.src = URL.createObjectURL(file)
  })
}

async function animateFeatIn() {
  if (!featOverlay.value || !featCard.value) return
  let gsap: any
  try { const mod = await import('gsap'); gsap = mod.default } catch { return }
  gsap.set(featOverlay.value, { opacity: 0 })
  gsap.set(featCard.value, { opacity: 0, scale: .9, y: 20 })
  gsap.to(featOverlay.value, { opacity: 1, duration: .25, ease: 'power2.out' })
  gsap.to(featCard.value, { opacity: 1, scale: 1, y: 0, duration: .35, ease: 'back.out(1.7)', delay: .05 })
}
async function animateFeatOut() {
  featPrompt.show = false
}
function removeFeat(group:'collab'|'comm', i:number) {
  if (group === 'collab') featuredCollab.value.splice(i, 1)
  else featuredComm.value.splice(i, 1)
}
async function saveFeatured() {
  if (savingFeatured.value) return
  savingFeatured.value = true
  try {
    await $fetch(api + '/api/admin/landing-config/featured_collab', { credentials: 'include', method:'PATCH', body: { title:'Collaborateurs', metadata:{ items: featuredCollab.value.filter(i => i.name && i.image) } }, timeout: 30000 })
    await $fetch(api + '/api/admin/landing-config/featured_comm', { credentials: 'include', method:'PATCH', body: { title:'Communauté', metadata:{ items: featuredComm.value.filter(i => i.name && i.image) } }, timeout: 30000 })
    toastRef.value?.show('success', 'Mise en avant enregistrée')
  } catch (e: any) {
    const msg = e?.data?.message || e?.message || 'Erreur inconnue'
    toastRef.value?.show('error', msg)
    console.error('Save error:', e)
  } finally { savingFeatured.value = false }
}

// ─── Pages ─────────────────────────────────────────────
const editablePages = ref<any[]>([])

async function loadPages() {
  const keys = ['prestation', 'about', 'footer']
  for (const key of keys) {
    try {
      const res = await $fetch(api + '/api/page-content/' + key, { credentials: 'include' })
      const data = typeof res === 'string' ? { content: res } : res
      editablePages.value.push({
        key,
        label: key === 'prestation' ? 'Prestation' : key === 'about' ? 'À propos' : 'Footer',
        data,
        raw: JSON.stringify(data, null, 2),
        saved: false, saving: false, showPreview: false
      })
    } catch {
      editablePages.value.push({
        key, label: key === 'prestation' ? 'Prestation' : key === 'about' ? 'À propos' : 'Footer',
        data: {}, raw: '{}', saved: false, saving: false, showPreview: false
      })
    }
  }
}
async function savePage(page: typeof editablePages.value[0]) {
  if (page.saving) return
  page.saving = true
  try {
    // Parse the edited JSON and send back
    const parsed = JSON.parse(page.raw)
    await $fetch(api + '/api/page-content/' + page.key, { credentials: 'include', method:'PATCH', body: parsed })
    page.saved = true; setTimeout(() => page.saved = false, 2000)
  } catch (e: any) {
    toastRef.value?.show('error', e?.message || 'Erreur de sauvegarde')
  }
  finally { page.saving = false }
}

onMounted(() => { loadProducts(); loadUsers(); loadPages(); loadFormData(); loadFeaturedData(); loadAmbCodes(); loadSellerRequests(); loadTags(); loadRevenue() })
</script>

<style scoped>
.admin-page { display:flex; min-height:100vh; background:var(--bg); }
.admin-sidebar { width:220px; flex-shrink:0; background:var(--bg-card); border-right:1px solid var(--border); display:flex; flex-direction:column; position:sticky; top:0; height:100vh; }
.sidebar-brand { padding:20px 16px 16px; border-bottom:1px solid var(--border); }
.brand-icon { width:36px;height:36px;display:grid;place-items:center;background:linear-gradient(135deg,var(--primary),var(--accent));border-radius:10px;color:#fff;font-weight:900;font-size:1.1rem;margin-bottom:8px;text-decoration:none; }
.sidebar-brand h1 { font-size:1rem;font-weight:700; }
.badge { font-size:.65rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:.06em;font-weight:600; }
.sidebar-nav { flex:1; padding:8px; display:flex; flex-direction:column; gap:2px; }
.nav-btn { display:flex; align-items:center; gap:8px; padding:10px 12px; border-radius:8px; border:none; background:transparent; color:var(--text-secondary); font-size:.85rem; font-weight:500; cursor:pointer; transition:all .15s; width:100%; text-align:left; }
.nav-btn:hover { background:rgba(255,255,255,0.04); color:var(--text); }
.nav-btn.active { background:var(--primary-glow); color:var(--primary); }
.sidebar-footer { padding:12px 16px; border-top:1px solid var(--border); display:grid; gap:8px; }
.back-link { font-size:.82rem;color:var(--text-muted);text-decoration:none; }
.btn-logout { padding:8px;border-radius:6px;border:1px solid rgba(248,113,113,0.2);background:rgba(248,113,113,0.06);color:var(--red);font-size:.8rem;font-weight:600;cursor:pointer; }
.admin-main { flex:1; padding:24px 28px; min-width:0; }
.tab-content { max-width:1100px; }
.tab-header { display:flex;align-items:center;justify-content:space-between;margin-bottom:20px; }
.tab-header h2 { font-size:1.3rem;font-weight:800; }
.tab-desc { color:var(--text-secondary);font-size:.9rem;margin-bottom:20px; }

/* ─── Buttons ─── */
.btn-primary {
  display:inline-flex;align-items:center;gap:8px;
  padding:10px 20px;border-radius:10px;border:none;
  background:linear-gradient(135deg,var(--primary),#4f46e5);
  color:#fff;font-size:.85rem;font-weight:700;
  cursor:pointer;transition:all .25s;font-family:inherit;
  box-shadow:0 2px 8px rgba(47,125,246,0.2);
}
.btn-primary:hover { transform:translateY(-2px);box-shadow:0 4px 16px rgba(47,125,246,0.35); }
.btn-primary:active { transform:translateY(0); }

.btn-ghost {
  padding:10px 18px;border-radius:10px;border:1px solid var(--border);
  background:transparent;color:var(--text-secondary);font-size:.85rem;
  font-weight:600;cursor:pointer;transition:all .2s;font-family:inherit;
}
.btn-ghost:hover { border-color:var(--border-hover);color:var(--text);background:rgba(255,255,255,0.03); }

.btn-cancel {
  padding:10px 18px;border-radius:10px;border:1px solid var(--border);
  background:transparent;color:var(--text-secondary);font-size:.83rem;
  font-weight:600;cursor:pointer;transition:all .2s;font-family:inherit;
}
.btn-cancel:hover { border-color:var(--border-hover);color:var(--text); }

.btn-action {
  width:32px;height:32px;border-radius:8px;border:1px solid var(--border);
  background:transparent;color:var(--text-secondary);cursor:pointer;
  display:grid;place-items:center;transition:all .2s;
}
.btn-action:hover { border-color:var(--primary);color:var(--primary);background:rgba(47,125,246,0.05); }
.btn-action.danger:hover { border-color:rgba(248,113,113,0.3);color:var(--red);background:rgba(248,113,113,0.05); }

/* ─── Modals ─── */
.modal-overlay { position:fixed;inset:0;z-index:99998;background:rgba(0,0,0,0.65);display:grid;place-items:center;padding:20px;backdrop-filter:blur(6px); }
.modal-header { display:flex;align-items:center;justify-content:space-between;padding:20px 24px 0; }
.modal-header h3 { font-size:1.1rem;font-weight:700;letter-spacing:-.02em; }
.modal-close { width:30px;height:30px;border-radius:8px;border:none;background:rgba(255,255,255,0.04);color:var(--text-muted);cursor:pointer;display:grid;place-items:center;transition:all .2s; }
.modal-close:hover { background:rgba(255,255,255,0.08);color:var(--text); }
.modal-body { padding:16px 24px 20px; }
.modal-body p { font-size:.88rem;color:var(--text-secondary);line-height:1.5;margin:0; }
.modal-actions { display:flex;gap:8px;padding:0 24px 20px;justify-content:flex-end; }
.modal-actions .btn-ghost, .modal-actions .btn-cancel { font-size:.83rem;padding:9px 18px; }

/* Prompt card (featured name) */
.prompt-card { width:100%;max-width:360px;background:var(--bg-card);border:1px solid var(--border);border-radius:16px;overflow:hidden;box-shadow:0 16px 48px rgba(0,0,0,0.3); }
.prompt-card .field { display:grid;gap:5px; }
.prompt-card .field label { font-size:.78rem;font-weight:600;color:var(--text-secondary);text-transform:uppercase;letter-spacing:.04em; }
.prompt-card .field input { padding:10px 14px;border-radius:10px;border:1px solid var(--border);background:var(--bg-surface);color:var(--text);font-size:.88rem;outline:none; }
.prompt-card .field input:focus { border-color:var(--primary);box-shadow:0 0 0 3px rgba(47,125,246,0.1); }

/* Form modal (product) */
.form-modal { width:100%;max-width:520px;background:var(--bg-card);border:1px solid var(--border);border-radius:16px;overflow:hidden;box-shadow:0 16px 48px rgba(0,0,0,0.3); }
.form-modal-lg { max-width:880px !important; }
.form-grid-2 { display:grid;grid-template-columns:1fr 1fr;gap:24px; }
@media(max-width:768px){.form-grid-2{grid-template-columns:1fr}}
.check-field { display:flex;align-items:center;gap:8px;font-size:.82rem;color:var(--text-secondary);cursor:pointer; }
.check-field input { width:16px;height:16px;accent-color:var(--primary); }
.modal-action-btns { display:flex;align-items:center;gap:10px;margin-left:auto; }
.form-body { display:grid;gap:14px; }
.form-row { display:grid;grid-template-columns:1fr 1fr;gap:12px; }
.form-body .field { display:grid;gap:5px; }
.form-body .field label { font-size:.78rem;font-weight:600;color:var(--text-secondary);text-transform:uppercase;letter-spacing:.04em; }
.form-body .field input, .form-body .field textarea {
  padding:10px 14px;border-radius:10px;border:1px solid var(--border);
  background:var(--bg-surface);color:var(--text);font-size:.88rem;
  outline:none;transition:border-color .2s,box-shadow .2s;font-family:inherit;
}
.form-body .field input:focus, .form-body .field textarea:focus {
  border-color:var(--primary);box-shadow:0 0 0 3px rgba(47,125,246,0.1);
}
.form-body .field textarea { resize:vertical;min-height:70px; }
.form-body .field select {
  padding:10px 14px;border-radius:10px;border:1px solid var(--border);
  background:var(--bg-surface);color:var(--text);font-size:.88rem;
  outline:none;transition:border-color .2s;font-family:inherit;cursor:pointer;
  appearance:none;-webkit-appearance:none;
  background-image:url("data:image/svg+xml,%3Csvg width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
  background-repeat:no-repeat;background-position:right 12px center;padding-right:32px;
}
.form-body .field select:focus { border-color:var(--primary);box-shadow:0 0 0 3px rgba(47,125,246,0.1); }

.thumb-zone {
  display:grid;place-items:center;gap:10px;padding:28px;border:2px dashed var(--border);
  border-radius:12px;cursor:pointer;transition:all .25s;text-align:center;
}
.thumb-zone:hover { border-color:var(--primary);background:rgba(47,125,246,0.03); }

/* File upload zone */
.file-zone {
  display:grid;place-items:center;gap:10px;padding:28px;border:2px dashed var(--border);
  border-radius:12px;cursor:pointer;transition:all .25s;text-align:center;background:var(--bg-surface);
}
.file-zone:hover { border-color:var(--green);background:rgba(110,231,183,0.03); }
.file-zone svg { color:var(--green); }
.file-zone span { font-size:.88rem;font-weight:600;color:var(--text); }
.file-zone small { font-size:.75rem;color:var(--text-muted); }
.file-preview {
  display:flex;align-items:center;gap:10px;padding:12px 16px;border-radius:10px;
  border:1px solid var(--border);background:var(--bg-surface);
}
.file-preview .file-name { flex:1;font-weight:600;font-size:.85rem;color:var(--text); }
.file-preview .file-size { color:var(--text-muted);font-size:.78rem; }
.file-remove {
  width:28px;height:28px;border-radius:6px;border:1px solid transparent;
  background:rgba(248,113,113,0.06);color:var(--red);cursor:pointer;
  display:grid;place-items:center;transition:all .15s;flex-shrink:0;
}
.file-remove:hover { border-color:rgba(248,113,113,0.2);background:rgba(248,113,113,0.12); }
.thumb-zone svg { opacity:.4; }
.thumb-zone span { font-size:.85rem;color:var(--text-secondary);font-weight:600; }
.thumb-zone small { font-size:.75rem;color:var(--text-muted); }
.thumb-preview { position:relative;border-radius:10px;overflow:hidden;max-width:180px; }
.thumb-preview img { width:100%;display:block;border-radius:10px; }
.thumb-remove { position:absolute;top:6px;right:6px;width:28px;height:28px;border-radius:50%;border:none;background:rgba(0,0,0,0.5);color:#fff;cursor:pointer;display:grid;place-items:center; }
.thumb-remove:hover { background:rgba(248,113,113,0.8); }

/* Media gallery (édition produit) */
.media-grid { display:flex;flex-wrap:wrap;gap:8px; }
.media-item { position:relative;width:96px;aspect-ratio:16/9;height:auto;border-radius:8px;overflow:hidden;border:1px solid var(--border); }
.media-item img { width:100%;height:100%;object-fit:cover; }
.media-remove { position:absolute;top:3px;right:3px;width:20px;height:20px;border-radius:50%;border:none;background:rgba(0,0,0,0.55);color:#fff;cursor:pointer;display:grid;place-items:center; }
.media-remove:hover { background:rgba(248,113,113,0.9); }
.media-add { width:72px;height:72px;border-radius:8px;border:2px dashed var(--border);background:transparent;color:var(--text-muted);cursor:pointer;display:grid;place-items:center;transition:all .15s; }
.media-add:hover { border-color:var(--primary);color:var(--primary); }

.checkbox-row { display:flex;align-items:center;gap:10px;padding:12px 16px;border-radius:10px;background:rgba(255,255,255,0.02);border:1px solid var(--border);cursor:pointer;font-size:.85rem;color:var(--text-secondary); }
.checkbox-row input[type=checkbox] { width:18px;height:18px;accent-color:var(--primary);flex-shrink:0;cursor:pointer; }

/* ─── Table ─── */
.table-wrap { overflow-x:auto; }
.admin-table { width:100%;border-collapse:collapse;font-size:.85rem; }
.admin-table th { text-align:left;padding:12px 14px;font-weight:700;color:var(--text-muted);text-transform:uppercase;font-size:.7rem;letter-spacing:.05em;border-bottom:1px solid var(--border); }
.admin-table td { padding:12px 14px;border-bottom:1px solid rgba(255,255,255,0.03); }
.buyer-cell { display:grid; gap:2px; }
.buyer-name { font-weight:700; }
.buyer-email { font-size:.75rem; color:var(--text-muted); }
.seller-cell { font-weight:600; }
.muted { color:var(--text-muted); }
.comm-edit { display:inline-flex; align-items:center; gap:6px; }
.comm-edit input { width:64px; padding:6px 8px; border-radius:8px; border:1px solid var(--border); background:var(--bg-surface); color:var(--text); font-size:.85rem; font-family:inherit; outline:none; }
.comm-edit input:focus { border-color:var(--primary); }
.comm-pct { font-size:.8rem; color:var(--text-muted); }
.admin-table tr { transition:background .15s; }
.admin-table tr:hover td { background:rgba(255,255,255,0.02); }
.thumb { width:46px;height:46px;border-radius:8px;object-fit:cover;background:var(--bg-surface); }
.badge-cat { display:inline-block;padding:3px 10px;border-radius:6px;background:rgba(47,125,246,0.08);color:var(--primary);font-size:.78rem;font-weight:600; }
.price-cell { font-weight:700;color:var(--primary);font-size:.9rem; }
.actions { display:flex;gap:6px; }
.role-badge { font-size:.72rem;padding:3px 10px;border-radius:6px;font-weight:600; }
.role-badge.admin { background:rgba(248,113,113,0.12);color:var(--red); }
.role-badge.seller { background:rgba(110,231,183,0.12);color:var(--green); }
.role-badge.user { background:rgba(47,125,246,0.1);color:var(--primary); }
.empty-tab { text-align:center;padding:60px;color:var(--text-muted);font-size:.95rem; }

/* ─── Featured ─── */
.featured-groups { display:grid;gap:24px;margin-bottom:24px; }
.group-card { background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius-lg);padding:24px; }
.group-header { margin-bottom:16px; }
.group-header h3 { font-size:1rem;font-weight:700;padding-bottom:12px;border-bottom:1px solid var(--border); }
.group-grid { display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:12px; }
.fitem { position:relative;border-radius:12px;overflow:hidden;border:1px solid var(--border); }
.fpreview { aspect-ratio:1; }
.fpreview img { width:100%;height:100%;object-fit:cover; }
.fnopreview { aspect-ratio:1;display:grid;place-items:center;gap:8px;background:var(--bg-surface);color:var(--text-muted);font-size:.72rem;text-align:center;padding:10px; }
.fnopreview svg { opacity:.4; }
.fname { position:absolute;bottom:0;left:0;right:0;padding:8px 10px;background:linear-gradient(transparent,rgba(0,0,0,0.85));font-size:.8rem;font-weight:600;color:#fff; }
.fremove { position:absolute;top:6px;right:6px;width:26px;height:26px;border-radius:50%;border:none;background:rgba(0,0,0,0.5);color:#fff;cursor:pointer;display:grid;place-items:center;transition:all .2s; }
.fremove:hover { background:rgba(248,113,113,0.8); }
.fadd { display:grid;place-items:center;gap:6px;aspect-ratio:1;border:2px dashed var(--border);border-radius:12px;color:var(--text-muted);font-size:.75rem;cursor:pointer;transition:all .25s;font-weight:600; }
.fadd:hover { border-color:var(--primary);color:var(--primary);background:rgba(47,125,246,0.03); }
.fadd svg { transition:transform .25s; }
.fadd:hover svg { transform:rotate(90deg); }

/* ─── Page editors ─── */
.page-editors { display:grid;gap:20px; }
.editor-card { background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius-lg);padding:24px; }
.editor-header { margin-bottom:14px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px; }
.editor-header h3 { font-size:1rem;font-weight:700; }
.editor-actions { display:flex;align-items:center;gap:8px;flex-wrap:wrap; }
.btn-sm { padding:7px 14px !important;font-size:.78rem !important;border-radius:8px !important; }
.editor-layout { }
.editor-textarea { width:100%;padding:14px;border-radius:10px;border:1px solid var(--border);background:var(--bg-surface);color:var(--text);font-size:.85rem;font-family:'SF Mono',monospace;resize:vertical;outline:none;min-height:200px;transition:border-color .2s; }
.editor-textarea:focus { border-color:var(--primary);box-shadow:0 0 0 3px rgba(47,125,246,0.1); }
.preview-json { padding:16px;background:#060a10;color:#a0b0c8;font-family:'SF Mono',monospace;font-size:.82rem;line-height:1.6;white-space:pre-wrap;overflow-x:auto;max-height:400px;overflow-y:auto; }
.preview-wrap { border-radius:10px;overflow:hidden;border:1px solid var(--border); }
.preview-frame { width:100%;height:400px;border:none;background:#0a0e14;display:block; }
.saved-msg { font-size:.82rem;color:var(--green);font-weight:600;display:inline-flex;align-items:center;gap:4px; }

.spinner { display:inline-block;width:16px;height:16px;border:2px solid rgba(255,255,255,0.3);border-top-color:#fff;border-radius:50%;animation:spin .6s linear infinite; }
@keyframes spin { to { transform:rotate(360deg); } }
.btn-primary:disabled { opacity:.7;cursor:not-allowed;transform:none !important;box-shadow:none !important; }
.tag-selector { display:grid;gap:8px; }
.tag-dropdown { position:relative; }
.tag-trigger { display:flex;align-items:center;gap:8px;padding:10px 12px;border-radius:8px;border:1px solid var(--border);background:var(--bg-surface);cursor:pointer;transition:border-color .2s;font-size:.85rem; }
.tag-trigger:hover { border-color:var(--border-hover); }
.tag-trigger .ph { color:var(--text-muted); }
.tag-trigger svg { margin-left:auto;transition:transform .2s;flex-shrink:0; }
.tag-trigger svg.open { transform:rotate(180deg); }
.tag-menu { position:absolute;top:calc(100% + 4px);left:0;right:0;z-index:50;display:flex;flex-wrap:wrap;gap:2px;padding:8px;border-radius:8px;border:1px solid var(--border);background:var(--bg-card);box-shadow:0 8px 24px rgba(0,0,0,0.2);max-height:160px;overflow-y:auto; }
.tag-opt { display:flex;align-items:center;gap:5px;padding:5px 10px;border-radius:4px;font-size:.78rem;cursor:pointer;transition:all .1s;white-space:nowrap;flex:0 0 calc(50% - 2px);box-sizing:border-box; }
.tag-opt:hover { background:rgba(255,255,255,0.04); }
.tag-opt.checked { background:rgba(47,125,246,0.1);color:var(--primary);font-weight:600; }
.tag-opt input { display:none; }
.tag-empty { padding:12px;text-align:center;font-size:.78rem;color:var(--text-muted);width:100%; }
.tag-pills { display:flex;flex-wrap:wrap;gap:4px;margin-top:6px; }
.tag-pill { display:inline-flex;align-items:center;gap:4px;padding:3px 10px;border-radius:4px;background:rgba(47,125,246,0.12);font-size:.75rem;font-weight:600; }
.tag-pill button { display:grid;place-items:center;width:14px;height:14px;border:none;background:none;color:var(--text-muted);cursor:pointer;padding:0;border-radius:3px; }
.tag-add-input { padding:9px 12px;border-radius:6px;border:1px solid var(--border);background:var(--bg-surface);color:var(--text);font-size:.8rem;outline:none;font-family:inherit; }
.tag-add-input:focus { border-color:var(--primary); }
.tag-badge { display:inline-block;padding:4px 12px;border-radius:6px;background:rgba(47,125,246,0.1);border:1px solid rgba(47,125,246,0.2);color:var(--primary);font-size:.8rem;font-weight:600; }

/* ─── Revenus ─── */
.rev-mode-badge { display:inline-flex;align-items:center;gap:6px;padding:4px 12px;border-radius:20px;font-size:.72rem;font-weight:800;letter-spacing:.06em; }
.rev-mode-badge.test { background:rgba(245,179,66,.1);border:1px solid rgba(245,179,66,.25);color:#f5b342; }
.rev-mode-badge.live { background:rgba(110,231,183,.1);border:1px solid rgba(110,231,183,.25);color:#6ee7b7; }
.rev-filter { padding:8px 12px;border-radius:10px;border:1px solid var(--border);background:var(--bg-surface);color:var(--text);font-size:.82rem;font-weight:600;font-family:inherit;outline:none;cursor:pointer; }
.rev-filter:focus { border-color:var(--primary); }
.user-search { padding:8px 12px;border-radius:10px;border:1px solid var(--border);background:var(--bg-surface);color:var(--text);font-size:.82rem;font-family:inherit;outline:none;width:200px; }
.user-search:focus { border-color:var(--primary); }
.rev-account { display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:16px;padding:10px 14px;border-radius:10px;background:var(--bg-surface);border:1px solid var(--border);font-size:.8rem; }
.rev-account-id { font-family:ui-monospace,Consolas,monospace;color:var(--text-secondary); }
.rev-account-email { color:var(--text-muted); }
.rev-loading { padding:40px;text-align:center;color:var(--text-muted);font-size:.9rem; }
.rev-loading.error { color:var(--red); }
.rev-cards { display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:12px;margin-bottom:24px; }
.rev-card { display:grid;gap:4px;padding:16px;border-radius:12px;background:var(--bg-surface);border:1px solid var(--border); }
.rev-card.highlight { background:rgba(47,125,246,.06);border-color:rgba(47,125,246,.3); }
.rev-card-label { font-size:.7rem;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:var(--text-muted); }
.rev-card-val { font-size:1.35rem;font-weight:800;color:var(--text); }
.rev-card-val.muted { color:var(--text-secondary); }
.rev-card-sub { font-size:.72rem;color:var(--text-muted); }
.rev-section-title { font-size:.95rem;font-weight:700;margin:20px 0 10px; }
.rev-status { display:inline-block;padding:2px 10px;border-radius:20px;font-size:.7rem;font-weight:700;text-transform:capitalize; }
.rev-status.succeeded, .rev-status.paid { background:rgba(110,231,183,.1);color:#6ee7b7; }
.rev-status.pending { background:rgba(245,179,66,.1);color:#f5b342; }
.rev-status.failed { background:rgba(248,113,113,.1);color:#f87171; }
.mono { font-family:ui-monospace,Consolas,monospace;font-size:.74rem; }
</style>
