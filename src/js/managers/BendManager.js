import { uniform, Vector3 } from 'three/webgpu'
import Debugger from '@/js/managers/Debugger'
import { lerp, clamp } from 'three/src/math/MathUtils.js'
import { roundTo } from '../utils/math'
import { isFirefox, isMac, isSafari } from '../utils/detect'
import { isTouch } from '../utils/isTouch'

const FIREFOX_DELTA_MULTIPLIER = 0.9
const SAFARI_DELTA_MULTIPLIER = 0.9
const TIME_THRESHOLD = 200

class BendManager {
	radius = 500
	progress = uniform(0)
	bend = uniform(0.22)
	maxBend = 2
	speed = 0.03
	initSpeed = this.speed
	scrollIncr = 0
	// scrollResetForce = 0.13
	scrollCoef = 0.065
	lerp = 0.015
	speedCoef = 340
	targetBend = 0
	test = 0
	resetForce = 0
	deltaData = {
		delta: 0
	}
	santaPos = new Vector3()
	touchStartY = 0
	touchY = 0
	touchDeltaY = 0

	// negCoef = uniform(1)
	constructor() {
		this._createDebug()

		// window.addEventListener('DOMMouseScroll', this._handleScroll, false) // for Firefox
		window.addEventListener('wheel',  this._handleWheelEvent, { passive: false })

		if (isTouch()) {
			window.addEventListener("touchstart", this._handleTouchStart)
			window.addEventListener("touchmove", this._handleTouchMove)
			window.addEventListener("touchend", this._handleTouchEnd)
			this.isTouch = true
			this.maxBend = 10
		}

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
		// debug.addBinding(this, 'scrollResetForce', { min: 0, step: 0.01 })
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

	_handleWheelEvent = (e) => {
		this.currentEvent = e
		return false
	}

	// _handleScroll = (evt) => {
	// 	if (CameraManager.active.isEnabled) return
	// 	this.direction = (evt.detail < 0 || evt.wheelDelta > 0) ? 1 : -1
	// 	this.scrollIncr = this.scrollIncr + Math.abs(this.direction)

	// 	// Use the value as you will
	// }

	getDelta = (e) => {
		const direction = (e.deltaY && e.deltaY < 0) || e.detail < 0 || e.wheelDelta > 0 ? -1 : 1
		const delta = e.detail || e.wheelDelta || e.deltaY
		// console.log(delta)

		return {
			direction: delta === 0 && e.deltaY === 0 ? 0 : direction,
			delta: this.isTouch ? this.touchDeltaY : delta,
			original: e,
		}
	}

	// touch events
	_handleTouchStart = (e) => {
		this.touchStartY = e.touches[0].clientY
	}
	_handleTouchMove = (e) => {
		this.currentEvent = e
		// Calculate the delta as the difference between the current touch position and the start
		this.touchY = e.touches[0].clientY
		this.touchDeltaY = this.touchY - this.touchStartY

		// Update the touchStartY to continue detecting scrolling for longer swipes
		this.touchStartY = this.touchY

		// Prevent the default scrolling behavior if necessary
		// e.preventDefault()
	}

	_handleTouchEnd = () => {
	// Reset values when the touch ends
		this.touchStartY = 0
		this.touchY = 0
	}

	update({ time, delta }) {
		this.targetBend =  Math.max(0, lerp(this.targetBend, Math.abs(this.deltaData.delta), this.lerp))
		this.bend.value = clamp(this.targetBend * this.scrollCoef, 0, this.maxBend)
		// increase speed
		this.speed = this.initSpeed + this.targetBend / this.speedCoef

		// increase FOV

		// back Santa

		if (!this.currentEvent) {
			this.deltaData.delta = 0
			return
		}

		const now = Date.now()
		const deltaData = this.currentEvent ? this.getDelta(this.currentEvent) : this.getDelta(this.previousEvent)

		if (this.isTouch) {
			deltaData.delta *= 2
		} else {
			if (isFirefox) { deltaData.delta *= FIREFOX_DELTA_MULTIPLIER }
			if (isSafari) { deltaData.delta *= SAFARI_DELTA_MULTIPLIER }
			if (isMac) { deltaData.delta *= 0.15 } else {
				deltaData.delta *= 0.35
			}
		}

		if (this.singleEventMode) {
			if (now - this.lastTime > TIME_THRESHOLD) {
				this.lastTime = now
				this.currentDirection = deltaData.direction
				this.deltaData = deltaData
			}
		} else {
			this.deltaData = deltaData
		}

		this.currentEvent = null

		// Old Wheel

		// const total = this.scrollIncr + this.resetForce

		// // this.scrollStrenght +=
		// // TODO: fix chrome with no devtool not updateing well the minus scrollResetForce, maybe to small numbers?
		// this.scrollIncr = Math.max(0, roundTo((this.scrollIncr - this.scrollResetForce * delta) * 1000, 3) / 1000)
		// this.targetBend =  Math.max(0, lerp(this.targetBend, this.scrollIncr, this.lerp))
		// this.h1.innerHTML = Math.round(this.deltaData.delta)

		// // this.speed = this.initSpeed + this.scrollIncr / this.speedCoef
		// this.bend.value = clamp(this.targetBend * this.scrollCoef, 0, this.maxBend)

	}

}

export default new BendManager()
