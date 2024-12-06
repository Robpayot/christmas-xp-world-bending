// Test import of a JavaScript module
import WebGPUApp from './WebGPUApp'
import LoaderManager from './managers/LoaderManager'
import DeviceSettings from './utils/DeviceSettings'
import config from './views/config'

;(async () => {
	// Preload assets before initiating the scene

	// scene
	await DeviceSettings.init()
	await LoaderManager.load([...config.resources])

	const canvas = document.querySelector('.scene')

	new WebGPUApp({ canvas, isDevelopment: true })
})()
