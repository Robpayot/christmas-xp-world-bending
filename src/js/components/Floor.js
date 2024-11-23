import { Mesh, MeshBasicMaterial, MeshMatcapMaterial, Object3D, PlaneGeometry, TextureLoader } from 'three'
import LoaderManager from '@/js/managers/LoaderManager'
import BendManager from '../managers/BendManager'
import { CircleGeometry, MeshNormalNodeMaterial, MeshStandardNodeMaterial } from 'three/webgpu'
import { vertexBendNode, vertexBendSphereNode } from '../tsl/utils'

const GEOMETRY = new PlaneGeometry(BendManager.radius, BendManager.radius, 32, 32)
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
		this.material = new MeshNormalNodeMaterial({ wireframe: true })

		this.material.vertexNode = vertexBendNode()
		// this.material = new MeshBasicMaterial({ color:'red' })
	}

	_createMesh() {
		const mesh = new Mesh(GEOMETRY, this.material)
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
