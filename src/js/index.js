// Test import of a JavaScript module
import WebGPUApp from './WebGPUApp'
import LoaderManager from './managers/LoaderManager'
import Settings from './utils/Settings'
import config from './views/config'

;(async () => {
	// Preload assets before initiating the scene

	// scene
	await Settings.init()
	await LoaderManager.load([...config.resources])

	const canvas = document.querySelector('.scene')

	new WebGPUApp({ canvas, isDevelopment: true })
})()
