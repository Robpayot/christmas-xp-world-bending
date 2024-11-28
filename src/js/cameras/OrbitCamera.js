// Vendor
import { PerspectiveCamera, Vector3 } from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'

// Constants
const DEFAULT_POSITION = new Vector3(50, 20, 0)

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
	}

	/**
   * Public
   */
	enable() {
		this.isEnabled = true
		this.controls.enabled = true
	}

	disable() {
		this.isEnabled = true
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
		const nearPlane = 0.1
		const farPlane = 10000

		const instance = new PerspectiveCamera(fieldOfView, aspectRatio, nearPlane, farPlane)
		instance.position.copy(this.settings.position)
		instance.lookAt(0, 0, 0)

		return instance
	}

	_createControls() {
		const controls = new OrbitControls(this.instance, this.renderer.domElement)
		controls.screenSpacePanning = true
		controls.enabled = false

		const savedTarget = JSON.parse(localStorage.getItem('camera-orbit-target'))
		if (savedTarget) {
			controls.target.x = savedTarget.x
			controls.target.y = savedTarget.y
			controls.target.z = savedTarget.z
		}

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
		this.debug.addButton({ title: 'Save position' }).on('click', () => {
			localStorage.setItem('camera-orbit-position', JSON.stringify(this.instance.position))
			localStorage.setItem('camera-orbit-target', JSON.stringify(this.controls.target))
		})
		this.debug.addButton({ title: 'Reset position' }).on('click', () => {
			localStorage.removeItem('camera-orbit-position')
			localStorage.removeItem('camera-orbit-target')

			this.instance.position.copy(DEFAULT_POSITION)
			this.controls.target.set(0, 0, 0)
			this.controls.update()
		})
	}

	_hideDebug() {
		this.debug?.dispose()
	}
}
