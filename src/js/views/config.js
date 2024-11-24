import { RepeatWrapping } from 'three'

export default {
	name: 'Main',

	resources: [
		// {
		//   name: 'scene',
		//   type: 'gltf',
		//   path: './models/CS_Final_Scene_Baked_merge_v5.glb',
		// },
		{
			name: "matcap",
			type: "texture",
			path: "./img/matcap.png",
		},
		{
			name: 'decor',
			type: 'gltf',
			path: '/models/pack_assets.glb'
		}
	],
}
