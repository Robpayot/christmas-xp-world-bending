// Tsl function to bend

import { abs, cameraProjectionMatrix, instanceIndex, normalize, modelViewMatrix, positionLocal, positionWorld, select, sqrt, vec2, vec4, InstancedInterleavedBuffer, DynamicDrawUsage, instancedDynamicBufferAttribute, instancedBufferAttribute, mat4, Fn, mat3, modelWorldMatrix, vec3, color, remap, clamp, output, mix, textureSize, textureLoad, int, ivec2, float, normalLocal, tangentLocal, drawIndex, cameraViewMatrix, modelNormalMatrix, normalWorld, sin, uv, positionView, texture, step, If, max, smoothstep, dot, cos, fract, PI, length, atan, acos, atan2 } from "three/tsl"
import BendManager from "../managers/BendManager"

// varying vec2 vUv;

// // Sphere center offset along Y-axis
// vec3 sphereCenter = vec3(0.0, -sphereOffset, 0.0);

// // Compute distance from the plane center (XZ plane)
// float distanceFromCenter = length(planePosition.xz);

// // Compute spherical coordinates (radius, theta, phi)
// float radius = length(planePosition - sphereCenter);
// float theta = atan(planePosition.z, planePosition.x); // Azimuthal angle
// float phi = acos((planePosition.y - sphereCenter.y) / radius); // Polar angle

// // Spherical position
// vec3 spherePosition;
// spherePosition.x = radius * sin(phi) * cos(theta);
// spherePosition.y = radius * cos(phi);
// spherePosition.z = radius * sin(phi) * sin(theta);

// // Interpolate based on progress and distance from center
// float morphFactor = progress * smoothstep(0.0, planeWidth * 0.5, distanceFromCenter);
// vec3 finalPosition = mix(planePosition, spherePosition, morphFactor);

// float lat = (uv.x - 0.5) * 90.0;
// float lon = abs((uv.y - 0.5) * 180.0);

// float latRad = lat * (PI / 180.0);
// float lonRad = lon * (PI / 180.0);

// float x = sin(latRad) * sin(lonRad);
// float y = cos(latRad);
// float z = cos(latRad) * sin(lonRad);

// Full shaders
export const vertexBendSphereNode = () =>
	// const { powerX, backX, powerY, backY } = BendManager
	Fn(() => {
		const planePosition = positionLocal.toVar()
		const sphereCenter = vec3(0.0, float(BendManager.radius).div(2), 0.0)
		const distanceFromCenter = length(planePosition.xz)

		// Compute spherical coordinates (radius, theta, phi)
		// const radius = length(planePosition.sub(sphereCenter))
		// const theta = atan(vec2(planePosition.z, planePosition.x)) // Azimuthal angle
		// const phi = acos((planePosition.y.sub(sphereCenter.y)).div(float(BendManager.radius).div(2))) // Polar angle

		// // Map plane vertices to spherical coordinates, based on UVs, 2D
		// const vUv = uv()
		const radius = float(BendManager.radius).div(2)
		// const theta = vUv.y.mul(PI) // Latitude
		// const phi = vUv.x.sub(-0.5).mul(2).mul(PI) // Longitude

		// // Compute spherical coordinates
		// const theta = float(planePosition.z.div(radius)).mul(PI) // Latitude
		// const phi = float(planePosition.x.div(radius)).mul(2).mul(PI) // Longitude

		// const spherePosition = vec3(0).toVar()
		// spherePosition.x = radius.mul(sin(theta)).mul(cos(phi))
		// spherePosition.y = radius.mul(cos(theta))
		// spherePosition.z = radius.mul(sin(theta)).mul(sin(phi))

		// BEND Z

		// Calculate circle center offset along the Z-axis
		const circleRadius = float(BendManager.radius).div(float(2).mul(PI)) // Radius to match plane length to circumference
		const centerZ = float(0) // Circle center is behind the plane

		// Apply bending based on progress
		const cylinderPosition = vec3(0).toVar()
		const angle = float(positionLocal.z).div(float(BendManager.radius)).mul(2.0).mul(PI) // Map Z to an angle around the circle
		cylinderPosition.z = centerZ.add(circleRadius.mul(sin(angle.mul(BendManager.progress)))) // Circular Z-coordinate
		cylinderPosition.x = positionLocal.x // Keep X the same
		cylinderPosition.y = positionLocal.y.add(circleRadius.mul((float(1.0).sub(cos(angle))))) // Adjust Y for bending

		// const morphFactor = smoothstep(0.0, float(BendManager.radius).div(2), distanceFromCenter).mul(BendManager.progress)
		const finalPosition = mix(planePosition, cylinderPosition, BendManager.progress)

		// Transform the vertex position
		// gl_Position = projectionMatrix * modelViewMatrix * vec4(spherePosition, 1.0)
		const transformed = modelViewMatrix.mul(finalPosition)

		// need access positionLocal after rotation (transformations), so vertexNode is the one, not positionNode
		// const curve = getBend(positionWorld.z, powerX, backX, powerY, backY)
		const mvPosition = vec4(transformed.xyz, transformed.w)

		return cameraProjectionMatrix.mul(mvPosition)
	})()

