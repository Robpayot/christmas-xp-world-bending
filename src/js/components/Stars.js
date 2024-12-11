
import { degToRad } from 'three/src/math/MathUtils'
import { randFloat } from 'three/src/math/MathUtils'
import { NodeMaterial, Object3D, Fn, Float32BufferAttribute, Points, BufferGeometry, SpriteNodeMaterial, storage, StorageInstancedBufferAttribute, vec4, mix, uv, vec3, InstancedMesh, PlaneGeometry } from 'three/webgpu'
import { uvCircleNode } from '../tsl/utils'

export default class Stars extends Object3D {
	count = 1000
	material
	#index
	geoAttributes = {}
	constructor({ debug }) {
		super()

		this.debug = debug
		this._createGeometry()
		this.material = this._createMaterial()
		this.mesh = this._createMesh()

		this.rotateY(Math.PI / 2)
		this.position.z = 200

		this.add(this.mesh)

		this._createDebugFolder()
	}

	_createMaterial() {
		const material = new SpriteNodeMaterial({ transparent: true, depthWrite: false })

		// WGSL
		// VERTEX

		// Scale
		// const rangeSize = range(0.1, 0.2) // random size
		// material.scaleNode = rangeSize.mul(this.uSize).mul(this.uShow)

		const { aPosition, aScale } = this.geoAttributes

		// Position

		// const offsetFq = aDelay
		// const offsetForce = aForce.mul(this.uRdForce)
		// const progress = mod(this.uTime.add(aDelay), this.uFrequence.add(offsetFq)).div(this.uFrequence.add(offsetFq))

		// const x = progress.mul(this.uForce.mul(offsetForce)).mul(aPosition.x)
		// const y = sin(progress.mul(PI)).mul(this.uCoefY)
		// const z = progress.mul(this.uForce.mul(offsetForce)).mul(aPosition.z) // add more

		material.positionNode = Fn(() => {
			const animatedPos = aPosition.toVar()
			return animatedPos
		})()
		material.scaleNode = aScale

		// Fragment

		// Color
		const circle = uvCircleNode()
		const aColor = vec3(1)
		material.colorNode = vec4(aColor, circle)

		return material
	}

	_createGeometry() {
		const vertices = []
		const scales = []

		const radius = 1000 // Radius of the sphere

		for (let i = 0; i < this.count; i++) {
			// Restrict points to the front quarter of the sphere
			const phi = Math.random() * (Math.PI / 2) - Math.PI / 4 // Azimuthal angle (-pi/4 to pi/4)
			const theta = (Math.random() * Math.PI) / 2 // Polar angle (0 to pi/2)

			// Calculate Cartesian coordinates from spherical coordinates
			const x = radius * Math.sin(theta) * Math.cos(phi)
			const y = radius * Math.sin(theta) * Math.sin(phi)
			const z = radius * Math.cos(theta)

			// Apply the rotation by Math.PI radians (180 degrees)
			const rotationAngle = degToRad(-90)
			const rotatedY = y * Math.cos(rotationAngle) - z * Math.sin(rotationAngle)
			const rotatedZ = y * Math.sin(rotationAngle) + z * Math.cos(rotationAngle)

			vertices.push(x, rotatedY, rotatedZ)

			// Randomize offsets and speeds
			const scale = randFloat(1.5, 3)
			scales.push(scale)
		}

		// add attributes

		const aPosition = storage(new StorageInstancedBufferAttribute(new Float32Array(vertices), 3), 'vec3', this.count).toAttribute()
		const aScale = storage(new StorageInstancedBufferAttribute(new Float32Array(scales), 1), 'float', this.count).toAttribute()

		this.geoAttributes.aPosition = aPosition
		this.geoAttributes.aScale = aScale
		// const mesh = new Points(geometry, this.material)
		// mesh.position.y = 1

		// mesh.initPos = mesh.position.clone()
		// mesh.renderOrder = -1

		// return mesh
	}

	_createMesh() {
		// Mesh
		const mesh = new InstancedMesh(new PlaneGeometry(1, 1), this.material, this.count)
		mesh.frustumCulled = false
		return mesh
	}

	/**
	 * Debug
	 */
	_createDebugFolder() {
		if (!this.debug) return

		// const settingsChangedHandler = () => {
		// 	this.position.z = this.settings.z
		// }

		// const debug = this.debug.addFolder({ title: 'Stars', expanded: true })

		// debug.addBinding(this.settings, 'z').on('change', settingsChangedHandler)

		// const btn = debug.addButton({
		// 	title: 'Copy settings',
		// 	label: 'copy', // optional
		// })

		// btn.on('click', () => {
		// 	navigator.clipboard.writeText(JSON.stringify(this.settings))
		// 	console.log('copied to clipboard', this.settings)
		// })

		// return debug
	}
}
