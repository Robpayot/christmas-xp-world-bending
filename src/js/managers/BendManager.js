import { uniform } from 'three/webgpu'
import Debugger from '@/js/managers/Debugger'
import { lerp, clamp } from 'three/src/math/MathUtils.js'
import CameraManager from './CameraManager'

const settings = { powerX: 28.8, backX: 0.12, powerY: 54.2, backY: 1.7 }

class BendManager {
	powerX = uniform(settings.powerX)
	backX = uniform(settings.backX)
	powerY = uniform(settings.powerY)
	backY = uniform(settings.backY)
	radius = 500
	progress = uniform(0)
	bend = uniform(0.22)
	maxBend = 2
	speed = 0.03
	initSpeed = this.speed
	scrollIncr = 0
	scrollResetForce = 0.13
	scrollCoef = 0.116
	lerp = 0.02
	speedCoef = 340

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

		window.addEventListener('DOMMouseScroll', this._handleScroll, false) // for Firefox
		window.addEventListener('mousewheel',  this._handleScroll, false)
	}

	/**
	 * Debug
	 */
	_createDebug() {
		if (!Debugger) return

		const debug = Debugger.addFolder({ title: 'BendManager', index: 2 })

		// debug.addBinding(this.progress, 'value', { min: 0, max: 1, label: 'progress' })
		debug.addBinding(this.bend, 'value', { min: -3, max: 3, label: 'bend' })
		debug.addBinding(this, 'speed', { min: 0, max: 0.1, step: 0.001 })
		debug.addBinding(this, 'scrollResetForce', { min: 0, step: 0.01 })
		debug.addBinding(this, 'scrollCoef', { min: 0, step: 0.001 })
		debug.addBinding(this, 'lerp', { min: 0, step: 0.01 })
		debug.addBinding(this, 'speedCoef', { min: 0, step: 1 })

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

	_handleScroll = (evt) => {
		if (CameraManager.active.isEnabled) return
		this.direction = (evt.detail < 0 || evt.wheelDelta > 0) ? 1 : -1
		this.scrollIncr += Math.abs(this.direction)

		// Use the value as you will
	}

	update({ time, delta }) {

		// this.scrollStrenght +=

		// this.scrollIncr = Math.max(0, (this.scrollIncr * this.scrollCoef) * delta)// reset scroll force
		this.scrollIncr = Math.max(0, (this.scrollIncr - this.scrollResetForce * delta))// reset scroll force

		const targetBend = this.scrollIncr * this.scrollCoef

		this.speed = this.initSpeed + this.scrollIncr / this.speedCoef
		this.bend.value = clamp(lerp(this.bend.value, targetBend, this.lerp), 0, this.maxBend)

	}

}

export default new BendManager()
