import { BatchedMesh, Group, MathUtils, Mesh, MeshBasicMaterial, MeshMatcapMaterial, Object3D, PlaneGeometry, TextureLoader } from 'three'
import LoaderManager from '@/js/managers/LoaderManager'
import { CircleGeometry, DynamicDrawUsage, InstancedMesh, Matrix4, MeshNormalNodeMaterial, MeshStandardNodeMaterial, MeshToonNodeMaterial, varying, vec3, Vector3 } from 'three/webgpu'
import { vertexBendBatchedNode, vertexBendNode } from '../tsl/utils'
import { physicalToStandardMatNode } from '../tsl/physicalToStandard'
import BendManager from '../managers/BendManager'
// import { Z_DISAPPEAR } from '../managers/TilesManager'

export default class Presents extends Group {
	material
	debug
	settings = {
		z: 0,
		matcap: null,
	}
	nbPresents = 20
	abstracts = []
	minY = 1

	constructor({ debug }) {
		super()

		const scene  = LoaderManager.get('presents').scene
		// console.log(scene)

		const obj1 = scene.getObjectByName('presentRoundRebuild')
		const geo = obj1.geometry

		geo.rotateX(Math.PI / 2)
		const s = 2
		geo.scale(s, s, s)
		geo.computeBoundingBox()

		const mat = new MeshStandardNodeMaterial({ map: obj1.material.map })

		this.mesh1 = new InstancedMesh(geo, mat, this.nbPresents)
		this.mesh1.instanceMatrix.setUsage(DynamicDrawUsage)

		this.add(this.mesh1)

		for (let i = 0; i < this.nbPresents; i++) {
			const abstract = {
				dummy: new Object3D(),
				hitted: false,
				active: false,
				magnet: false,
				index: i
			}
			this.abstracts.push(abstract)
			abstract.dummy.position.set(0, -100, 0)
			abstract.dummy.updateMatrix()
			this.mesh1.setMatrixAt(i, abstract.dummy.matrix)
		}

		this.mesh1.frustumCulled = false

		// for (let i = 0; i < scene.children.length; i++) {
		// 	const child = scene.children[i]
		// 	console.log(child)
		// 	// child.material = physicalToStandardMatNode(child.material)
		// 	this.add(child)

		// }

		setInterval(() => {

			this.drop()

		}, 1000)

	}

	getFree = () => {
		for (let i = 0; i < this.abstracts.length; i++) {
			const abstract = this.abstracts[i]
			if (!abstract.active) {
				abstract.dummy.position.copy(BendManager.santaPos)
				abstract.dummy.rotation.set(Math.random() * Math.PI * 2, Math.random() * Math.PI * 2, Math.random() * Math.PI * 2)
				abstract.dummy.scale.set(1, 1, 1)
				abstract.dummy.updateMatrix()
				abstract.active = true
				return abstract
			}
		}
		return null
	}

	drop() {
		this.getFree()

	}

	/**
	 * Update
	 */
	update({ delta }) {

		// Move groups
		// Group 1 / 2

		for (let i = 0; i < this.abstracts.length; i++) {
			const abstract = this.abstracts[i]
			if (abstract.active) {
				abstract.dummy.position.y -= 0.006 * delta
				abstract.dummy.position.z += delta * BendManager.speed * 0.4
				abstract.dummy.rotation.x += 0.004 * delta
				abstract.dummy.rotation.y += 0.001 * delta

				if (abstract.dummy.position.y < this.minY) {
					// reset
					abstract.dummy.scale.x -= 0.008 * delta
					abstract.dummy.scale.y -= 0.008 * delta
					abstract.dummy.scale.z -= 0.008 * delta

					if (abstract.dummy.scale.x < 0) {
						abstract.active = false
						abstract.dummy.position.y = -100
					}
				}

				abstract.dummy.updateMatrix()
				this.mesh1.setMatrixAt(abstract.index, abstract.dummy.matrix)
			}

		}

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
