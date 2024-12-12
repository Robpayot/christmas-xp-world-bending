import { Vector3 } from 'three'

const SETTINGS = {
	// file: './src/script/webgl/scenes/SceneSky/settings.js',
	camera: {
		default: 'orbit',
		position: new Vector3(50, 50, 50),
		fov: 60, // 83
		near: 0.1,
		far: 1020,
	},
	world: {
		size: 200,
		wide: 100,
		mobileWide: 30
	},
	isMobile: window.innerWidth < 768
}

export default SETTINGS