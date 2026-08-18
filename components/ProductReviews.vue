<template>
  <div class="reviews-section">
    <!-- Stats -->
    <div v-if="reviews.length" class="reviews-header">
      <div class="score-block">
        <strong class="score-num">{{ avgRating.toFixed(1) }}</strong>
        <div class="stars">
          <svg v-for="s in 5" :key="s" width="16" height="16" viewBox="0 0 24 24" :fill="s <= Math.round(avgRating) ? '#f5b342' : 'none'" :stroke="s <= Math.round(avgRating) ? '#f5b342' : 'var(--border)'" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
        </div>
        <span class="score-count">{{ countLabel }}</span>
      </div>
      <div class="dist-block">
        <div v-for="n in 5" :key="n" class="dist-row">
          <span class="dist-label">{{ 6 - n }}</span>
          <div class="dist-bar"><div class="dist-fill" :style="{ width: distPct(6 - n) }"></div></div>
          <span class="dist-count">{{ distCount(6 - n) }}</span>
        </div>
      </div>
    </div>

    <!-- Liste -->
    <div class="reviews-list">
      <div v-for="review in reviews" :key="review.id" class="review-card">
        <div class="rev-head">
          <img v-if="review.avatarUrl" :src="review.avatarUrl" class="rev-avatar" alt="" />
          <div v-else class="rev-avatar initial">{{ (review.displayName?.[0] || 'U').toUpperCase() }}</div>
          <div class="rev-meta">
            <div class="rev-name-row">
              <strong class="rev-name">{{ review.displayName || t('generic.user', 'Utilisateur') }}</strong>
              <span v-if="review.mine" class="rev-badge mine">{{ t('product.reviews_yours') }}</span>
              <span class="rev-badge verified"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>{{ t('product.reviews_verified') }}</span>
            </div>
            <div class="rev-stars">
              <svg v-for="s in 5" :key="s" width="13" height="13" viewBox="0 0 24 24" :fill="s <= review.rating ? '#f5b342' : 'none'" :stroke="s <= review.rating ? '#f5b342' : 'var(--border)'" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              <span class="rev-date">{{ formatDate(review.createdAt) }}</span>
            </div>
          </div>
        </div>
        <p class="rev-comment">{{ review.comment }}</p>
      </div>
      <p v-if="!reviews.length" class="reviews-empty">{{ t('product.reviews_empty') }}</p>
    </div>

    <!-- Saisie : réservée aux possesseurs -->
    <div class="review-form-wrap">
      <template v-if="!user">
        <div class="review-cta">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          <span>{{ t('product.reviews_login') }}</span>
          <NuxtLink class="cta-link" :to="'/login?redirect=' + encodeURIComponent(route.fullPath)">{{ t('nav.login') }}</NuxtLink>
        </div>
      </template>
      <template v-else-if="!owned">
        <div class="review-cta">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
          <span>{{ t('product.reviews_need_purchase') }}</span>
        </div>
      </template>
      <template v-else>
        <form class="review-form" @submit.prevent="submit">
          <div class="form-head">
            <h4>{{ myReview ? t('product.reviews_update_title') : t('product.reviews_write') }}</h4>
            <div class="star-input">
              <button v-for="s in 5" :key="s" type="button" class="star-btn" :class="{ active: s <= formRating }" @click="formRating = s" :aria-label="s + '/5'">
                <svg width="24" height="24" viewBox="0 0 24 24" :fill="s <= formRating ? '#f5b342' : 'none'" :stroke="s <= formRating ? '#f5b342' : 'var(--border-hover)'" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              </button>
            </div>
          </div>
          <textarea v-model="formComment" class="rev-textarea" rows="4" maxlength="1000" :placeholder="t('product.reviews_placeholder')"></textarea>
          <div class="form-actions">
            <button v-if="myReview" type="button" class="btn-delete" :disabled="deleting" @click="removeReview">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
              {{ t('product.reviews_delete') }}
            </button>
            <button type="submit" class="btn-submit" :disabled="submitting || !formRating || !formComment.trim()">
              {{ myReview ? t('product.reviews_update') : t('product.reviews_submit') }}
            </button>
          </div>
        </form>
      </template>
    </div>

    <ConfirmModal ref="confirmRef" />
    <ToastNotif ref="toastRef" />
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  product: any
  owned: boolean
}>()
const emit = defineEmits<{ (e: 'updated'): void }>()

