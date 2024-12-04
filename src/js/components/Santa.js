import { BatchedMesh, Group, MathUtils, Mesh, MeshBasicMaterial, MeshMatcapMaterial, Object3D, PlaneGeometry, TextureLoader } from 'three'
import LoaderManager from '@/js/managers/LoaderManager'
import { CircleGeometry, Matrix4, MeshNormalNodeMaterial, MeshStandardNodeMaterial, varying, vec3, Vector3 } from 'three/webgpu'
import { vertexBendBatchedNode, vertexBendNode } from '../tsl/utils'
import { physicalToStandardMatNode } from '../tsl/physicalToStandard'
import BendManager from '../managers/BendManager'
// import { Z_DISAPPEAR } from '../managers/TilesManager'

export default class Santa extends Group {
	material
	debug
	settings = {
		z: 0,
		matcap: null,
	}
	instances = []
	decorGeos = []
	nbDecor = 3000
	totalGeo = 0
	totalInstance = 0
	speed = 0.015
	tiles = []
	univers = 0
	geoByUniverse = [[], [], []]

	constructor({ debug }) {
		super()

		const scene  = LoaderManager.get('santa_sleight').scene

		this.add(scene)

		this.rotation.y = Math.PI / 2

		this.position.y = 5

		// for (let i = 0; i < scene.children.length; i++) {
		// 	const child = scene.children[i]
		// 	console.log(child)
		// 	// child.material = physicalToStandardMatNode(child.material)
		// 	this.add(child)

		// }

	}

	/**
	 * Update
	 */
	update({ delta }) {

		// Move groups
		// Group 1 / 2

	}

	resize({ width, height }) {}

	/**
	 * Debug
	 */
	_createDebugFolder() {
		if (!this.debug) return

		const settingsChangedHandler = () => {
			this.position.z = this.settings.z
		}

		const debug = this.debug.addFolder({ title: 'Decor', expanded: true })

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
