import { Mesh, MeshBasicMaterial, MeshMatcapMaterial, Object3D, PlaneGeometry, TextureLoader } from 'three'
import { color, MeshLambertNodeMaterial, MeshNormalNodeMaterial, MeshStandardNodeMaterial } from 'three/webgpu'
import { vertexBendNode } from '../tsl/utils'
import SETTINGS from '../views/settings'

const SIZE = SETTINGS.world.size
const FACES = 100
const GEOMETRY = new PlaneGeometry(SIZE * 2, SIZE, FACES, FACES)
// const GEOMETRY = new CircleGeometry(BendManager.radius, 32)
GEOMETRY.rotateX(-Math.PI / 2)

export default class Floor extends Object3D {
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
		this.material = new MeshStandardNodeMaterial({ wireframe: false, color: 'white' })

		this.material.vertexNode = vertexBendNode()
		// this.material = new MeshBasicMaterial({ color:'red' })
	}

	_createMesh() {
		const mesh = new Mesh(GEOMETRY, this.material)
		// mesh.scale.set(10, 1, 10)
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

		const debug = this.debug.addFolder({ title: 'Floor', expanded: true })

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
