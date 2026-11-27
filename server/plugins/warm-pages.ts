import { warmPublic } from '../utils/warm'

export default defineNitroPlugin(() => {
  setTimeout(() => { warmPublic().catch(() => {}) }, 10000)
})
