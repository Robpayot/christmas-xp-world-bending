import query from './query'
import GPU from './gpu'

class Settings {
  tier
  dpr
  hasParallax
  hasShadows

  async init() {
    const gpu = new GPU()
    this.tier = gpu.tier
    this.dpr = getDPR(this.tier)

    this.hasShadows = this.tier >= 1

    this.pp = false

    Object.freeze(this)

    console.log('–––––')
    console.log('[Settings]', gpu)
    console.log('–––––')
  }
}

function getDPR(tier) {
  if (query('dpr')) return parseInt(query('dpr'), 10)

  switch (tier) {
    case 0:
      return 1
    case 1:
      return Math.min(1.25, window.devicePixelRatio || 1)
    case 2:
      return Math.min(2, window.devicePixelRatio || 1)
    case 3:
      return Math.min(2, window.devicePixelRatio || 1)
  }

  return window.devicePixelRatio || 1
}

export default new Settings()
