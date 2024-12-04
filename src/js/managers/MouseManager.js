import Debugger from '@/js/managers/Debugger'
import { lerp, clamp } from 'three/src/math/MathUtils.js'
import { roundTo } from '../utils/math'

class MouseManager {
	lerp = 0.015
	lerpLookAt = 0.1
	speedCoef = 340
	targetX = 0
	x = 0
	lookAtX = 0
	targetY = 0
	y = 0
	lookAtY = 0

	// negCoef = uniform(1)
	constructor() {
		this._createDebug()

		this._handleResize()
		window.addEventListener('mousemove',  this._handleMouseMove, { passive: false })
		window.addEventListener('resize',  this._handleResize, { passive: false })

	}

	/**
	 * Debug
	 */
	_createDebug() {
		if (!Debugger) return

		const debug = Debugger.addFolder({ title: 'MouseManager', index: 2 })

		// debug.addBinding(this.progress, 'value', { min: 0, max: 1, label: 'progress' })
		// debug.addBinding(this.bend, 'value', { min: -3, max: 3, label: 'bend' })
		// debug.addBinding(this, 'speed', { min: 0, max: 0.1, step: 0.001 })
		// // debug.addBinding(this, 'scrollResetForce', { min: 0, step: 0.01 })
		// debug.addBinding(this, 'scrollCoef', { min: 0, step: 0.001 })
		// debug.addBinding(this, 'lerp', { min: 0, step: 0.01 })
		// debug.addBinding(this, 'speedCoef', { min: 0, step: 1 })

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

	_handleResize = () => {
		this.w = window.innerWidth
		this.h = window.innerHeight
	}

	_handleMouseMove = (e) => {
		this.targetX = (e.clientX / this.w - 0.5) * 2
		this.targetY = -(e.clientY / this.h - 0.5) * 2

		this.currentEvent = e
		return false
	}

	// _handleScroll = (evt) => {
	// 	if (CameraManager.active.isEnabled) return
	// 	this.direction = (evt.detail < 0 || evt.wheelDelta > 0) ? 1 : -1
	// 	this.scrollIncr = this.scrollIncr + Math.abs(this.direction)

	// 	// Use the value as you will
	// }

	update({ time, delta }) {
		this.lookAtX = lerp(this.lookAtX, this.targetX, this.lerpLookAt)
		this.x = lerp(this.x, this.targetX, this.lerp)

		this.lookAtY = lerp(this.lookAtY, this.targetY, this.lerpLookAt)
		this.y = lerp(this.y, this.targetY, this.lerp)

	}

}

export default new MouseManager()
