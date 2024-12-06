import { BatchedMesh, Group, MathUtils, Mesh, MeshBasicMaterial, MeshMatcapMaterial, Object3D, PlaneGeometry, TextureLoader } from 'three'
import LoaderManager from '@/js/managers/LoaderManager'
import { abs, CircleGeometry, DynamicDrawUsage, InstancedMesh, Matrix4, MeshNormalNodeMaterial, MeshStandardNodeMaterial, MeshToonNodeMaterial, varying, vec3, Vector3 } from 'three/webgpu'
import { vertexBendBatchedNode, vertexBendNode } from '../tsl/utils'
import { physicalToStandardMatNode } from '../tsl/physicalToStandard'
import BendManager from '../managers/BendManager'
import gsap from 'gsap'
import { dtAnimate } from '../utils/dtAnimate'
import { easeOutQuad } from '../utils/easing'
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
		const obj1 = scene.getObjectByName('presentRoundRebuild')
		const obj2 = scene.getObjectByName('presentGreen')

		for (let i = 0; i < 2; i++) {
			const obj = i === 0 ? obj1 : obj2
			const mesh = this.createInstancedMesh(obj)
			this.add(mesh)
			this.meshes.push(mesh)
		}

		setInterval(() => {
			this.drop()
		}, 1000)
	}

	createInstancedMesh(obj) {
		const geo = obj.geometry

		geo.rotateX(Math.PI / 2)
		const s = 2
		geo.scale(s, s, s)
		geo.computeBoundingBox()

		const mat = new MeshStandardNodeMaterial({ map: obj.material.map })

		const half = Math.floor(this.nbPresents / 2)

		const mesh = new InstancedMesh(geo, mat, half)
		mesh.instanceMatrix.setUsage(DynamicDrawUsage)
		mesh.frustumCulled = false

		for (let i = 0; i < half; i++) {
			const abstract = {
				dummy: new Object3D(),
				hitted: false,
				active: false,
				magnet: false,
				index: i,
				meshIndex: 0
			}
			this.abstracts.push(abstract)
			abstract.dummy.position.set(0, -100, 0)
			abstract.dummy.updateMatrix()

			mesh.setMatrixAt(i, abstract.dummy.matrix)
		}

		return mesh
	}

	getFree = (offset) => {
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

				abstract.initPos = abstract.dummy.position.clone()

				// impulse

				abstract.animImpulseX = {
					start: this.time,
					from: 0,
					to: MathUtils.randFloat(-1.5, 1.5) *  (offset + 2), //  MathUtils.randFloat(4, 5) * force,
					duration: 0.5,
					easing: easeOutQuad
				}

				abstract.animImpulseY = {
					start: this.time,
					from: 0,
					to: MathUtils.randFloat(6, 7), //  MathUtils.randFloat(4, 5) * force,
					duration: 0.5,
					easing: easeOutQuad
				}
				return abstract
			}
		}
		return null
	}

	drop() {
		const nb = MathUtils.randInt(1, 4)

		for (let i = 0; i < nb; i++) {
			this.getFree(i)
		}

	}

	/**
	 * Update
	 */
	update({ time, delta }) {
		this.time = time / 1000
		// if (!this.pause) return

		// Move groups
		// Group 1 / 2

		for (let i = 0; i < this.abstracts.length; i++) {
			const abstract = this.abstracts[i]
			if (abstract.active) {

				abstract.dummy.position.x = abstract.initPos.x + dtAnimate(this.time, abstract.animImpulseX)
				abstract.dummy.position.y = abstract.initPos.y + dtAnimate(this.time, abstract.animImpulseY)
				abstract.animImpulseY.to -= 0.01 * delta

				// abstract.dummy.position.y -= 0.00 * delta
				abstract.dummy.position.z += delta * BendManager.speed * 0.4
				abstract.dummy.rotation.x += 0.004 * delta
				abstract.dummy.rotation.y += 0.001 * delta

				// apply impulse
				abstract.impulse

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