const { t, locale } = useLang()
const { user } = useAuth()
const config = useRuntimeConfig()
const api = config.public.apiOrigin
const route = useRoute()

const toastRef = ref<InstanceType<typeof ToastNotif> | null>(null)
const confirmRef = ref<InstanceType<typeof ConfirmModal> | null>(null)

const formRating = ref(0)
const formComment = ref('')
const submitting = ref(false)
const deleting = ref(false)

const reviews = computed<any[]>(() => props.product?.reviews || [])
const myReview = computed<any | null>(() => reviews.value.find((r: any) => r.mine) || null)
const avgRating = computed(() => {
  if (!reviews.value.length) return 0
  const total = reviews.value.reduce((acc: number, r: any) => acc + Number(r.rating), 0)
  return total / reviews.value.length
})
const countLabel = computed(() => {
  const n = reviews.value.length
  if (locale.value === 'en') return n + (n > 1 ? ' reviews' : ' review')
  if (locale.value === 'tr') return n + ' yorum'
  return n + ' avis'
})

function distCount(star: number) {
  return reviews.value.filter((r: any) => Number(r.rating) === star).length
}
function distPct(star: number) {
  if (!reviews.value.length) return '0%'
  return Math.round((distCount(star) / reviews.value.length) * 100) + '%'
}

const dateLocale = computed(() => (locale.value === 'tr' ? 'tr-TR' : locale.value === 'en' ? 'en-GB' : 'fr-FR'))
function formatDate(d: string) {
  return new Date(d).toLocaleDateString(dateLocale.value, { day: 'numeric', month: 'long', year: 'numeric' })
}

// Pré-remplit le formulaire avec l'avis existant (pour modification)
watch(reviews, (revs) => {
  const mine = revs.find((r: any) => r.mine)
  if (mine) {
    formRating.value = Number(mine.rating)
    formComment.value = mine.comment
  } else {
    formRating.value = 0
    formComment.value = ''
  }
}, { immediate: true })

async function submit() {
  if (submitting.value) return
  if (!formRating.value || !formComment.value.trim()) return
  submitting.value = true
  try {
    await $fetch(api + '/api/reviews', {
      method: 'POST',
      credentials: 'include',
      body: { productId: props.product.id, rating: formRating.value, comment: formComment.value.trim() },
    })
    toastRef.value?.show('success', myReview.value ? t('product.reviews_updated') : t('product.reviews_submitted'))
    emit('updated')
  } catch (e: any) {
    toastRef.value?.show('error', e?.data?.message || t('product.reviews_error'))
  } finally {
    submitting.value = false
  }
}

async function removeReview() {
  if (!myReview.value || deleting.value) return
  const ok = await confirmRef.value?.ask({
    title: t('product.reviews_delete_confirm_title'),
    message: t('product.reviews_delete_confirm'),
    confirmText: t('product.reviews_delete'),
    danger: true,
  })
  if (!ok) return
  deleting.value = true
  try {
    await $fetch(api + '/api/reviews/' + myReview.value.id, { method: 'DELETE', credentials: 'include' })
    toastRef.value?.show('success', t('product.reviews_deleted'))
    emit('updated')
  } catch (e: any) {
    toastRef.value?.show('error', e?.data?.message || t('product.reviews_error'))
  } finally {
    deleting.value = false
  }
}
</script>

<style scoped>
.reviews-section { display: grid; gap: 28px; }

/* Stats */
.reviews-header { display: flex; gap: 32px; align-items: center; padding: 18px 20px; border-radius: 12px; background: var(--bg-card); border: 1px solid var(--border); }
.score-block { display: grid; gap: 4px; min-width: 120px; }
.score-num { font-size: 2rem; font-weight: 900; letter-spacing: -.03em; color: var(--text); line-height: 1; }
.score-block .stars { display: flex; gap: 2px; }
.score-count { font-size: .8rem; color: var(--text-muted); }
.dist-block { display: grid; gap: 5px; flex: 1; max-width: 320px; }
.dist-row { display: grid; grid-template-columns: 16px 1fr 24px; align-items: center; gap: 8px; }
.dist-label { font-size: .76rem; color: var(--text-secondary); text-align: right; }
.dist-count { font-size: .76rem; color: var(--text-muted); text-align: right; }
.dist-bar { height: 6px; border-radius: 3px; background: var(--bg-surface); overflow: hidden; }
.dist-fill { height: 100%; border-radius: 3px; background: linear-gradient(90deg, var(--primary), var(--accent)); }

