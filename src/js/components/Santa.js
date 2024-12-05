import { BatchedMesh, Group, MathUtils, Mesh, MeshBasicMaterial, MeshMatcapMaterial, Object3D, PlaneGeometry, TextureLoader } from 'three'
import LoaderManager from '@/js/managers/LoaderManager'
import { CircleGeometry, Matrix4, MeshBasicNodeMaterial, MeshNormalNodeMaterial, MeshStandardNodeMaterial, SphereGeometry, varying, vec3, Vector3 } from 'three/webgpu'
import BendManager from '../managers/BendManager'
import MouseManager from '../managers/MouseManager'
import { lerp } from 'three/src/math/MathUtils.js'
// import { Z_DISAPPEAR } from '../managers/TilesManager'

export default class Santa extends Group {
	material
	debug
	initY = 5
	minY = 4
	bendZ = 0
	targetPos = new Vector3(0, 8, -22)
	settings = {
		coefX: 12,
		coefY: 4,
		lookAtX: 12,
		lookAtY: 6
	}

	constructor({ debug }) {
		super()

		this.debug = debug

		this.mesh = LoaderManager.get('santa_sleight').scene

		this.add(this.mesh)

		this.mesh.position.y = this.initY

		this.targetMesh = new Mesh(new SphereGeometry(1, 32, 32), new MeshBasicNodeMaterial({ color: 'red', wireframe: true }))
		this.targetMesh.position.copy(this.targetPos)
		this.targetMesh.visible = false
		this.add(this.targetMesh)

		this._createDebugFolder()

		for (let i = 0; i < this.mesh.children.length; i++) {
			const child = this.mesh.children[i]
			console.log(child)
			// child.material = physicalToStandardMatNode(child.material)
			// this.add(child)

		}

	}

	/**
	 * Update
	 */
	update({ delta }) {

		this.mesh.position.x = MouseManager.x * this.settings.coefX
		this.targetMesh.position.x = MouseManager.lookAtX * this.settings.lookAtX

		this.mesh.position.y = MouseManager.y * this.settings.coefY + this.initY
		// clamp to minY
		this.mesh.position.y = Math.max(this.minY, this.mesh.position.y)
		this.targetMesh.position.y = MouseManager.lookAtY * this.settings.lookAtY + this.targetPos.y

		this.mesh.lookAt(this.targetMesh.position)

		this.bendZ = lerp(this.bendZ,  BendManager.bend.value * 8, 0.2)
		this.position.z = this.bendZ

	}

	resize({ width, height }) {}

	/**
	 * Debug
	 */
	_createDebugFolder() {
		if (!this.debug) return

		const debug = this.debug.addFolder({ title: 'Santa', expanded: true })

		debug.addBinding(this.settings, 'coefX')
		debug.addBinding(this.settings, 'coefY')
		debug.addBinding(this.settings, 'lookAtX')
		debug.addBinding(this.targetMesh, 'position')
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
