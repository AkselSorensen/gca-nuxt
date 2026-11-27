// Au démarrage : prépare en arrière-plan les miniatures de toutes les images (après les index SQL).
import { warmAllVariants } from '../utils/mediaVariants'

export default defineNitroPlugin(() => {
  setTimeout(() => { warmAllVariants().catch((e) => console.warn('[miniatures] échec :', e?.message || e)) }, 30_000)
})
