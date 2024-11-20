// Vendor
import { Scene } from 'three'

// Modules
import Debugger from '@/js/managers/Debugger'

// Cameras
import MainCamera from '../cameras/MainCamera'
import SphereComponent from '../components/ComponentSphere/'
import CameraManager from '../managers/CameraManager'
import OrbitCamera from '../cameras/OrbitCamera'
import settings from './settings'

export default class MainView {
  #config
  #cameraManager
  #scene
  #renderer
  #components
  #debugFolder
  constructor({ config, renderer }) {
    // Options
    this.#config = config
    this.#renderer = renderer

    // Setup
    // replace with LoaderManager
    // this._resourceManager = this._createResourceManager()
    this.#scene = this._createScene()
    this.#cameraManager = this._createCameraManager()
    this.#components = null

    this.#debugFolder = this._createDebugFolder()

    // After loading
    this.#components = this._createComponents()
  }

  destroy() {
    this._destroyComponents()
  }

  /**
   * Getters & Setters
   */
  get scene() {
    return this.#scene
  }

  get camera() {
    return this.#cameraManager?.active?.instance
  }

  /**
   * Private
   */
  _createResourceManager() {
    // const resourceManager = new ResourceManager({
    //   namespace: this.#config.name,
    // })
    // return resourceManager
  }

  _createScene() {
    const scene = new Scene()
    return scene
  }

  _createCameraManager() {
    const cameraManager = new CameraManager({
      scene: this.#scene,
      config: this.#config,
      renderer: this.#renderer,
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
    // this.#scene.add(ResourceLoader.get('watercolor/scene').scene)
    components.sphere = this._createSphereComponent()
    return components
  }

  _createSphereComponent() {
    const component = new SphereComponent({
      config: this.#config,
      debug: this.#debugFolder,
    })

    this.#scene.add(component)

    return component
  }

  _destroyComponents() {
    if (!this.#components) return
    for (const key in this.#components) {
      if (typeof this.#components[key].destroy === 'function') this.#components[key].destroy()
    }
  }

  /**
   * Update
   */
  update({ time, delta }) {
    this._updateComponents({ time, delta })
    this.#cameraManager.update({ time, delta })
  }

  _updateComponents({ time, delta }) {
    let component
    for (const key in this.#components) {
      component = this.#components[key]
      if (typeof component.update === 'function') {
        component.update({ time, delta })
      }
    }
  }

  /**
   * Resize
   */
  resize({ width, height }) {
    this.#cameraManager.resize({ width, height })

    // resize components
    let component
    for (const key in this.#components) {
      component = this.#components[key]
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

    const debugFolder = Debugger.addFolder({ title: `Scene ${this.#config.name}`, expanded: true })

    // Debugger.on('save', () => {
    //   Debugger.save(settings, settings.file).then((e) => {
    //     if (e.status === 200) console.log(`Successfully saved file: ${settings.file}`)
    //   })
    // })
    return debugFolder
  }
}
