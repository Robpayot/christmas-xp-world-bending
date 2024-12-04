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
			name: "texture_main",
			type: "texture",
			path: "./img/Textures1.png",
		},
		{
			name: 'decor',
			type: 'gltf',
			path: './models/pack_assets3.glb'
		},
		{
			name: 'presents',
			type: 'gltf',
			path: './models/presents.glb'
		}
	],
}