// Functions
/**
 * @param worldPosZ worldPosZ
 * @param ... bends options
*/
export const getBend = (worldPosZ, powerX, backX, powerY, backY) => {

	// Refs : https://github.com/AndrewRayCode/easing-utils/blob/master/src/easing.js
	const posZ = abs(worldPosZ).div(powerX).toVar()
	const xCurve = posZ.mul(posZ).mul(backX.add(1).mul(posZ).sub(backX)).mul(-1)

	const yposZ = abs(worldPosZ).div(powerY).toVar()
	const yCurve = yposZ.mul(yposZ).mul(backY.add(1).mul(yposZ).sub(backY)).mul(-1)

	return vec2(xCurve, yCurve)
}

export const getInstanceMatrixNode = (instancedMesh) => {
	const instanceAttribute = instancedMesh.instanceMatrix
	let instanceMatrixNode = null
	// Both WebGPU and WebGL backends have UBO max limited to 64kb. Matrix count number bigger than 1000 ( 16 * 4 * 1000 = 64kb ) will fallback to attribute.
	if (instancedMesh.count <= 1000) {
		instanceMatrixNode = buffer(instanceAttribute.array, 'mat4', instancedMesh.count).element(instanceIndex)
	} else {
		const buffer = new InstancedInterleavedBuffer(instanceAttribute.array, 16, 1)
		this.buffer = buffer
		const bufferFn = instanceAttribute.usage === DynamicDrawUsage ? instancedDynamicBufferAttribute : instancedBufferAttribute
		const instanceBuffers = [
			// F.Signature -> bufferAttribute( array, type, stride, offset )
			bufferFn(buffer, 'vec4', 16, 0),
			bufferFn(buffer, 'vec4', 16, 4),
			bufferFn(buffer, 'vec4', 16, 8),
			bufferFn(buffer, 'vec4', 16, 12)
		]

		instanceMatrixNode = mat4(...instanceBuffers)
	}

	return instanceMatrixNode
}

// Full shaders
export const vertexBendNode = () => {
	const { powerX, backX, powerY, backY } = BendManager
	return Fn(() => {
		const transformed = modelViewMatrix.mul(positionLocal)

		// need access positionLocal after rotation (transformations), so vertexNode is the one, not positionNode
		const curve = getBend(positionWorld.z, powerX, backX, powerY, backY)
		const mvPosition = vec4(transformed.add(curve).xyz, transformed.w)

		return cameraProjectionMatrix.mul(mvPosition)
	})()
}

