// Vendor

// Modules
import Debugger from '@/js/managers/Debugger'

import LoaderManager from '@/js/managers/LoaderManager'

// Cameras
import MainCamera from '../cameras/MainCamera'
import CameraManager from '../managers/CameraManager'
import OrbitCamera from '../cameras/OrbitCamera'
import SETTINGS from './settings'

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
import Presents from '../components/Presents'
import Santa from '../components/Santa'
import MouseManager from '../managers/MouseManager'
import Horizon from '../components/Horizon'
import Stars from '../components/Stars'

export default class MainView {
	config
	cameraManager
	scene
	renderer
	components
	debugFolder
	lightDeviceSettings = {
		ambientColor: '#848484',
		sunColor: '#e2e2f0'
	}
	skyDeviceSettings = {
		uRangeA: uniform(0.22),
		uRangeB: uniform(0.62),
		uColorA: '#6472dd',
		uColorB: '#4050b8',
		uColorC: '#141264'
	}
	skyUniforms = {
		uColorA: uniform(new Color(this.skyDeviceSettings.uColorA)),
		uColorB: uniform(new Color(this.skyDeviceSettings.uColorB)),
		uColorC: uniform(new Color(this.skyDeviceSettings.uColorC))
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

		this.lights = this._createLights()
		this.debugFolder = this._createDebugFolder()
		// After loading
		this.components = this._createComponents()

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
					settings: SETTINGS.camera,
				},
				{
					name: 'orbit',
					camera: OrbitCamera,
					settings: SETTINGS.camera,
				},
			],
		})

		CameraManager.activate(SETTINGS.camera.default)

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
		components.horizon = this._addComp(Horizon)
		components.decor = this._addComp(Decor)
		components.presents = this._addComp(Presents)
		components.santa = this._addComp(Santa)
		components.stars = this._addComp(Stars)

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
		const sun = new DirectionalLight(this.lightDeviceSettings.sunColor, 2.3)
		const ambient = new AmbientLight(this.lightDeviceSettings.ambientColor, 0.7) // Soft white light
		// there is an inversion on Decor X --> Y / Y --> X / Z --> Z
		sun.position.set(-56, 33, -12)   // Position the sun
		this.scene.add(ambient)
		this.scene.add(sun)

		// env
		this.scene.environment = LoaderManager.get('hdrMap')
		this.scene.environmentIntensity = 0.15

		return { sun, ambient }
	}

	_skyNode() {
		return Fn(() => {
			const rangeY = normalWorld.y.smoothstep(-1, 1).sub(0.5).mul(2)
			const result = this.skyUniforms.uColorA.toVar()

			//horizon
			result.rgb = mix(result.rgb, this.skyUniforms.uColorA, smoothstep(0, 0.01, rangeY))
			result.rgb = mix(result.rgb, this.skyUniforms.uColorB, smoothstep(0.01, this.skyDeviceSettings.uRangeA, rangeY))
			result.rgb = mix(result.rgb, this.skyUniforms.uColorC, smoothstep(this.skyDeviceSettings.uRangeA, this.skyDeviceSettings.uRangeB, rangeY))

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
		MouseManager.update({ time, delta })
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

		debugFolder.addBinding(this.lights.sun, "position", { label: 'sun Position' })
		debugFolder.addBinding(this.lights.sun, "intensity", { label: 'sun Intensity' })

		debugFolder.addBinding(this.lightDeviceSettings, "ambientColor").on('change', () => {
			this.lights.ambient.color = new Color(this.lightDeviceSettings.ambientColor)
		})
		debugFolder.addBinding(this.lightDeviceSettings, "sunColor").on('change', () => {
			this.lights.sun.color = new Color(this.lightDeviceSettings.sunColor)
		})

		debugFolder.addBinding(this.scene, "environmentIntensity", { label: 'HDR Intensity' })

		const debugSky = Debugger.addFolder({ title: `Scene sky`, expanded: true })

		debugSky.addBinding(this.skyDeviceSettings, "uColorA").on('change', () => {
			this.skyUniforms.uColorA.value = new Color(this.skyDeviceSettings.uColorA)
		})
		debugSky.addBinding(this.skyDeviceSettings, "uColorB").on('change', () => {
			this.skyUniforms.uColorB.value = new Color(this.skyDeviceSettings.uColorB)
		})
		debugSky.addBinding(this.skyDeviceSettings, "uColorC").on('change', () => {
			this.skyUniforms.uColorC.value = new Color(this.skyDeviceSettings.uColorC)
		})
		debugSky.addBinding(this.skyDeviceSettings.uRangeA, "value")
		debugSky.addBinding(this.skyDeviceSettings.uRangeB, "value")

		const btn = debugSky.addButton({
			title: 'Save',
		})

		btn.on('click', () => {
			navigator.clipboard.writeText(JSON.stringify(this.skyDeviceSettings))
			console.log('copied to clipboard', this.skyDeviceSettings)
		})

		return debugFolder
	}
}
