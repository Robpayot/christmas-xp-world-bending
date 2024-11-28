import { BatchedMesh, Group, MathUtils, Mesh, MeshBasicMaterial, MeshMatcapMaterial, Object3D, PlaneGeometry, TextureLoader } from 'three'
import LoaderManager from '@/js/managers/LoaderManager'
import BendManager from '../managers/BendManager'
import { CircleGeometry, MeshNormalNodeMaterial, MeshStandardNodeMaterial, varying, vec3 } from 'three/webgpu'
import { vertexBendBatchedNode, vertexBendNode, vertexBendSphereNode } from '../tsl/utils'
import { physicalToStandardMatNode } from '../tsl/physicalToStandard'

const GEOMETRY = new PlaneGeometry(BendManager.radius, BendManager.radius, 32, 32)
// const GEOMETRY = new CircleGeometry(BendManager.radius, 32)
GEOMETRY.rotateX(-Math.PI / 2)

export default class Decor extends Group {
	material
	debug
	settings = {
		z: 0,
		matcap: null,
	}
	instances = []
	decorGeos = []
	nbDecor = 50
	totalGeo = 0
	totalInstance = 0
	constructor({ debug }) {
		super()

		const scene  = LoaderManager.get('decor').scene

		// Keep small assets
		for (let i = 100; i >= 0; i--) { //
			scene.remove(scene.children[i])
		}

		this.debug = debug
		const info = { maxIndices: 0, maxVertices: 0 }

		for (let i = 0; i < scene.children.length; i++) {
			const child = scene.children[i]
			if (child.geometry) {

				if (child.material.isMeshPhysicalMaterial || child.material.isMeshStandardMaterial) {
					child.material = physicalToStandardMatNode(child.material)
				}
				const indices =  child.geometry.index.count
				const vertices = child.geometry.attributes.position.count
				info.maxIndices += indices
				info.maxVertices += vertices
				child.geometry.computeBoundingSphere()
				child.geometry.computeVertexNormals()
				this.decorGeos.push(child.geometry)
			}
		}

		this.mesh = this._createMesh(info.maxVertices, info.maxIndices, scene.children[0].material)
		this._addGeometries(this.decorGeos)
		this._addInstances(this.decorGeos)

		// Bounding sphere separation

		// for (let i = 0; i < geometries.length; i++) {
		// 	const geometry = geometries[i]
		// 	mesh.addGeometry(geometry)
		// }

		// this._createMaterial()
		// this._createMesh()

		this._createDebugFolder()
	}

	_createMaterial() {
		this.material = new MeshNormalNodeMaterial({ wireframe: true })

		this.material.vertexNode = vertexBendNode()
		// this.material = new MeshBasicMaterial({ color:'red' })
	}

	_createMesh(maxVertices, maxIndices, material) {
		const mesh = new BatchedMesh(this.nbDecor, maxVertices, maxIndices, material)
		// mesh.perObjectFrustumCulled = perObjectFrustumCulled.value
		// mesh.sortObjects = sortObjects.value
		this.add(mesh)

		// WGSL
		const varWorldPos = varying(vec3(0))
		const varNormalLocal = varying(vec3(0))

		// if (bendMode.value) {
		material.vertexNode = vertexBendBatchedNode(mesh, varWorldPos, varNormalLocal)
		// 	material.normalNode = transformNormalToView(varNormalLocal) // Fix normals, issue on instancedMesh and Batched
		// 	material.outputNode = fragmentFogNode(varWorldPos)
		// }
		return mesh
	}

	_addGeometries(geometries) {
		for (let i = 0; i < geometries.length; i++) {
			const geometry = geometries[i]
			this.mesh.addGeometry(geometry)
			this.totalGeo++
		}
	}

	_addInstances() {

		const dummy = new Object3D()
		let x = -1
		let z = 0
		// for (let i = 0; i < this.nbDecor; i++) {
		// 	x *= -1
		// 	const id = MathUtils.randInt(0, this.decorGeos.length - 1)
		// 	this.mesh.addInstance(id) // id
		// 	const dist = 4.5 / 2 + this.decorGeos[id].boundingSphere.radius + MathUtils.randFloat(-.5, 7)
		// 	dummy.position.set(0, 0, z)
		// 	dummy.rotation.set(0, MathUtils.randFloat() * Math.PI * 2, 0)
		// 	dummy.scale.set(.9, .9, .9)
		// 	dummy.updateMatrix()
		// 	this.mesh.setMatrixAt(i, dummy.matrix)
		// 	// z += 1 / this.nbDecor
		// }

		for (let i = 0; i < this.nbDecor; i++) {
			x *= -1
			const geoId = MathUtils.randInt(0, this.baseGeoCount - 1)
			this.mesh.addInstance(i)

			const dummy = new Object3D()
			const id = MathUtils.randInt(0, this.decorGeos.length - 1)

			const dist = 4.5 / 2 + this.decorGeos[id].boundingSphere.radius + MathUtils.randFloat(-.5, 7)
			dummy.position.set(x * dist, 0, z)
			// dummy.position.set(x * dist, 0, z)
			// dummy.rotation.set(0, random() * Math.PI * 2, 0)
			// dummy.scale.set(.9, .9, .9)
			// dummy.rotation.set(0, MathUtils.randFloat() * Math.PI * 2, 0)
			// dummy.scale.set(.9, .9, .9)
			// dummy.position.copy(BACTH_FIX_DEF_POS) // TODO: check
			dummy.updateMatrix()
			this.mesh.setMatrixAt(i, dummy.matrix)
			this.instances.push({ id: i, geometryId: geoId, dummy })

			z -= 50 / this.nbDecor

			this.totalInstance++
		}

		// const hLength = Math.ceil(this.instances.length / 2)

		// this.tiles[0] = this.instances.slice(0, hLength)
		// this.tiles[1] = this.instances.slice(hLength, this.instances.length)
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
