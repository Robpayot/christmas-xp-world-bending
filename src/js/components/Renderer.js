// Vendor
import {
	ACESFilmicToneMapping,
	CineonToneMapping,
	Color,
	LinearToneMapping,
	NoToneMapping,
	ReinhardToneMapping,
	SRGBColorSpace,
} from 'three'
import { WebGPURenderer } from 'three/tsl'

// import WebGPU from 'three/addons/capabilities/WebGPU.js'

// Configs
// import globalConfig from '@/js/webgl/configs/global'

// Modules
import Debugger from '@/js/managers/Debugger'

export default class Renderer {
	#canvas
	#debug
	#debugStats
	#instance
	constructor({ canvas }) {
		// Options
		this.#canvas = canvas

		// Setup
		this.#debug = this._createDebug()
		this.#instance = this._createRenderer()
		this.#debugStats = this._createDebugStats()
	}

	destroy() {
		this.#instance.dispose()
		this._removeDebug()
	}

	/**
	 * Getters & Setters
	 */
	get instance() {
		return this.#instance
	}

	/**
	 * Public
	 */
	updateStats() {
		Debugger?.pane.refresh()
		this.#instance.info.reset()
	}

	/**
	 * Private
	 */
	_createRenderer() {
		// this.isWebGPU = WebGPU.isAvailable()
		// console.log(WebGPU)

		// Currently sortObjects and perObjectFrustumCulled currently have bugs in WebGPU so disabled it.
		// sortObjects.value = true//!this.isWebGPU
		// perObjectFrustumCulled.value = true// !this.isWebGPU

		const renderer = new WebGPURenderer({
			canvas: this.#canvas,
			antialias: true,
			powerPreference: 'high-performance',
		})
		renderer.init()
		const clearColor = new Color(0xffffff)
		const clearAlpha = 1
		renderer.setClearColor(clearColor, clearAlpha)
		renderer.toneMapping = LinearToneMapping
		// renderer.shadowMap.enabled = true
		// renderer.shadowMap.type = PCFSoftShadowMap
		// renderer.shadowMap.type = BasicShadowMap
		renderer.info.autoReset = false
		renderer.outputColorSpace = SRGBColorSpace
		// renderer.autoClear = false;

		if (this.#debug) {
			const props = {
				clearColor: clearColor.getStyle(),
			}

			const toneMaps = {
				NoToneMapping,
				LinearToneMapping,
				ReinhardToneMapping,
				CineonToneMapping,
				ACESFilmicToneMapping,
			}
			this.#debug.addBinding(props, 'clearColor').on('change', () => {
				renderer.setClearColor(new Color(props.clearColor), clearAlpha)
			})
			this.#debug.addBinding(renderer, 'toneMapping', { options: toneMaps })
			this.#debug.addBinding(renderer, 'toneMappingExposure', { min: 0, max: 10 })
		}

		return renderer
	}

	/**
	 * Render
	 */
	render(scene, camera) {
		this.#instance.renderAsync(scene, camera) // might cause issues?
	}

	/**
	 * Resize
	 */
	resize({ width, height, dpr }) {
		this.#instance.setPixelRatio(dpr)
		this.#instance.setSize(width, height)
	}

	/**
	 * Handlers
	 */
	onExposureChange(exposure) {
		this.#instance.toneMappingExposure = exposure
	}

	/**
	 * Debug
	 */
	_createDebug() {
		if (!Debugger) return

		const debug = Debugger.addFolder({ title: 'Renderer', index: 1 })
		return debug
	}

	_createDebugStats() {
		if (!this.#debug) return

		const stats = this.#debug.addFolder({ title: 'Stats' })
		const memory = stats.addFolder({ title: 'Memory' })
		memory.addBinding(this.#instance.info.memory, 'geometries', { readonly: true })
		memory.addBinding(this.#instance.info.memory, 'textures', { readonly: true })
		const render = stats.addFolder({ title: 'Render' })
		render.addBinding(this.#instance.info.render, 'drawCalls', { readonly: true })
		render.addBinding(this.#instance.info.render, 'triangles', { readonly: true })
		render.addBinding(this.#instance.info.render, 'points', { readonly: true })
		render.addBinding(this.#instance.info.render, 'lines', { readonly: true })
		return stats
	}

	_removeDebug() {
		if (this.#debug) this.#debug.dispose()
	}
}
