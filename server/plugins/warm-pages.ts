import { warmPublic, warmMedia } from '../utils/warm'

export default defineNitroPlugin(() => {
  setTimeout(() => { warmPublic().then(() => warmMedia()).catch(() => {}) }, 10000)
})