/* Liste */
.reviews-list { display: grid; gap: 14px; }
.review-card { padding: 16px 18px; border-radius: 12px; border: 1px solid var(--border); background: var(--bg-card); }
.rev-head { display: flex; gap: 12px; align-items: center; margin-bottom: 10px; }
.rev-avatar { width: 40px; height: 40px; border-radius: 50%; object-fit: cover; flex-shrink: 0; }
.rev-avatar.initial { display: grid; place-items: center; background: linear-gradient(135deg, var(--primary), var(--accent)); color: #fff; font-weight: 800; font-size: .9rem; }
.rev-meta { display: grid; gap: 3px; min-width: 0; }
.rev-name-row { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
.rev-name { font-size: .86rem; font-weight: 700; color: var(--text); }
.rev-badge { display: inline-flex; align-items: center; gap: 3px; padding: 2px 7px; border-radius: 5px; font-size: .68rem; font-weight: 600; }
.rev-badge.verified { background: rgba(110, 231, 183, 0.1); border: 1px solid rgba(110, 231, 183, 0.25); color: var(--green); }
.rev-badge.mine { background: rgba(47, 125, 246, 0.1); border: 1px solid rgba(47, 125, 246, 0.25); color: var(--primary); }
.rev-stars { display: flex; align-items: center; gap: 2px; }
.rev-date { margin-left: 8px; font-size: .74rem; color: var(--text-muted); }
.rev-comment { margin: 0; font-size: .88rem; line-height: 1.6; color: var(--text-secondary); white-space: pre-line; }
.reviews-empty { text-align: center; padding: 32px; color: var(--text-muted); font-size: .88rem; }

/* Saisie */
.review-form-wrap { padding: 18px 20px; border-radius: 12px; border: 1px solid var(--border); background: var(--bg-surface); }
.review-cta { display: flex; align-items: center; gap: 10px; color: var(--text-secondary); font-size: .88rem; flex-wrap: wrap; }
.review-cta svg { color: var(--primary); flex-shrink: 0; }
.cta-link { color: var(--primary); font-weight: 700; text-decoration: none; }
.cta-link:hover { text-decoration: underline; }
.review-form { display: grid; gap: 12px; }
.form-head { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; }
.form-head h4 { margin: 0; font-size: .95rem; font-weight: 700; color: var(--text); }
.star-input { display: flex; gap: 2px; }
.star-btn { padding: 2px; border: none; background: transparent; cursor: pointer; transition: transform .1s; }
.star-btn:hover { transform: scale(1.12); }
.rev-textarea { width: 100%; padding: 12px 14px; border-radius: 10px; border: 1px solid var(--border); background: var(--bg-card); color: var(--text); font-family: inherit; font-size: .87rem; line-height: 1.5; resize: vertical; min-height: 96px; }
.rev-textarea:focus { outline: none; border-color: var(--primary); }
.rev-textarea::placeholder { color: var(--text-muted); }
.form-actions { display: flex; align-items: center; justify-content: space-between; gap: 10px; flex-wrap: wrap; }
.btn-submit { display: flex; align-items: center; gap: 8px; padding: 11px 22px; border-radius: 10px; border: none; background: linear-gradient(135deg, var(--primary), var(--accent)); color: #fff; font-size: .85rem; font-weight: 700; cursor: pointer; font-family: inherit; transition: all .2s; }
.btn-submit:hover:not(:disabled) { opacity: .9; transform: translateY(-1px); }
.btn-submit:disabled { opacity: .45; cursor: not-allowed; }
.btn-delete { display: flex; align-items: center; gap: 6px; padding: 9px 14px; border-radius: 10px; border: 1px solid rgba(248, 113, 113, 0.3); background: rgba(248, 113, 113, 0.08); color: var(--red); font-size: .8rem; font-weight: 600; cursor: pointer; font-family: inherit; transition: all .2s; }
.btn-delete:hover:not(:disabled) { background: rgba(248, 113, 113, 0.16); border-color: rgba(248, 113, 113, 0.5); }
.btn-delete:disabled { opacity: .5; cursor: not-allowed; }
</style>
