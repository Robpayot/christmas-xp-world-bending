// Vendor

// Modules
import Debugger from '@/js/managers/Debugger'

// Cameras
import MainCamera from '../cameras/MainCamera'
import CameraManager from '../managers/CameraManager'
import OrbitCamera from '../cameras/OrbitCamera'
import settings from './settings'

import {
	uniform,
	mix,
	normalWorld,
	smoothstep,
	Fn,
	vec3,
	Color,
	AmbientLight,
	DirectionalLight,
	Scene,
} from 'three/webgpu'
import Floor from '../components/Floor'
import Decor from '../components/Decor'
import TilesManager from '../managers/TilesManager'
import BendManager from '../managers/BendManager'
import Sphere from '../components/Sphere'
import Presents from '../components/Presents'
import Santa from '../components/Santa'

export default class MainView {
	config
	cameraManager
	scene
	renderer
	components
	debugFolder
	lightSettings = {
		ambientColor: '#c4c4c4',
		sunColor: '#587994'
	}
	skySettings = {
		uRangeA: uniform(0.19),
		uRangeB: uniform(0.72),
		uColorA: '#8aa2e7',
		uColorB: '#6472dd',
		uColorC: '#141264'
	}
	skyUniforms = {
		uColorA: uniform(new Color(this.skySettings.uColorA)),
		uColorB: uniform(new Color(this.skySettings.uColorB)),
		uColorC: uniform(new Color(this.skySettings.uColorC))
	}
	constructor({ debug, config, renderer }) {
		// Options
		this.debugContainer = debug
		this.config = config
		this.renderer = renderer

		// Setup
		// replace with LoaderManager
		// this._resourceManager = this._createResourceManager()
		this.scene = this._createScene()
		this.cameraManager = this._initCameraManager()
		this.components = null

		// After loading
		this.components = this._createComponents()
		this.lights = this._createLights()

		this.debugFolder = this._createDebugFolder()
		TilesManager.initEntities({ decor: this.components.decor })

		// update renderOrders
		// this._updateRenderOrder()

		this.scene.backgroundNode = this._skyNode()

	}

	destroy() {
		this._destroyComponents()
	}

	/**
	 * Getters & Setters
	 */

	get camera() {
		return this.cameraManager?.active?.instance
	}

	/**
	 * Private
	 */
	_createResourceManager() {
		// const resourceManager = new ResourceManager({
		//   namespace: this.config.name,
		// })
		// return resourceManager
	}

	_createScene() {
		const scene = new Scene()
		return scene
	}

	_initCameraManager() {
		CameraManager.init({
			scene: this.scene,
			config: this.config,
			renderer: this.renderer,
			cameras: [
				{
					name: 'default',
					camera: MainCamera,
					settings: settings.camera,
				},
				{
					name: 'orbit',
					camera: OrbitCamera,
					settings: settings.camera,
				},
			],
		})

		CameraManager.activate(settings.camera.default)

		return CameraManager
	}

	/**
	 * Components
	 */
	_createComponents() {
		const components = {}
		// this.scene.add(ResourceLoader.get('watercolor/scene').scene)
		// components.sphere = this._addComp(Sphere)
		components.floor = this._addComp(Floor)
		components.decor = this._addComp(Decor)
		components.presents = this._addComp(Presents)
		components.santa = this._addComp(Santa)

		return components
	}

	_addComp(Class) {
		const component = new Class({
			config: this.config,
			debug: this.debugFolder,
			scene: this.scene
		})

		this.scene.add(component)

		return component
	}

	_destroyComponents() {
		if (!this.components) return
		for (const key in this.components) {
			if (typeof this.components[key].destroy === 'function') this.components[key].destroy()
		}
	}

	_createLights() {
		const sun = new DirectionalLight(this.lightSettings.sunColor, 30)
		const ambient = new AmbientLight(this.lightSettings.ambientColor, 0.7) // Soft white light
		// there is an inversion on Decor X --> Y / Y --> X / Z --> Z
		sun.position.set(-6.15, 2.68, -1.48)   // Position the sun

		this.scene.add(ambient)
		this.scene.add(sun)

		return { sun, ambient }
	}

	_skyNode() {
		return Fn(() => {
			const rangeY = normalWorld.y.smoothstep(-1, 1).sub(0.5).mul(2).abs()
			const result = this.skyUniforms.uColorA.toVar()

			//horizon
			result.rgb = mix(result.rgb, this.skyUniforms.uColorA, smoothstep(0, 0.01, rangeY))
			result.rgb = mix(result.rgb, this.skyUniforms.uColorB, smoothstep(0.01, this.skySettings.uRangeA, rangeY))
			result.rgb = mix(result.rgb, this.skyUniforms.uColorC, smoothstep(this.skySettings.uRangeA, this.skySettings.uRangeB, rangeY))

			return result
		})()
	}

	/**
	 * Update
	 */
	update({ time, delta }) {
		this._updateComponents({ time, delta })
		TilesManager.update({ time, delta })
		BendManager.update({ time, delta })
		this.cameraManager.update({ time, delta })
	}

	_updateComponents({ time, delta }) {
		let component
		for (const key in this.components) {
			component = this.components[key]
			if (typeof component.update === 'function') {
				component.update({ time, delta })
			}
		}
	}

	_updateRenderOrder = () => {
		// limited overdraw
		const renderOrders = [this.components.sphere]

		for (const renderOrder of renderOrders) {
			if (renderOrder) {
				renderOrder.renderOrder = renderOrders.indexOf(renderOrder)
			}
		}
	}

	/**
	 * Resize
	 */
	resize({ width, height }) {
		this.cameraManager.resize({ width, height })

		// resize components
		let component
		for (const key in this.components) {
			component = this.components[key]
			if (typeof component.resize === 'function') {
				component.resize({ width, height })
			}
		}
	}

	/**
	 * Debug
	 */
	_createDebugFolder() {
		if (!Debugger) return

		const debugFolder = Debugger.addFolder({ title: `Scene ${this.config.name}`, expanded: true })

		debugFolder.addBinding(this.lights.sun, "position")
		debugFolder.addBinding(this.lightSettings, "ambientColor").on('change', () => {
			this.lights.ambient.color = new Color(this.lightSettings.ambientColor)
		})
		debugFolder.addBinding(this.lightSettings, "sunColor").on('change', () => {
			this.lights.sun.color = new Color(this.lightSettings.sunColor)
		})

		const debugSky = Debugger.addFolder({ title: `Scene sky`, expanded: true })

		debugSky.addBinding(this.skySettings, "uColorA").on('change', () => {
			this.skyUniforms.uColorA.value = new Color(this.skySettings.uColorA)
		})
		debugSky.addBinding(this.skySettings, "uColorB").on('change', () => {
			this.skyUniforms.uColorB.value = new Color(this.skySettings.uColorB)
		})
		debugSky.addBinding(this.skySettings, "uColorC").on('change', () => {
			this.skyUniforms.uColorC.value = new Color(this.skySettings.uColorC)
		})
		debugSky.addBinding(this.skySettings.uRangeA, "value")
		debugSky.addBinding(this.skySettings.uRangeB, "value")

		const btn = debugSky.addButton({
			title: 'Save',
		})

		btn.on('click', () => {
			navigator.clipboard.writeText(JSON.stringify(this.skySettings))
			console.log('copied to clipboard', this.skySettings)
		})

		return debugFolder
	}
}
