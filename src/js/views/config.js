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
			path: './models/pack_final2.glb'
		},
		{
			name: 'presents',
			type: 'gltf',
			path: './models/presents2_optimized.glb'
		},
		{
			name: 'santa_sleight',
			type: 'gltf',
			path: './models/santa_sleight_optimized.glb'
		},
		{
			name: 'hdrMap',
			type: 'hdr',
			path: './img/hdr/kloppenheim_02_1k.jpg'
		}
	],
}
