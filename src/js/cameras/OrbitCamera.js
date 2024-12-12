// Vendor
import { PerspectiveCamera, Vector3 } from 'three/webgpu'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import BendManager from '../managers/BendManager'
import { lerp } from 'three/src/math/MathUtils.js'

// Constants
export const DEFAULT_POSITION = new Vector3(0, 4, 18)
export const CONTROL_TARGET = new Vector3(0, 3, 0)

export default class OrbitCamera {
	debugContainer
	renderer
	near
	far
	fov
	name
	isEnabled
	instance
	controls
	settings
	bendFov = 0

	debug
	constructor({ debug, renderer, settings }) {
		// Options
		this.debugContainer = debug
		this.renderer = renderer
		this.settings = settings

		// Props
		this.name = null
		this.isEnabled = false

		// Setup
		this.instance = this._createInstance()
		this.controls = this._createControls()

		this.disable()

	}

	/**
   * Public
   */
	enable() {
		this.isEnabled = true
		this.controls.enabled = true
	}

	disable() {
		this.isEnabled = false
		this.controls.enabled = false
	}

	show() {
		this._showDebug()
	}

	hide() {
		this._hideDebug()
	}

	/**
   * Private
   */
	_createInstance() {
		const aspectRatio = window.innerWidth / window.innerHeight
		const fieldOfView = this.settings.fov
		const nearPlane = this.settings.near
		const farPlane = this.settings.far

		const instance = new PerspectiveCamera(fieldOfView, aspectRatio, nearPlane, farPlane)
		instance.position.copy(DEFAULT_POSITION)
		instance.lookAt(0, 0, 0)

		return instance
	}

	_createControls() {
		const controls = new OrbitControls(this.instance, this.renderer.domElement)
		controls.screenSpacePanning = true
		controls.enabled = false

		controls.target.x = CONTROL_TARGET.x
		controls.target.y = CONTROL_TARGET.y
		controls.target.z = CONTROL_TARGET.z

		controls.update()

		return controls
	}

	/**
   * Resize
   */
	resize({ width, height }) {
		this.instance.aspect = width / height
		this.instance.updateProjectionMatrix()
	}

	update({ time, delta }) {
		this.bendFov = lerp(this.bendFov,  BendManager.bend.value * 14, 0.2)
		this.instance.fov = this.settings.fov + this.bendFov
		this.instance.updateProjectionMatrix()
	}

	/**
   * Debug
   */
	_showDebug() {
		if (!this.debugContainer) return

		const _this = this
		function updateCamera() {
			_this.instance.updateProjectionMatrix()
		}

		const props = {
			frustum: { min: this.instance.near, max: this.instance.far },
		}

		this.debug = this.debugContainer.addFolder({ title: 'Orbit' })
		this.debug.addBinding(props, 'frustum', { min: 0.01, max: 5000, step: 1 }).on('change', () => {
			this.instance.near = 0.1
			this.instance.far = props.frustum.max
			updateCamera()
		})
		this.debug.addBinding(this.instance, 'fov', { min: 1, max: 180 }).on('change', updateCamera)
		this.debug.addBinding(this.instance, 'zoom').on('change', updateCamera)

		this.debug.addBinding(this, 'isEnabled').on('change', (e) => {
			if (e.value === true) {
				this.enable()
			} else {
				this.disable()
			}
		})
		this.debug.addButton({ title: 'Save position' }).on('click', () => {
			localStorage.setItem('camera-orbit-position', JSON.stringify(this.instance.position))
			localStorage.setItem('camera-orbit-target', JSON.stringify(this.controls.target))
			navigator.clipboard.writeText(JSON.stringify(this.instance.position, this.controls.target))
			console.log('copied to clipboard', this.instance.position, this.controls.target)

		})
		// this.debug.addButton({ title: 'Reset position' }).on('click', () => {
		// 	localStorage.removeItem('camera-orbit-position')
		// 	localStorage.removeItem('camera-orbit-target')

		// 	this.instance.position.copy(DEFAULT_POSITION)
		// 	this.controls.target.set(0, 0, 0)
		// 	this.controls.update()
		// })

	}

	_hideDebug() {
		this.debug?.dispose()
	}
}
