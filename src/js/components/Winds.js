import { BufferAttribute, DoubleSide, NodeMaterial, Object3D, Fn, Mesh, Vector3, BufferGeometry, storage, vec4, cameraProjectionMatrix, modelViewMatrix, float, mod, uniform, smoothstep, abs, vec3, max } from 'three/webgpu'
import gsap from 'gsap'
// import vertexShader from '@glsl/wind/wind.vert'
// import fragmentShader from '@glsl/wind/wind.frag'
import { degToRad, randFloat, randInt } from 'three/src/math/MathUtils'
// import LoaderManager from '../../managers/LoaderManager'

const NB_POINTS = 120

export default class Winds extends Object3D {
	geo
	mesh
	material
	index
	geoAttributes = {}
	uProgress = uniform(0)
	meshes = []
	constructor({ debug }) {
		super()
		this.geo

		for (let i = 0; i < 3; i++) {
			let data = this._createLineGeometry()
			if (i === 1) {
				data = this._createLineGeometry2()
			}
			const material = this._createMaterial(data.attributes)
			const mesh = this._createMesh(data.geometry, material)
			this.meshes.push(mesh)
			this.add(mesh)

			setTimeout(() => {
				this.anim(i)
			}, 3000 * i)
		}

		this.position.y = 5

	}

	_createLineGeometry() {
		// create spiral of points
		const points = []
		const incrZ = 20
		const incrX = 5
		const incrY = 3
		for (let i = 0; i < NB_POINTS; i++) {
			const percent = i / NB_POINTS

			points.push(new Vector3(Math.sin(percent * incrX), Math.sin(percent * incrY), percent * incrZ))
		}

		// Create the flat geometry
		const geometry = new BufferGeometry()

		// create two times as many vertices as points, as we're going to push them in opposing directions to create a ribbon
		geometry.setAttribute('position', new BufferAttribute(new Float32Array(points.length * 3 * 2), 3))
		geometry.setAttribute('uv', new BufferAttribute(new Float32Array(points.length * 2 * 2), 2))
		geometry.setIndex(new BufferAttribute(new Uint16Array(points.length * 6), 1))

		points.forEach((b, i) => {
			const o = 0.1

			geometry.attributes.position.setXYZ(i * 2 + 0, b.x, b.y + o, b.z)
			geometry.attributes.position.setXYZ(i * 2 + 1, b.x, b.y - o, b.z)

			geometry.attributes.uv.setXY(i * 2 + 0, i / (points.length - 1), 0)
			geometry.attributes.uv.setXY(i * 2 + 1, i / (points.length - 1), 1)

			if (i < points.length - 1) {
				geometry.index.setX(i * 6 + 0, i * 2)
				geometry.index.setX(i * 6 + 1, i * 2 + 1)
				geometry.index.setX(i * 6 + 2, i * 2 + 2)

				geometry.index.setX(i * 6 + 0 + 3, i * 2 + 1)
				geometry.index.setX(i * 6 + 1 + 3, i * 2 + 3)
				geometry.index.setX(i * 6 + 2 + 3, i * 2 + 2)
			}
		})

		// set attributes for TSL
		const aPosition = storage(geometry.attributes.position, 'vec3', NB_POINTS).toAttribute()
		const aUv = storage(geometry.attributes.uv, 'vec2', NB_POINTS).toAttribute()
		const attributes = {
			aPosition: aPosition,
			aUv: aUv
		}

		return { geometry, attributes }
	}

