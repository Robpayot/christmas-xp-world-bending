import { Mesh, MeshBasicMaterial, MeshMatcapMaterial, Object3D, SphereGeometry, TextureLoader } from 'three'
import LoaderManager from '@/js/managers/LoaderManager'

const SPHERE_GEOMETRY = new SphereGeometry(1, 32, 32)

export default class Sphere extends Object3D {
	material
	debug
	settings = {
		z: 0,
		matcap: null,
	}
	constructor({ debug }) {
		super()

		this.debug = debug

		this._createMaterial()
		this._createMesh()

		this._createDebugFolder()
	}

	_createMaterial() {
		this.material = new MeshMatcapMaterial({ matcap: LoaderManager.assets['matcap'].texture })
		// this.material = new MeshBasicMaterial({ color:'red' })
	}

	_createMesh() {
		const mesh = new Mesh(SPHERE_GEOMETRY, this.material)
		this.add(mesh)
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

		const debug = this.debug.addFolder({ title: 'Sphere', expanded: true })

		debug.addBinding(this.settings, 'z').on('change', settingsChangedHandler)
		// debug
		//   .addBinding(this.material.matcap, 'image', {
		//     label: 'Texture',
		//     view: 'image',
		//     height: 100,
		//     showMonitor: true,
		//   })
		//   .on('change', ({ value }) => {
		//     this.material.matcap = new TextureLoader().load(value.src)
		//   })

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
