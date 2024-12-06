import { Mesh, MeshBasicMaterial, MeshMatcapMaterial, Object3D, PlaneGeometry, TextureLoader } from 'three'
import BendManager from '../managers/BendManager'
import { Color, color, MeshBasicNodeMaterial, MeshLambertNodeMaterial, MeshNormalNodeMaterial, pow, uniform, uv, vec3, vec4 } from 'three/webgpu'
import { vertexBendNode } from '../tsl/utils'
import { SIZE } from './Floor'
import { Fn } from 'three/webgpu'
const FACES = 100 // TODO: optim
const HEIGHT = 100
const GEOMETRY = new PlaneGeometry(SIZE * 2, HEIGHT, FACES, FACES)

GEOMETRY.translate(0, HEIGHT / 2, -SIZE / 2)
export default class Horizon extends Object3D {
	material
	debug
	color = '#cec0b6'
	settings = {
		stepMin: uniform(0.05),
		pow: uniform(4.10),
		uColor: uniform(new Color(this.color))
	}
	constructor({ debug }) {
		super()

		this.debug = debug

		this._createMaterial()
		this._createMesh()

		this._createDebugFolder()

		// this.position.z = -SIZE / 4
	}

	_createMaterial() {
		this.material = new MeshBasicMaterial({ wireframe: false, transparent: true })

		this.material.vertexNode = vertexBendNode()
		this.material.colorNode = this.colorNode()
		// this.material = new MeshBasicMaterial({ color:'red' })
	}

	_createMesh() {
		const mesh = new Mesh(GEOMETRY, this.material)
		// mesh.scale.set(10, 1, 10)
		this.add(mesh)
	}

	colorNode() {
		return Fn(() => {
			const y = uv().y.oneMinus().toVar()
			y.assign(pow(y, this.settings.pow))
			return vec4(this.settings.uColor, y.smoothstep(this.settings.stepMin, 1))
		})()
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

		const debug = this.debug.addFolder({ title: 'Horizon', expanded: true })

		debug.addBinding(this.settings.stepMin, "value")
		debug.addBinding(this.settings.pow, "value")
		debug.addBinding(this, "color").on('change', () => {
			this.settings.uColor.value = new Color(this.color)
		})
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
