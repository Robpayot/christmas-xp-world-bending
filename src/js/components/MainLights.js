import { AmbientLight, Color, DirectionalLight, Group } from 'three'

export default class MainLights extends Group {
	material
	debug
	settings = {
		z: 0,
		matcap: null,
	}
	constructor({ debug, scene }) {
		super()

		this.debug = debug

		const colors = {
			sun: new Color('#9874d1'),
			ambient: new Color('#2685b1'),
		}
		// const sun = new DirectionalLight(colors.sun.convertLinearToSRGB(), 3.3)
		const ambient = new AmbientLight(new Color('#9874d1'), 0.7) // Soft white light
		// there is an inversion on Decor X --> Y / Y --> X / Z --> Z
		// sun.position.set(-6.15, 2.68, -1.48)   // Position the sun

		scene.add(ambient)
		// scene.add(sun)

		this._createDebugFolder()
	}

	/**
	 * Update
	 */
	update({ time, delta }) {}

	resize({ width, height }) {}

	/**
	 * Debug
	 */
	_createDebugFolder() {
		if (!this.debug) return

		const settingsChangedHandler = () => {
			this.position.z = this.settings.z
		}

		const debug = this.debug.addFolder({ title: 'MainLights', expanded: true })

		debug.addBinding(this.settings, 'z').on('change', settingsChangedHandler)

		const btn = debug.addButton({
			title: 'Copy settings',
			label: 'copy', // optional
		})

		btn.on('click', () => {
			navigator.clipboard.writeText(JSON.stringify(this.settings))
			console.log('copied to clipboard', this.settings)
		})

		return debug
	}
}
