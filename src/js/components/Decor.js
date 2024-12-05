import { BatchedMesh, Group, MathUtils, Mesh, MeshBasicMaterial, MeshMatcapMaterial, Object3D, PlaneGeometry, TextureLoader } from 'three'
import LoaderManager from '@/js/managers/LoaderManager'
import { CircleGeometry, Matrix4, MeshNormalNodeMaterial, MeshStandardNodeMaterial, varying, vec3, Vector3 } from 'three/webgpu'
import { vertexBendBatchedNode, vertexBendNode } from '../tsl/utils'
import { physicalToStandardMatNode } from '../tsl/physicalToStandard'
import TilesManager, { TILE_SIZE, TILE_WIDE } from '../managers/TilesManager'
import BendManager from '../managers/BendManager'
// import { Z_DISAPPEAR } from '../managers/TilesManager'

export default class Decor extends Group {
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

		const scene  = LoaderManager.get('decor').scene
		const mainTexture = LoaderManager.get('texture_main').texture
		mainTexture.flipY = false
		mainTexture.needsUpdate = true

		// Keep small assets
		for (let i = 100; i >= 0; i--) { //
			// scene.remove(scene.children[i])
		}

		this.debug = debug
		const info = { maxIndices: 0, maxVertices: 0 }
		let lastMaterial
		const scaleGeo = 0.5

		const addMeshInfo = (mesh) => {
			if (mesh.material.isMeshPhysicalMaterial || mesh.material.isMeshStandardMaterial) {
				mesh.material = physicalToStandardMatNode(mesh.material)
				mesh.material.flatShading = false
				// console.log(mesh.material)

			}

			// mesh.material.transparent = false // Ensure transparency is disabled if not intended
			// mesh.material.needsUpdate = true

			lastMaterial = mesh.material
			const indices = mesh.geometry.index.count
			const vertices = mesh.geometry.attributes.position.count
			info.maxIndices += indices
			info.maxVertices += vertices

			mesh.material.map = mainTexture

			const scalingMatrix = new Matrix4()
			scalingMatrix.makeScale(scaleGeo, scaleGeo, scaleGeo) // Scale x, y, z by 2

			// Apply the scaling matrix to the geometry
			mesh.geometry.applyMatrix4(scalingMatrix)

			mesh.geometry.computeBoundingSphere()
			mesh.geometry.computeVertexNormals()
			this.decorGeos.push({ geo: mesh.geometry, name: mesh.name })
		}

		for (let i = 0; i < scene.children.length; i++) {
			const child = scene.children[i]
			if (child.geometry) {
				addMeshInfo(child)
			} else if (child.children[0]?.geometry) {
				addMeshInfo(child.children[0])
			}
		}

		// lastMaterial.map = null
		console.log(scene.children[0])

		this.mesh = this._createMesh(info.maxVertices, info.maxIndices, scene.children[0].material)
		this._addGeometries(this.decorGeos)
		this._addInstances()

		this._createDebugFolder()
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
		material.flatShading = true

		material.needsUpdate = true

		// console.log(material)
		// 	material.normalNode = transformNormalToView(varNormalLocal) // Fix normals, issue on instancedMesh and Batched
		// 	material.outputNode = fragmentFogNode(varWorldPos)
		// }
		return mesh
	}

	_addGeometries(geometries) {
		for (let i = 0; i < geometries.length; i++) {
			const { geo, name } = geometries[i]
			this.mesh.addGeometry(geo)
			if (name.includes('fir_snow')) {
				this.geoByUniverse[0].push(i)
				if (name.includes('00')) {
					this.geoByUniverse[1].push(i)
					this.geoByUniverse[2].push(i)
				}
			} else if (name.includes('rock') || name.includes('stone_')) {
				this.geoByUniverse[1].push(i)
			} else {
				this.geoByUniverse[2].push(i)
			}
			this.totalGeo++
		}
	}

	getRandomGeoByUnivers(univers) {
		const geosArr = this.geoByUniverse[univers]

		const rd =  MathUtils.randInt(0, geosArr.length - 1)
		return geosArr[rd]
	}

	_addInstances() {
		let x = -1
		let z = 0

		for (let i = 0; i < this.nbDecor; i++) {
			x *= -1

			const dummy = new Object3D()
			const geoId = this.getRandomGeoByUnivers(this.univers)

			this.mesh.addInstance(geoId)

			const dist = 4.5 / 2 + this.decorGeos[geoId].geo.boundingSphere.radius + MathUtils.randFloat(-.5, 7)
			dummy.position.set(x * dist, 0, z)
			dummy.rotation.set(0, Math.PI * 2 * Math.random(), 0)
			dummy.updateMatrix()
			this.mesh.setMatrixAt(i, dummy.matrix)
			this.mesh.setVisibleAt(i, false)
			this.instances.push({ id: i, geometryId: geoId, dummy })

			z -= TILE_SIZE / (this.nbDecor * 2)

			this.totalInstance++
		}

		const hLength = Math.ceil(this.instances.length / 2)

		this.tiles[0] = this.instances.slice(0, hLength)
		this.tiles[1] = this.instances.slice(hLength, this.instances.length)
	}

	/**
	 * Update
	 */
	update({ delta }) {

		// Move groups
		// Group 1 / 2
		this.updateTilesPosition(this.tiles[0], delta)
		this.updateTilesPosition(this.tiles[1], delta)

	}

	updateTilesPosition(tiles, delta) {
		for (let i = 0; i < tiles.length; i++) {
			const { dummy, id } = tiles[i]

			dummy.position.z += delta * BendManager.speed// update
			dummy.updateMatrix()
			this.mesh.setMatrixAt(id, dummy.matrix)

		}
	}

	updateTiles(index, initDisplay) {

		// clear group
		const group = this.tiles[index]
		// fill it
		const startZ = initDisplay ? 0  : TILE_SIZE

		const positions = [] // Store valid positions

		const isColliding = (newPos, radius) => {
			for (let i = 0; i < positions.length; i++) {
				const other = positions[i]
				const distance = newPos.distanceTo(other.position)
				if (distance < radius + other.radius) {
					return true // Collision detected
				}
			}
			return false // No collision
		}

		for (let i = 0; i < group.length; i++) {
			const { dummy, id } = group[i]
			const geoId = this.getRandomGeoByUnivers(this.univers)
			const radius = this.decorGeos[geoId].geo.boundingSphere.radius // Assume boundingSphere is computed
			let position = null // To store the valid position
			const maxAttempts = 50 // Retry limit to avoid infinite loops

			for (let attempt = 0; attempt < maxAttempts; attempt++) {
				// Generate random position within the square
				const x = Math.random() * TILE_WIDE - TILE_WIDE / 2 // Centered around 0
				const z = Math.random() * TILE_SIZE - TILE_SIZE / 2 + startZ // Centered around 0
				const candidatePosition = new Vector3(x, 0, -z) // Assume Y=0 for flat surface

				if (!isColliding(candidatePosition, radius)) {
					position = candidatePosition // Found a valid position

					break // Exit the loop
				}
			}

			if (position) {
				// Add to valid positions
				positions.push({ position, radius })
				dummy.position.copy(position)
				dummy.rotation.set(0, Math.PI * 2 * Math.random(), 0)
				dummy.updateMatrix()

				this.mesh.setGeometryIdAt(id, geoId)
				this.mesh.setMatrixAt(id, dummy.matrix)
				this.mesh.setVisibleAt(id, true)
			} else {
				// console.warn('Failed to place a mesh without collision.')
			}
		}

	}

	changeUnivers(lastUnivers, univers) {
		this.univers = univers

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
