// TODO: Seeds

// import { playMusic } from "@/playSound"
import { GAMEPLAY } from "../settings/gameplay"

export const TILE_SIZE = 100 // 200
export const Z_DISAPPEAR = -10
// Swap 2 tiles infinitly

// Create a tile, order:
// 1. Decor
// 2. Ramps
// 3. Obstacles (avoid Ramps)
// 4. Items (avoid Obstacles, adapt to Ramps)
// 5. Bonus (avoid Obstacles, adapt to Ramps)
class TilesManager {
	range = TILE_SIZE * 2 //
	z = TILE_SIZE // progress
	index = 0
	current = 1
	univers = 0
	lastUnivers = 0
	stepUnivers = GAMEPLAY.univers_step
	constructor() {

	}

	initEntities({ decor }) {
		this.decor = decor

	}

	update({ time, delta }) {

		this.z -= delta

		if (this.z < 0) {
			this.add()
		}

		this.decor.update(delta)

	}

	add(initDisplay = false) {
		// initDisplay == when you start the game, move everything 1 tile closer to directly have obstacles
		// remove last tile and create a new one, push it back (z = range)
		this.z = TILE_SIZE

		if (initDisplay) {
			this.decor.updateTiles(0, true, true) // from 0 to 100
			this.decor.updateTiles(1, false, true)  // from 100 to 200
		} else {
			this.decor.updateTiles(this.index)

			this.index++
			if (this.index > 1) {
				this.index = 0
			}
		}

		this.lastUnivers = this.univers

	}

	updateUnivers() {
		if (this.current % this.stepUnivers === 0) { // every 3, TODO: better random

			// change univers
			this.univers = (this.univers + 1) % 3

			if (this.lastUnivers !== this.univers) {
				this.lane?.changeUnivers(this.lastUnivers, this.univers)
				this.decor.changeUnivers(this.lastUnivers, this.univers)
				this.changeMusic()
			}
		}
	}

	changeMusic() {
		// switch (this.univers) {
		// 	case 0:
		// 		playMusic('03_SOUND_DESIGN_ENVIRONNEMENT/VILLAGE/WG_VILLAGE_COMP', 1500)
		// 		break
		// 	case 1:
		// 		playMusic('03_SOUND_DESIGN_ENVIRONNEMENT/FORÊT/WG_WINDY_COMP', 1500)
		// 		break
		// 	case 2:
		// 		playMusic('03_SOUND_DESIGN_ENVIRONNEMENT/GROTTE/WG_GROTTE_COMP', 1500)
		// 		break
		// }
	}

	restart() {
		this.z = TILE_SIZE
		this.index = 0
		this.current = 1
		this.univers = 0
		this.lastUnivers = 0

		this.decor?.restart()

		this.add(true)
	}
}

export default new TilesManager()
