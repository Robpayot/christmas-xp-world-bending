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
	meshes = []

	constructor({ debug }) {
		super()

		const scene  = LoaderManager.get('presents').scene
		console.log(scene)

		const obj1 = scene.getObjectByName('presentRoundRebuild')
		const geo = obj1.geometry

		geo.rotateX(Math.PI / 2)
		const s = 2
		geo.scale(s, s, s)
		geo.computeBoundingBox()

		const mat1 = new MeshStandardNodeMaterial({ map: obj1.material.map })

		const half = Math.floor(this.nbPresents / 2)

		this.meshes[0] = new InstancedMesh(geo, mat1, half)
		this.meshes[0].instanceMatrix.setUsage(DynamicDrawUsage)
		this.meshes[0].frustumCulled = false
		this.add(this.meshes[0])

		const obj2 = scene.getObjectByName('presentGreen')
		const geo2 = obj2.geometry

		geo2.rotateX(Math.PI / 2)
		geo2.scale(s, s, s)
		geo2.computeBoundingBox()

		const mat2 = new MeshStandardNodeMaterial({ map: obj2.material.map })

		this.meshes[1] = new InstancedMesh(geo2, mat2, half)
		this.meshes[1].instanceMatrix.setUsage(DynamicDrawUsage)
		this.meshes[1].frustumCulled = false
		this.add(this.meshes[1])

		for (let i = 0; i < this.nbPresents; i++) {

			const  meshIndex = i > half ? 0 : 1
			const abstract = {
				dummy: new Object3D(),
				hitted: false,
				active: false,
				magnet: false,
				index: i,
				meshIndex
			}
			this.abstracts.push(abstract)
			abstract.dummy.position.set(0, -100, 0)
			abstract.dummy.updateMatrix()
			console.log(i)

			this.meshes[meshIndex].setMatrixAt(i, abstract.dummy.matrix)
		}

		setInterval(() => {

			this.drop()

		}, 1000)

	}

	getFree = () => {
		for (let i = 0; i < this.abstracts.length; i++) {
			const abstract = this.abstracts[i]
			if (!abstract.active) {
				const meshIndex = MathUtils.randInt(0, 1)
				abstract.meshIndex = meshIndex
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
		if (!this.pause) return

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
				this.meshes[abstract.meshIndex].setMatrixAt(abstract.index, abstract.dummy.matrix)
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
