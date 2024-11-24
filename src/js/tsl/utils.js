// Tsl function to bend

import { abs, cameraProjectionMatrix, instanceIndex, normalize, modelViewMatrix, positionLocal, positionWorld, select, sqrt, vec2, vec4, InstancedInterleavedBuffer, DynamicDrawUsage, instancedDynamicBufferAttribute, instancedBufferAttribute, mat4, Fn, mat3, modelWorldMatrix, vec3, color, remap, clamp, output, mix, textureSize, textureLoad, int, ivec2, float, normalLocal, tangentLocal, drawIndex, cameraViewMatrix, modelNormalMatrix, normalWorld, sin, uv, positionView, texture, step, If, max, smoothstep, dot, cos, fract, PI, length, atan, acos, atan2, asin } from "three/webgpu"
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

// SPHERE TO PLANE

// uniform float progress; // Controls the morphing (0: full sphere, 1: flat plane)
// uniform float sphereRadius; // The radius of the sphere
// uniform float planeWidth; // Width of the final plane
// uniform float planeLength; // Length of the final plane

// void main() {
//     vec3 spherePosition = position; // Start with the spherical position

//     // Spherical to Cartesian Coordinates (assuming a sphere centered at (0,0,0))
//     float latitude = asin(spherePosition.y / sphereRadius); // Latitude
//     float longitude = atan(spherePosition.z, spherePosition.x); // Longitude

//     // Interpolate towards a plane along the X-Z plane
//     vec3 flatPosition;
//     flatPosition.x = (longitude + 3.14159265359) / (2.0 * 3.14159265359) * planeWidth - planeWidth / 2.0; // Map longitude to X
//     flatPosition.y = 0.0; // Flatten the Y coordinate (for the plane)
//     flatPosition.z = (latitude + 3.14159265359 / 2.0) / 3.14159265359 * planeLength - planeLength / 2.0; // Map latitude to Z

//     // Keep the top of the sphere fixed
//     if (progress < 1.0) {
//         flatPosition.y = spherePosition.y; // Keep top of the sphere at the same Y (North pole stays in place)
//     }

//     // Interpolate between the sphere and the flat plane based on progress
//     vec3 finalPosition = mix(spherePosition, flatPosition, progress);

//     // Apply final position
//     gl_Position = projectionMatrix * modelViewMatrix * vec4(finalPosition, 1.0);
// }

// Full shaders

// Start fast, decreasing velocity until stop
// export function easeOutCirc( t ) {

//     const t1 = t - 1;
//     return Math.sqrt( 1 - t1 * t1 );

// }

// export const getBend = (worldPosZ, powerX, backX, powerY, backY) => {

// 	const posZ = abs(worldPosZ).div(powerX).toVar()
// 	const xCurve = posZ.mul(posZ).mul(backX.add(1).mul(posZ).sub(backX)).mul(-1)

// 	const yposZ = abs(worldPosZ).div(powerY).toVar()
// 	const yCurve = yposZ.mul(yposZ).mul(backY.add(1).mul(yposZ).sub(backY)).mul(-1)

// 	return vec2(xCurve, yCurve)
// }

// Increasing velocity until stop
export function easeInCirc(t) {

	const scaledTime = t / 1
	return -1 * (Math.sqrt(1 - scaledTime * t) - 1)

}

// Full shaders
export const vertexBendNode = () =>
	// const { powerX, backX, powerY, backY } = BendManager
	Fn(() => {

		// Original vertex position
		const pos = positionWorld.toVar()

		// Calculate distance from the center
		const dist = length(pos.xz)
		const radius = float(BendManager.radius)

		// Spherical displacement (interpolate between flat and spherical)
		// if (dist <= radius) {
		// const theta = atan2(pos.z, pos.x) // Angle in the XZ plane
		// const phi = mix(0.0, acos(dist.div(radius)), BendManager.progress) // Angle from Y-axis
		// pos.x = radius.mul(sin(phi)).mul(cos(theta)) // New X position
		// pos.y = radius.mul(cos(phi)) // New Y position
		// pos.z = radius.mul(sin(phi)).mul(sin(theta)) // New Z position

		// }

		// // easeOuCirc curve
		// const worldPosZ = positionWorld.z
		// const maxDist = float(BendManager.deep)

		// const yposZ = worldPosZ.toVar()
		// const t1 = yposZ.sub(1)// maxDist
		// const yCurve = sqrt(float(1).sub(t1.mul(t1)))

		const scaledTime = pos.z.div(BendManager.progress)
		// const yCurve =  float(-1).mul(sqrt(float(1).sub(scaledTime.mul(pos.z))).sub(1))
		const zCurve = abs(pos.z.mul(pos.z.mul(BendManager.deep).mul(0.01)))
		const xCurve = abs(pos.x.mul(pos.x.mul(BendManager.deep).mul(0.01)))

		// Transform the vertex position
		const transformed = modelViewMatrix.mul(pos).toVar()
		transformed.y.subAssign(zCurve.add(xCurve))

		const mvPosition = vec4(transformed.xyz, transformed.w)

		return cameraProjectionMatrix.mul(mvPosition)
	})()
