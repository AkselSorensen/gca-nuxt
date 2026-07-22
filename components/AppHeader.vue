<template>
  <header class="site-header">
    <div class="container header-inner">
      <NuxtLink to="/" class="logo">
        <img src="/logo.png" alt="GCA" class="logo-img" />
      </NuxtLink>
      <nav class="nav-links">
        <NuxtLink to="/" class="nav-link">Accueil</NuxtLink>
        <NuxtLink to="/catalogue" class="nav-link">Marketplace</NuxtLink>
        <NuxtLink to="/prestation" class="nav-link">Prestation</NuxtLink>
        <NuxtLink to="/about" class="nav-link">À propos</NuxtLink>
      </nav>
      <div class="header-actions">
        <NuxtLink to="/cart" class="cart-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 20a1 1 0 1 0 0 2 1 1 0 0 0 0-2z"/><path d="M20 20a1 1 0 1 0 0 2 1 1 0 0 0 0-2z"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
          <span v-if="cartCount" class="cart-badge">{{ cartCount }}</span>
        </NuxtLink>
        <template v-if="!user">
          <NuxtLink to="/login" class="btn btn-ghost">Connexion</NuxtLink>
          <NuxtLink to="/register" class="btn btn-primary">S'inscrire</NuxtLink>
        </template>
        <template v-else>
          <div class="user-dropdown" @click="dropdownOpen = !dropdownOpen" v-click-outside="() => dropdownOpen = false">
            <div class="user-menu">
              <div class="user-avatar">{{ user.displayName?.[0] || user.username?.[0] || user.email?.[0] || '?' }}</div>
              <span class="user-name">{{ user.displayName || user.username || user.email?.split('@')[0] }}</span>
              <svg class="chevron" :class="{ open: dropdownOpen }" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
            </div>
            <Transition name="drop">
              <div v-if="dropdownOpen" class="dropdown-menu">
                <NuxtLink to="/seller/account" class="drop-item"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> Mon profil</NuxtLink>
                <NuxtLink to="/downloads" class="drop-item"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> Mes téléchargements</NuxtLink>
                <NuxtLink v-if="user.role === 'seller' || user.role === 'admin'" to="/seller/account" class="drop-item"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg> Espace vendeur</NuxtLink>
                <NuxtLink v-if="user.role === 'admin'" to="/admin" class="drop-item"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg> Administration</NuxtLink>
                <div class="drop-divider"></div>
                <button @click="logout" class="drop-item danger"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg> Déconnexion</button>
              </div>
            </Transition>
          </div>
        </template>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
const { user, logout } = useAuth()
const dropdownOpen = ref(false)
const cartCount = ref(0)

function onClickOutside(e: MouseEvent) {
  const target = e.target as HTMLElement
  if (!target.closest('.user-dropdown')) dropdownOpen.value = false
}

onMounted(() => document.addEventListener('click', onClickOutside))
onUnmounted(() => document.removeEventListener('click', onClickOutside))

// Update cart count from localStorage
function updateCartCount() {
  try {
    const saved = JSON.parse(localStorage.getItem('gsa-cart') || '[]')
    cartCount.value = saved.length
  } catch { cartCount.value = 0 }
}
onMounted(() => {
  updateCartCount()
  window.addEventListener('storage', updateCartCount)
  // Custom event for same-tab updates
  window.addEventListener('cart-updated', updateCartCount)
})
onUnmounted(() => {
  window.removeEventListener('storage', updateCartCount)
  window.removeEventListener('cart-updated', updateCartCount)
})
</script>

