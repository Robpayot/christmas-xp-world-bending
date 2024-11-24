// Vendor
import { Scene } from 'three'

// Modules
import Debugger from '@/js/managers/Debugger'

// Cameras
import MainCamera from '../cameras/MainCamera'
import Sphere from '../components/Sphere'
import CameraManager from '../managers/CameraManager'
import OrbitCamera from '../cameras/OrbitCamera'
import settings from './settings'

import {
	modelViewProjection,
	uniform,
	vec4,
	mix,
	normalWorld,
	color,
	smoothstep,
	Fn,
	If,
	vec3,
	sin,
	abs,
	float,
	Color,
} from 'three/tsl'
import Floor from '../components/Floor'
import Decor from '../components/Decor'

export default class MainView {
	config
	cameraManager
	scene
	renderer
	components
	debugFolder
	constructor({ config, renderer }) {
		// Options
		this.config = config
		this.renderer = renderer

		// Setup
		// replace with LoaderManager
		// this._resourceManager = this._createResourceManager()
		this.scene = this._createScene()
		this.cameraManager = this._createCameraManager()
		this.components = null

		this.debugFolder = this._createDebugFolder()

		// After loading
		this.components = this._createComponents()

		// update renderOrders
		// this._updateRenderOrder()

		const uRange = uniform(1)
		const uColorE = new Color('#C561B3')
		const uColorF = new Color('#1D0010')

		this.scene.backgroundNode = Fn(() => {
			const rangeY = normalWorld.smoothstep(uRange.mul(-1), uRange).sub(0.5).mul(2).abs()
			const result = vec3().toVar()

			result.rgb = mix(uColorE, uColorF, smoothstep(0.7, 1, rangeY))

			return result
		})()
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

	_createCameraManager() {
		const cameraManager = new CameraManager({
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

		cameraManager.activate(settings.camera.default)

		return cameraManager
	}

	/**
	 * Components
	 */
	_createComponents() {
		const components = {}
		// this.scene.add(ResourceLoader.get('watercolor/scene').scene)
		components.sphere = this._addComp(Sphere)
		components.floor = this._addComp(Floor)
		components.decor = this._addComp(Decor)
		return components
	}

	_addComp(Class) {
		const component = new Class({
			config: this.config,
			debug: this.debugFolder,
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

	/**
	 * Update
	 */
	update({ time, delta }) {
		this._updateComponents({ time, delta })
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

		// Debugger.on('save', () => {
		//   Debugger.save(settings, settings.file).then((e) => {
		//     if (e.status === 200) console.log(`Successfully saved file: ${settings.file}`)
		//   })
		// })
		return debugFolder
	}
}