// Full shaders
export const vertexSphereToPlaneNode = () =>
	// const { powerX, backX, powerY, backY } = BendManager
	Fn(() => {
		const spherePosition = positionWorld.toVar()
		const planeWidth = float(BendManager.radius)
		const sphereRadius = float(BendManager.radius).div(2)
		// Spherical to Cartesian Coordinates (assuming a sphere centered at (0,0,0))
		const latitude = asin(spherePosition.y.div(sphereRadius))
		const longitude = atan2(spherePosition.z, spherePosition.x) // Longitude

		const flatPosition = vec3(0).toVar()
		flatPosition.x = longitude.add(PI).div(PI.mul(2)).mul(planeWidth).sub(planeWidth.div(2)) // Map longitude to X
		flatPosition.y = 0.0 // Flatten the Y coordinate (for the plane)
		flatPosition.z = latitude.add(PI.div(2)).div(PI).div(planeWidth).sub(planeWidth.div(2)) // Map latitude to Z

		// const morphFactor = smoothstep(0.0, float(BendManager.radius).div(2), distanceFromCenter).mul(BendManager.progress)
		const finalPosition = mix(spherePosition, flatPosition, BendManager.progress)

		// Transform the vertex position
		// gl_Position = projectionMatrix * modelViewMatrix * vec4(spherePosition, 1.0)
		const transformed = modelViewMatrix.mul(finalPosition)

		// need access positionLocal after rotation (transformations), so vertexNode is the one, not positionNode
		// const curve = getBend(positionWorld.z, powerX, backX, powerY, backY)
		const mvPosition = vec4(transformed.xyz, transformed.w)

		return cameraProjectionMatrix.mul(mvPosition)
	})()
export const vertexBendSphereNode = () =>
	// const { powerX, backX, powerY, backY } = BendManager
	Fn(() => {
		const planePosition = positionWorld.toVar()
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

		// Map the X and Z coordinates to spherical latitude and longitude
		const latitude =  float(positionWorld.z).div(float(BendManager.radius)).mul(PI).sub(PI.div(2))// Map Z to latitude (-pi/2 to pi/2)
		const longitude = float(positionWorld.x).div(float(BendManager.radius)).mul(PI) // Map X to longitude (0 to pi)
		// Calculate the spherical position

		const sphericalPosition = vec3(0).toVar()
		sphericalPosition.x = radius.mul(cos(latitude)).mul(cos(longitude))
		sphericalPosition.y = radius.mul(sin(latitude))
		sphericalPosition.z = radius.mul(cos(latitude)).mul(sin(longitude))

		// BEND Z

		// Calculate circle center offset along the Z-axis
		const circleRadius = float(BendManager.radius).div(float(2).mul(PI)) // Radius to match plane length to circumference
		const centerZ = float(0) // Circle center is behind the plane

		// Apply bending based on progress
		const cylinderPosition = vec3(0).toVar()
		const angle = float(positionWorld.z).div(float(BendManager.radius)).mul(2.0).mul(PI) // Map Z to an angle around the circle
		cylinderPosition.z = centerZ.add(circleRadius.mul(sin(angle.mul(BendManager.progress)))) // Circular Z-coordinate
		cylinderPosition.x = positionWorld.x // Keep X the same
		cylinderPosition.y = positionWorld.y.add(circleRadius.mul((float(1.0).sub(cos(angle))))) // Adjust Y for bending

		// const morphFactor = smoothstep(0.0, float(BendManager.radius).div(2), distanceFromCenter).mul(BendManager.progress)
		const finalPosition = mix(planePosition, sphericalPosition, BendManager.progress)

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

export const vertexBendBatchedNode = (batchedMesh, varWorldPos, varNormalLocal) => Fn((builder) => {
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
	const transformed = modelViewMatrix.mul(batchPos).toVar()
	positionView.assign(transformed) // fix point lights <3

	const zCurve = abs(batchPos.z.mul(batchPos.z.mul(BendManager.deep).mul(0.01)))
	const xCurve = abs(batchPos.x.mul(batchPos.x.mul(BendManager.deep).mul(0.01)))

	// Transform the vertex position
	// const transformed = modelViewMatrix.mul(pos)
	transformed.y.subAssign(zCurve.add(xCurve))

	const mvPosition = vec4(transformed.xyz, transformed.w)

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
