<template>
  <article class="product-card">
    <NuxtLink class="card-media" :to="'/product/' + product.slug">
      <img :src="thumb" :alt="product.title" loading="lazy" />
      <div v-if="product.discountPercent > 0" class="discount-badge">-{{ product.discountPercent }}%</div>
    </NuxtLink>
    <div class="card-body">
      <div class="card-category">{{ product.category || product.categoryName || '' }}</div>
      <h3><NuxtLink :to="'/product/' + product.slug">{{ product.title }}</NuxtLink></h3>
      <p v-if="product.shortDescription || product.short_description" class="card-desc">{{ product.shortDescription || product.short_description }}</p>
      <div class="card-footer">
        <div class="card-rating">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="#f5b342"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
          {{ Number(product.rating||0).toFixed(1) }} <small>({{ product.reviewCount || 0 }})</small>
        </div>
        <div class="card-price">
          <span v-if="product.discountPercent>0" class="old-price">{{ currency(product.oldPrice) }}</span>
          <strong>{{ currency(product.price) }}</strong>
        </div>
      </div>
    </div>
  </article>
</template>
<script setup>
const config = useRuntimeConfig()
const apiBase = config.public.apiBase
const props = defineProps({ product:{type:Object,required:true} })
const thumb = computed(() => props.product.thumbnail || props.product.media?.[0]?.thumbnail || props.product.media?.[0]?.url || 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=900&q=80')
const currency = (v) => Number(v||0).toFixed(2).replace('.',',') + '€'
</script>
<style scoped>
.product-card { border-radius:var(--radius); overflow:hidden; background:var(--bg-card); border:1px solid var(--border); transition:transform .25s,box-shadow .25s,border-color .25s; }
.product-card:hover { transform:translateY(-3px); box-shadow:0 12px 32px rgba(0,0,0,0.3); border-color:rgba(47,125,246,0.25); }
.card-media { position:relative; display:block; overflow:hidden; aspect-ratio:16/9; }
.card-media img { width:100%; height:100%; object-fit:cover; transition:transform .4s; }
.product-card:hover .card-media img { transform:scale(1.05); }
.discount-badge { position:absolute; top:10px; left:10px; padding:3px 8px; background:var(--red); color:#fff; font-size:.72rem; font-weight:700; border-radius:6px; }
.card-body { padding:14px 16px 16px; display:grid; gap:5px; }
.card-category { font-size:.7rem; font-weight:600; color:var(--text-muted); text-transform:uppercase; letter-spacing:.06em; }
.card-body h3 { font-size:.92rem; font-weight:700; }
.card-body h3 a { color:var(--text); transition:color .2s; }
.card-body h3 a:hover { color:var(--primary); }
.card-desc { font-size:.8rem; color:var(--text-secondary); line-height:1.4; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }
.card-footer { display:flex; align-items:center; justify-content:space-between; margin-top:4px; }
.card-rating { display:flex; align-items:center; gap:4px; font-size:.82rem; color:var(--text-secondary); }
.card-rating small { color:var(--text-muted); }
.card-price { display:flex; align-items:center; gap:6px; }
.card-price strong { font-size:.95rem; font-weight:800; color:var(--primary); }
.old-price { font-size:.75rem; color:var(--text-muted); text-decoration:line-through; }
</style>
