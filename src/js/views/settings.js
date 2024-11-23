import { Vector3 } from 'three'

export default {
	// file: './src/script/webgl/scenes/SceneSky/settings.js',
	camera: {
		default: 'orbit',
		position: new Vector3(50, 50, 50),
		fov: 60, // 83
		near: 0.1,
		far: 100000,
	},
}
