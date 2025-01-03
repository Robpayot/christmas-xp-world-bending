// Modules
import Debugger from '@/js/managers/Debugger'
// import Visibility from '@/js/modules/Visibility'
// import WindowResizeObserver from '@/js/modules/WindowResizeObserver'
import Renderer from '@/js/components/Renderer'
// import Composer from '@/js/webgl/modules/Composer'
import MainView from './views/MainView'
import DeviceSettings from './utils/DeviceSettings'
import LoaderManager from './managers/LoaderManager'
import Stats from 'stats.js'
import { Mesh, PerspectiveCamera, PlaneGeometry, Scene } from 'three/webgpu'

export default class WebGPUApp {
	canvas
	isDevelopment
	isViewRenderingEnabled
	isStatsGpuQueryStarted
	clock
	renderer
	isActive
	views
	stats
	statsGpuPanel
	composer
	activeView
	lastTime = 0
	constructor({ canvas, isDevelopment, isReady }) {
		this.isReady = isReady
		// Options
		this.canvas = canvas
		this.isDevelopment = isDevelopment

		// Props
		this.isActive = true
		// this._renderScale = globalConfig.rendering.scale
		this.isViewRenderingEnabled = true
		this.isStatsGpuQueryStarted = false

		if (Debugger) {
			Debugger.addTab('Main')
		}
		// Setup
		// this._debug = this._createDebug()
		this.renderer = new Renderer({
			canvas: this.canvas,
			afterInit: this.afterInit
		})

		// this.composer = this._createComposer()

	}

	afterInit = (multiDraw) => {
		if (this.isDevelopment) {
			this.stats = this._createStats()
		}

		this._initViews()
		this._precompile()

		this._events(true)
		requestAnimationFrame(this._tick)
		// document.addEventListener('visibilitychange', this._visibilityChangeHandler)
		this._resize()
		this.renderer.render()
		setTimeout(() => {
			this.isReady(multiDraw)
		}, 1000)
	}

	destroy() {
		this._removeDebug()
		this._removeStats()
		this._events(false)
		// document.removeEventListener('visibilitychange', this._visibilityChangeHandler)
		this.activeView?.destroy()
		this.composer?.destroy()
		this.renderer.destroy()
	}

	/**
   * Public
   */

	/**
   * Private
   */

	_events(method) {
		// const listener = method ? 'add' : 'remove'
		const eventListener = method ? 'addEventListener' : 'removeEventListener'

		window[eventListener]('resize', this._resizeHandler)
		window[eventListener]('deviceorientation', this._resizeHandler)
		window[eventListener]('orientationchange', this._resizeHandler)
		// gsap.ticker[listener](this._tickHandler)
	}

	_start() {
		// this.composer.setup()
		// this.activeView.setup()
		// this._startStatsGpuQuery()
	}

	_initViews() {
		this.views = {
			main: new MainView({ renderer: this.renderer.instance, config: { name: 'Main' }, debug: Debugger }),
		}

		this.activeView = this.views.main
	}

	// precompile shaders and materials
	_precompile() {
		const { scene, camera } = this.activeView

		// doesn't work for transparent material
		// this.renderer.instance.compile(scene, camera)

		// precompile textures
		const textures = LoaderManager.textures
		textures.forEach((texture) => {
			// this.renderer.instance.initTexture(texture)
		})
	}

	//---------------------------------------------------------- COMPILE
	async gpuUpload(objects) {
		this.compileScene = this.compileScene || new Scene()
		this.compileCamera = this.compileCamera || new PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.0001, 10000)
		this.compileCamera.position.set(0, 0, 10000)
		this.compileCamera.lookAt(0, 0, 0)
		this.compileGeometry = this.compileGeometry || new PlaneGeometry(1, 1)
		this.compileScene.environment = this.scene.environment

		const initialStates = []