<style scoped>
.site-header { position:sticky; top:0; z-index:100; background:rgba(10,14,20,0.85); backdrop-filter:blur(16px); border-bottom:1px solid var(--border); }
.header-inner { display:flex; align-items:center; justify-content:space-between; height:64px; gap:24px; }
.logo { display:flex; align-items:center; gap:10px; flex-shrink:0; }
.logo-icon { width:36px; height:36px; display:grid; place-items:center; background:linear-gradient(135deg,var(--primary),var(--accent)); border-radius:10px; color:#fff; font-weight:900; font-size:1.1rem; }
.logo-img { height:36px;width:auto; }
.logo-text { font-size:1.2rem; font-weight:800; letter-spacing:-0.03em; }
.nav-links { display:flex; gap:4px; }
.nav-link { padding:8px 16px; border-radius:8px; font-size:0.9rem; font-weight:500; color:var(--text-secondary); transition:all .2s; text-decoration:none; }
.nav-link:hover { color:var(--text); background:rgba(255,255,255,0.04); }
.header-actions { display:flex; align-items:center; gap:8px; }

.btn { padding:8px 18px; border-radius:8px; font-size:0.88rem; font-weight:600; transition:all .2s; text-decoration:none; }
.btn-ghost { color:var(--text-secondary); } .btn-ghost:hover { color:var(--text); background:rgba(255,255,255,0.04); }
.btn-primary { background:linear-gradient(135deg,var(--primary),var(--accent)); color:#fff; }
.btn-primary:hover { opacity:0.9; transform:translateY(-1px); }

.cart-icon { position:relative;padding:6px;border-radius:8px;color:var(--text-secondary);transition:all .2s;margin-right:4px; }
.cart-icon:hover { color:var(--text);background:rgba(255,255,255,0.04); }
.cart-badge { position:absolute;top:-2px;right:-2px;width:18px;height:18px;border-radius:50%;background:var(--primary);color:#fff;font-size:.62rem;font-weight:800;display:grid;place-items:center; }
.btn-admin { background:linear-gradient(135deg,#dc2626,#4f46e5);color:#fff;font-size:.82rem; }
.btn-seller { background:linear-gradient(135deg,#6ee7b7,#2f7df6);color:#fff;font-size:.82rem; }
.btn-admin:hover,.btn-seller:hover { opacity:.9; }
.btn-logout { padding:7px 14px;border-radius:6px;border:1px solid rgba(248,113,113,0.2);background:rgba(248,113,113,0.06);color:var(--red);font-size:.82rem;font-weight:600;cursor:pointer;font-family:inherit; }
.btn-logout:hover { background:rgba(248,113,113,0.12); }

.user-menu { display:flex;align-items:center;gap:8px;padding:4px 12px;border-radius:8px;background:var(--bg-surface);border:1px solid var(--border); }
.user-avatar { width:28px;height:28px;border-radius:50%;background:linear-gradient(135deg,var(--primary),var(--accent));display:grid;place-items:center;color:#fff;font-size:.72rem;font-weight:800;text-transform:uppercase; }
.user-name { font-size:.82rem;font-weight:600;color:var(--text); }
.chevron { color:var(--text-muted);transition:transform .2s; }
.chevron.open { transform:rotate(180deg); }

.user-dropdown { position:relative;cursor:pointer; }
.dropdown-menu { position:absolute;top:calc(100% + 8px);right:0;min-width:220px;background:var(--bg-card);border:1px solid var(--border);border-radius:10px;overflow:hidden;z-index:200;box-shadow:0 8px 32px rgba(0,0,0,0.3);padding:4px; }
.drop-item { display:flex;align-items:center;gap:10px;padding:9px 12px;border-radius:6px;font-size:.83rem;color:var(--text);text-decoration:none;transition:background .15s;cursor:pointer;border:none;background:transparent;width:100%;text-align:left;font-family:inherit; }
.drop-item svg { color:var(--text-muted);flex-shrink:0; }
.drop-item:hover { background:rgba(255,255,255,0.04); }
.drop-item.danger { color:var(--red); }
.drop-item.danger svg { color:var(--red); }
.drop-divider { height:1px;background:var(--border);margin:4px 8px; }

.drop-enter-active { transition:all .2s cubic-bezier(.22,1,.36,1); }
.drop-leave-active { transition:all .15s ease-in; }
.drop-enter-from { opacity:0;transform:translateY(-6px) scale(.95); }
.drop-leave-to { opacity:0;transform:translateY(-6px) scale(.95); }

@media(max-width:768px){ .nav-links,.btn-ghost,.user-name{display:none} }
</style>
