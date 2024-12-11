import { PerspectiveCamera } from 'three'

export default class MainCamera {
	settings
	scene
	camera
	index = 0
	instance
	name

	constructor({ scene, settings, renderer, debug }) {
		this.debugContainer = debug
		this.scene = scene
		this.settings = settings

		// Setup
		this.instance = this._createInstance()
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

	/**
   * Public
   */
	enable() {
		this._isEnabled = true
	}

	disable() {
		this._isEnabled = false
	}

	show() {
		this._showDebug()
	}

	hide() {
		this._hideDebug()
	}

	// handleMouseMove = (e) => {
	//   const { x, y } = e.detail
	//   const forceX = this.rotateForceX
	//   const forceY = this.rotateForceY

	//   this.targetRotateX = y * forceX
	//   this.targetRotateY = -x * forceY
	// }

	update(deltaTime) {
		// if (!ResizeManager.isTouch) {
		//   this.mouseMoveCamera(deltaTime)
		// }
	}

	mouseMoveCamera(deltaTime) {
		// if (this.camera.rotation.x !== degToRad(this.targetRotateX)) {
		//   this.camera.rotation.x = lerp(this.camera.rotation.x, degToRad(this.targetRotateX), this.coefRotate * deltaTime)
		// }
		// if (this.camera.rotation.y !== degToRad(this.targetRotateY)) {
		//   this.camera.rotation.y = lerp(this.camera.rotation.y, degToRad(this.targetRotateY), this.coefRotate * deltaTime)
		// }
	}

	resize({ width, height }) {
		this.instance.aspect = width / height
		this.instance.updateProjectionMatrix()
	}

	destroy() {
		this.events(false)
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

		this.debug = this.debugContainer.addFolder({ title: 'Main Camera' })
		this.debug.addBinding(props, 'frustum', { min: 0.01, max: 5000, step: 1 }).on('change', () => {
			this.instance.near = 0.1
			this.instance.far = props.frustum.max
			updateCamera()
		})
		this.debug.addBinding(this.instance, 'fov', { min: 1, max: 180 }).on('change', updateCamera)
		this.debug.addBinding(this.instance, 'position').on('change', updateCamera)
		this.debug.addButton({ title: 'Save position' }).on('click', () => {
			navigator.clipboard.writeText(JSON.stringify(this.instance.position))
			console.log('copied to clipboard', this.instance.position)
		})
	}

	_hideDebug() {
		this.debug?.dispose()
	}
}