		for (const obj of objects) {
			if (!obj) continue
			if (obj.isLight) continue
			if (obj.isCamera) continue
			if (obj.isTexture) {
				// console.log('[compile] add texture', obj)
				obj.needsUpdate = true
				this.renderer.initTexture?.(obj) // Error, initTexture is not a function
			}
			else if (obj.isMaterial) {
				// console.log('[compile] add material', obj)
				const mesh = new Mesh(this.compileGeometry, obj)
				this.compileScene.add(mesh)
				const maps = ['map', 'alphaMap', 'aoMap', 'bumpMap', 'displacementMap', 'emissiveMap', 'envMap', 'lightMap', 'metalnessMap', 'normalMap', 'roughnessMap']
				for (const map of maps) {
					if (obj[map]) {
						this.renderer.initTexture(obj[map])
					}
				}
			}
			else if (obj.isObject3D) {
				// console.log('[compile] add object', obj)
				initialStates.push({
					parent: obj.parent,
					frustumCulled: obj.frustumCulled,
				})
				obj.frustumCulled = false
				this.compileScene.add(obj)
			}
		}

		await this.renderer.compileAsync(this.compileScene, this.compileCamera, this.scene)

		let k = 0
		for (const obj of objects) {
			if (!obj) continue
			if (obj.isLight) continue
			if (obj.isCamera) continue
			if (obj.isMaterial) continue
			if (obj.isTexture) continue
			if (initialStates[k]) {
				if (initialStates[k].parent) {
					initialStates[k].parent.add(obj)
				}
				obj.frustumCulled = initialStates[k].frustumCulled
			}
			k++
		}

		this.compileGeometry.dispose()
	}

	_createStats() {
		const stats = new Stats()
		document.body.appendChild(stats.dom)
		return stats
	}

	_removeStats() {
		if (!this.stats) return
		document.body.removeChild(this.stats.dom)
		this.stats = null
	}

	// _createComposer() {
	//   const composer = new Composer()
	//   bidello.registerGlobal('composer', composer)
	//   return composer
	// }

	/**
   * Update cycle
   */

	_tick = () => {
		if (!this.isActive) return

		const t = performance.now()
		let dt = t - this.lastTime
		this.lastTime = t

		// Cap dt to prevent spiral of death
		const MAX_DT = 100 // Adjust as needed
		dt = Math.min(dt, MAX_DT)

		this._update(t, dt)

		requestAnimationFrame(this._tick)

	}

	_update(time, delta) {
		this.stats?.begin()

		// TODO: update all views
		const view = this.views.main
		view?.update({ time, delta })

		this._render()

		this.stats?.end()
		// this._triggerBidelloUpdate()
	}

	_render() {
		// const view = this._viewManager?.active

		// if (!view) return

		if (this.isDevelopment && this.isStatsGpuQueryStarted) {
			// this.statsGpuPanel?.startQuery()
		}

		const view = this.activeView

		if (view && this.isViewRenderingEnabled) {
			this.renderer.render(view.scene, view.camera)
			// this.composer?.render(view)
		}

		if (this.isDevelopment && this.isStatsGpuQueryStarted) {
			// this.statsGpuPanel?.endQuery()
		}

		if (this.isDevelopment) {
			this.renderer.updateStats()
		}
	}

	/**
   * Resize
   */
	_resize() {
		const width = (this.width = window.innerWidth)
		const height = (this.height = window.innerHeight)
		const dpr = (this.dpr = DeviceSettings.dpr)
		this.renderer.resize({ width, height, dpr })

		// for each views
		// call components resize

		this.activeView.resize({ width, height })
	}

	/**
   * Handlers
   */
	_resizeHandler = () => {
		this._resize()
	}

	_visibilityChangeHandler = () => {
		if (document.visibilityState === 'visible') {
			this.clock.start()
			this.isActive = true
		} else {
			this.clock.stop()
			this.isActive = false
		}
	}

	/**
   * Debug
   */
	// _createDebug() {
	//   if (!Debugger) return

	//   const debug = Debugger.addFolder({ title: 'WebGL', index: 1 })
	//   debug.addBinding(this, '_renderScale', { label: 'Render scale', min: 0.01, max: 2 }).on('change', () => {
	//     this._resize()
	//   })
	//   return debug
	// }

	// _removeDebug() {
	//   if (this._debug) this._debug.dispose()
	// }
}
