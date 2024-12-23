// Test import of a JavaScript module
import { setTimeout } from 'timers'
import WebGPUApp from './WebGPUApp'
import LoaderManager from './managers/LoaderManager'
import UILoader from './ui/Loader'
import UIPopin from './ui/Popin'
import DeviceSettings from './utils/DeviceSettings'
import config from './views/config'

;(async () => {
	// Preload assets before initiating the scene

	const loaderEl = document.querySelector('[data-loader]')
	const loader = new UILoader(loaderEl)

	// scene
	await DeviceSettings.init()
	await LoaderManager.load([...config.resources])

	const uiEl = document.querySelector('[data-ui]')
	const popin = new UIPopin(uiEl)

	const canvas = document.querySelector('[data-scene]')

	new WebGPUApp({ canvas, isDevelopment: true, isReady: (multiDraw) => {
		if (!multiDraw) {
			popin.noMultiDraw()
		}
		setTimeout(() => {
			loader.loaded()
		}, 1000)
	} })

})()