export const vertexBendBatchedNode = (batchedMesh, varWorldPos, varNormalLocal) => {
	const { powerX, backX, powerY, backY } = BendManager
	return Fn((builder) => {
		// POSITION
		let batchingIdNode = null

		// WebGL fallback if
		if (batchingIdNode === null) {
			// check if https://github.com/mrdoob/three.js/blob/841ea631018e0bf40c7de1b54811101f77f1e1b3/src/renderers/webgl-fallback/nodes/GLSLNodeBuilder.js#L626
			if (builder.getDrawIndex() === null) {
				batchingIdNode = instanceIndex
			} else {
				batchingIdNode = drawIndex
			}
		}

		const getIndirectIndex = Fn(([id]) => {
			const size = textureSize(textureLoad(batchedMesh._indirectTexture), 0)
			const x = int(id).modInt(int(size))
			const y = int(id).div(int(size))
			return textureLoad(batchedMesh._indirectTexture, ivec2(x, y)).x

		}).setLayout({
			name: 'getIndirectIndex',
			type: 'uint',
			inputs: [{ name: 'id', type: 'int' }]
		})

		const matriceTexture = batchedMesh._matricesTexture

		const size = textureSize(textureLoad(matriceTexture), 0)
		const j = float(getIndirectIndex(int(batchingIdNode))).mul(4).toVar()

		const x = int(j.mod(size))
		const y = int(j).div(int(size))
		const batchingMatrix = mat4(
			textureLoad(matriceTexture, ivec2(x, y)),
			textureLoad(matriceTexture, ivec2(x.add(1), y)),
			textureLoad(matriceTexture, ivec2(x.add(2), y)),
			textureLoad(matriceTexture, ivec2(x.add(3), y))
		)

		const bm = mat3(batchingMatrix)
		const batchPos = batchingMatrix.mul(positionLocal).xyz

		// positionWorld is broken by vertexNode, had to recalculate here
		varWorldPos.assign(modelWorldMatrix.mul(batchPos))

		// Bending
		const transformed = modelViewMatrix.mul(batchPos)
		positionView.assign(transformed) // fix point lights <3

		const curve = getBend(varWorldPos.z, powerX, backX, powerY, backY)
		const mvPosition = vec4(transformed.add(curve).xyz, transformed.w)

		// Normals
		const transformedNormal = normalLocal.div(vec3(bm[ 0 ].dot(bm[ 0 ]), bm[ 1 ].dot(bm[ 1 ]), bm[ 2 ].dot(bm[ 2 ])))
		const batchingNormal = bm.mul(transformedNormal).xyz
		normalLocal.assign(batchingNormal)

		varNormalLocal.assign(normalLocal)

		if (builder.hasGeometryAttribute('tangent')) {
			tangentLocal.mulAssign(bm)
		}

		return cameraProjectionMatrix.mul(mvPosition)
	})()
}

// // Shader for the fog (need worldPos)
// export const fragmentFogNode = (varWorldPos) => Fn(() => {
// 	const extraRange = 3
// 	// const skyColor = color(SKY_COLOR)
// 	const fogPower = clamp(remap(varWorldPos.z, 20, 70))
// 	const rangeY = normalWorld.y.add(SKY_SETTINGS.uOffset).smoothstep(SKY_SETTINGS.uRange.mul(-1).mul(extraRange), SKY_SETTINGS.uRange.mul(extraRange)).sub(0.5).mul(2).abs()
// 	rangeY.mulAssign(float(1).add(sin(abs(normalWorld.x).add(SKY_SETTINGS.uTime)).sub(0.5).div(5)))
// 	const fogColor = mix(SKY_SETTINGS.uFogColorA, SKY_SETTINGS.uFogColorB, rangeY)
// 	// TODO: fix normals
// 	return mix(output, vec4(fogColor, output.a), fogPower)
// })()

// create a circle value in a frag shader
export const uvCircleNode = (min = 0, max = 1) => Fn(() => {
	const distProgress = uv().sub(0.5).mul(2).length().oneMinus()

	return distProgress.smoothstep(min, max)
})()

// From Threejs
export const transformNormal = /*@__PURE__*/ Fn(([normal, matrix = modelWorldMatrix]) => {

	const m = mat3(matrix)

	const transformedNormal = normal.div(vec3(m[ 0 ].dot(m[ 0 ]), m[ 1 ].dot(m[ 1 ]), m[ 2 ].dot(m[ 2 ])))

	return m.mul(transformedNormal).xyz

})
