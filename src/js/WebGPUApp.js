// Vendor
import { gsap } from 'gsap'
import { Clock } from 'three'

// Modules
import Debugger from '@/js/managers/Debugger'
// import Visibility from '@/js/modules/Visibility'
// import WindowResizeObserver from '@/js/modules/WindowResizeObserver'
import Renderer from '@/js/components/Renderer'
// import Composer from '@/js/webgl/modules/Composer'
import MainView from './views/MainView'
import Settings from './utils/Settings'
import LoaderManager from './managers/LoaderManager'
import Stats from 'stats.js'

export default class WebGPUApp {
	#canvas
	#isDevelopment
	#isViewRenderingEnabled
	#isStatsGpuQueryStarted
	#clock
	#renderer
	#isActive
	#views
	#stats
	#statsGpuPanel
	#composer
	#activeView
	constructor({ canvas, isDevelopment }) {
		// Options
		this.#canvas = canvas
		this.#isDevelopment = isDevelopment

		// Props
		this.#isActive = true
		// this._renderScale = globalConfig.rendering.scale
		this.#isViewRenderingEnabled = true
		this.#isStatsGpuQueryStarted = false

		if (Debugger) {
			Debugger.addTab('Main')
		}
		// Setup
		// this._debug = this._createDebug()
		this.#clock = this._createClock()
		this.#renderer = this._createRenderer()
		// this.#composer = this._createComposer()

		if (this.#isDevelopment) {
			this.#stats = this._createStats()
			console.log(this.#stats)
		}

		this._initViews()
		this._precompile()

		this._events(true)
		document.addEventListener('visibilitychange', this._visibilityChangeHandler)
		this._resize()
	}

	destroy() {
		this._removeDebug()
		this._removeStats()
		this._events(false)
		document.removeEventListener('visibilitychange', this._visibilityChangeHandler)
		this.#activeView?.destroy()
		this.#composer?.destroy()
		this.#renderer.destroy()
	}

	/**
   * Public
   */

	/**
   * Private
   */

	_events(method) {
		const listener = method ? 'add' : 'remove'
		const eventListener = method ? 'addEventListener' : 'removeEventListener'

		window[eventListener]('resize', this._resizeHandler)
		window[eventListener]('deviceorientation', this._resizeHandler)
		window[eventListener]('orientationchange', this._resizeHandler)
		gsap.ticker[listener](this._tickHandler)
	}

	_start() {
		// this.#composer.setup()
		// this.#activeView.setup()
		// this._startStatsGpuQuery()
	}

	_initViews() {
		this.#views = {
			main: new MainView({ renderer: this.#renderer.instance, config: { name: 'Main' }, debug: Debugger }),
		}

		this.#activeView = this.#views.main
	}

	// precompile shaders and materials
	_precompile() {
		const { scene, camera } = this.#activeView
		this.#renderer.instance.compile(scene, camera)

		// precompile textures
		const textures = LoaderManager.textures
		textures.forEach((texture) => {
			// this.#renderer.instance.initTexture(texture)
		})
	}

	_createStats() {
		const stats = new Stats()
		document.body.appendChild(stats.dom)
		return stats
	}

	_removeStats() {
		if (!this.#stats) return
		document.body.removeChild(this.#stats.dom)
		this.#stats = null
	}

	_createClock() {
		const clock = new Clock()
		return clock
	}

	_createRenderer() {
		const renderer = new Renderer({
			canvas: this.#canvas,
		})
		return renderer
	}

	// _createComposer() {
	//   const composer = new Composer()
	//   bidello.registerGlobal('composer', composer)
	//   return composer
	// }

	/**
   * Update cycle
   */
	_tick() {
		if (!this.#isActive) return

		this.#stats?.begin()
		this._update()
		this._render()
		this.#stats?.end()

		// if (this.#isDevelopment && this.#renderer) this.#renderer.instance.info.reset()
		// if (this.#renderer) this.#renderer.instance.info.reset()
		// R.P.: Continue to reset info in production to fix an issue using webworkers
	}

	_update() {
		// call all components updates
		const delta = this.#clock.getDelta() * 1000
		const time = this.#clock.getElapsedTime()
		// TODO: update all views
		const view = this.#views.main
		view?.update({ time, delta })
		// this._triggerBidelloUpdate()
	}

	_render() {
		// const view = this._viewManager?.active

		// if (!view) return

		if (this.#isDevelopment && this.#isStatsGpuQueryStarted) {
			// this.#statsGpuPanel?.startQuery()
		}

		const view = this.#activeView

		if (view && this.#isViewRenderingEnabled) {
			this.#renderer.render(view.scene, view.camera)
			// this.#composer?.render(view)
		}

		if (this.#isDevelopment && this.#isStatsGpuQueryStarted) {
			// this.#statsGpuPanel?.endQuery()
		}

		if (this.#isDevelopment) {
			this.#renderer.updateStats()
		}
	}

	/**
   * Resize
   */
	_resize() {
		const width = (this.width = window.innerWidth)
		const height = (this.height = window.innerHeight)
		const dpr = (this.dpr = Settings.dpr)
		this.#renderer.resize({ width, height, dpr })

		// for each views
		// call components resize

		this.#activeView.resize({ width, height })
	}

	/**
   * Handlers
   */
	_resizeHandler = () => {
		this._resize()
	}

	_tickHandler = () => {
		this._tick()
	}

	_visibilityChangeHandler = () => {
		if (document.visibilityState === 'visible') {
			this.#clock.start()
			this.#isActive = true
		} else {
			this.#clock.stop()
			this.#isActive = false
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
