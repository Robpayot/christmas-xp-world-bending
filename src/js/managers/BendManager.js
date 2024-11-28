import { uniform } from 'three/webgpu'
import Debugger from '@/js/managers/Debugger'

const settings = { powerX: 28.8, backX: 0.12, powerY: 54.2, backY: 1.7 }

class BendManager {
	powerX = uniform(settings.powerX)
	backX = uniform(settings.backX)
	powerY = uniform(settings.powerY)
	backY = uniform(settings.backY)
	radius = 500
	progress = uniform(0)
	deep = uniform(1.5)

	copy = () => {
		const settings = {
			powerX: this.powerX.value,
			backX: this.backX.value,
			powerY: this.powerY.value,
			backY: this.backY.value,
		}
		navigator.clipboard.writeText(JSON.stringify(settings))
		console.log('copied to clipboard', settings)
	}

	// negCoef = uniform(1)
	constructor() {
		this._createDebug()
	}

	/**
	 * Debug
	 */
	_createDebug() {
		if (!Debugger) return

		const debug = Debugger.addFolder({ title: 'BendManager', index: 2 })

		debug.addBinding(this.progress, 'value', { min: 0, max: 1, label: 'progress' })
		debug.addBinding(this.deep, 'value', { min: -3, max: 3, label: 'deep' })

		// this.#debug.addButton({ title: "Reset position" }).on("click", () => {
		//   localStorage.removeItem("camera-orbit-position")
		//   localStorage.removeItem("camera-orbit-target")

		//   this.#instance.position.copy(DEFAULT_POSITION)
		//   this.#controls.target.set(0, 0, 0)
		//   this.#controls.update()
		// })
		// debug.addBinding(this, 'copy').name('Copy')
		return debug
	}
}

export default new BendManager()