	_createLineGeometry2() {
		// create spiral of points
		const points = []
		const incrZ = 22
		const incrX = 1
		const incrY = -3
		for (let i = 0; i < NB_POINTS; i++) {
			const percent = i / NB_POINTS

			points.push(new Vector3(Math.sin(percent * incrX + 50), Math.sin(percent * incrY + 10), percent * incrZ))
		}

		// Create the flat geometry
		const geometry = new BufferGeometry()

		// create two times as many vertices as points, as we're going to push them in opposing directions to create a ribbon
		geometry.setAttribute('position', new BufferAttribute(new Float32Array(points.length * 3 * 2), 3))
		geometry.setAttribute('uv', new BufferAttribute(new Float32Array(points.length * 2 * 2), 2))
		geometry.setIndex(new BufferAttribute(new Uint16Array(points.length * 6), 1))

		points.forEach((b, i) => {
			const o = 0.1

			geometry.attributes.position.setXYZ(i * 2 + 0, b.x, b.y + o, b.z)
			geometry.attributes.position.setXYZ(i * 2 + 1, b.x, b.y - o, b.z)

			geometry.attributes.uv.setXY(i * 2 + 0, i / (points.length - 1), 0)
			geometry.attributes.uv.setXY(i * 2 + 1, i / (points.length - 1), 1)

			if (i < points.length - 1) {
				geometry.index.setX(i * 6 + 0, i * 2)
				geometry.index.setX(i * 6 + 1, i * 2 + 1)
				geometry.index.setX(i * 6 + 2, i * 2 + 2)

				geometry.index.setX(i * 6 + 0 + 3, i * 2 + 1)
				geometry.index.setX(i * 6 + 1 + 3, i * 2 + 3)
				geometry.index.setX(i * 6 + 2 + 3, i * 2 + 2)
			}
		})

		// set attributes for TSL
		const aPosition = storage(geometry.attributes.position, 'vec3', NB_POINTS).toAttribute()
		const aUv = storage(geometry.attributes.uv, 'vec2', NB_POINTS).toAttribute()
		const attributes = {
			aPosition: aPosition,
			aUv: aUv
		}

		return { geometry, attributes }
	}

	_createMaterial(attributes) {
		const material = new NodeMaterial()

		const { aPosition, aUv } = attributes
		const uProgress = uniform(1)
		material.userData.uProgress = uProgress

		// vertex
		material.vertexNode = Fn(() => {
			// Simple vertex shader
			const transformed = modelViewMatrix.mul(aPosition).toVar()
			const mvPosition = vec4(transformed.xyz, transformed.w)
			return cameraProjectionMatrix.mul(mvPosition)
		})()

		// fragment
		material.fragmentNode = Fn(() =>
		{
			const offsetX = uProgress.sub(0.5).mul(2)
			// progress
			const alpha = abs(aUv.x.add(offsetX).sub(0.5).mul(2)).oneMinus().toVar()

			// thin
			const sides = abs(aUv.y.sub(0.5).mul(2)).oneMinus()
			alpha.mulAssign(sides.smoothstep(0.6, 1))

			// pointe
			const pointe = aUv.x.oneMinus().smoothstep(0.8, 1)
			alpha.mulAssign(sides.smoothstep(pointe.sub(0.1), 1))

			return vec4(vec3(1), max(alpha, 0))
		}
		)()

		material.transparent = true
		material.side = DoubleSide
		// material.depthWrite = false
		material.depthTest = false
		material.needsUpdate = true

		return material
	}

	_createMesh(geometry, material) {
		const mesh = new Mesh(geometry, material)
		// mesh.rotation.y = Math.random() * 10
		// mesh.scale.setScalar(0.5 + Math.random());
		// mesh.scale.y = Math.random() * 0.2 + 0.9;
		const s = 2
		mesh.renderOrder = 1

		// if (index === 0) {
		// 	s = 10
		// 	mesh.rotation.y += degToRad(90)
		// }
		mesh.scale.set(s, s, s)
		// mesh.position.y = 10
		mesh.position.y = 1000

		return mesh
	}

	kill() {
		this.tl?.kill()
	}

	/**
	 * Update
	 */
	update({ time, delta }) {
		// this.uProgress.value = time / 500
		// for (let i = 0; i < this.meshes.length; i++) {
		// 	const mesh = this.meshes[i]
		// 	mesh.material.userData.uProgress.value += 0.003 * delta

		// 	if (mesh.material.userData.uProgress.value > 8 && !mesh.reset) {
		// 		mesh.reset = true

		// 		mesh.position.y = randFloat(0, 2)
		// 		mesh.position.x = randFloat(-4, 4)
		// 		mesh.position.z = randFloat(-2, -1)

		// 		mesh.material.userData.uProgress.value = 0
		// 		mesh.reset = false

		// 	}

		// }
	}

	anim(index) {
		// if (!this.ok) return
		// position randomly + take rotation of the boat
		const mesh = this.meshes[index]
		const tl = new gsap.timeline({ repeat: -1, repeatDelay: 2, delay: 0 })
		tl.add(() => {

			const dir = Math.random() < 0.5 ? -1 : 1

			mesh.position.y = randFloat(0, 2)  * (index + 1)
			mesh.position.x = randFloat(1, 3) * (index + 1) * dir
			mesh.position.z = randFloat(-3, -1)

			// mesh.rotation.x = randFloat(-1, -1)

		})
		tl.fromTo(
			mesh.material.userData.uProgress,
			{
				value: 0,
			},
			{
				value: 1,
				duration: 6,
			}
		)
	}
}
