import { MeshStandardNodeMaterial } from 'three/webgpu'

export function physicalToStandardMatNode(physicalMaterial) {
	const standardMaterial = new MeshStandardNodeMaterial()

	// Copy over properties from PhysicalMaterial to StandardMaterial
	standardMaterial.color.copy(physicalMaterial.color)
	standardMaterial.metalness = 0.3//physicalMaterial.metalness
	standardMaterial.roughness = 0.7//physicalMaterial.roughness
	// standardMaterial.metalness = physicalMaterial.metalness
	// standardMaterial.roughness = physicalMaterial.roughness
	// console.log('metalness', physicalMaterial.metalness, 'roughness', physicalMaterial.roughness)

	standardMaterial.map = physicalMaterial.map
	// standardMaterial.envMap = physicalMaterial.envMap
	standardMaterial.normalMap = physicalMaterial.normalMap

	// Additional shared properties you might want to copy
	// standardMaterial.emissive.copy(physicalMaterial.emissive)
	// standardMaterial.emissiveIntensity = physicalMaterial.emissiveIntensity
	// standardMaterial.emissiveMap = physicalMaterial.emissiveMap
	// standardMaterial.aoMap = physicalMaterial.aoMap
	// standardMaterial.aoMapIntensity = physicalMaterial.aoMapIntensity
	// standardMaterial.lightMap = physicalMaterial.lightMap
	// standardMaterial.lightMapIntensity = physicalMaterial.lightMapIntensity
	// standardMaterial.alphaMap = physicalMaterial.alphaMap
	// standardMaterial.bumpMap = physicalMaterial.bumpMap
	// standardMaterial.bumpScale = physicalMaterial.bumpScale
	// standardMaterial.displacementMap = physicalMaterial.displacementMap
	// standardMaterial.displacementScale = physicalMaterial.displacementScale
	// standardMaterial.displacementBias = physicalMaterial.displacementBias
	// standardMaterial.reflectivity = physicalMaterial.reflectivity

	return standardMaterial

}

// test rewrite lights in TSL

// import { nodes } from 'three/examples/jsm/renderers/nodes/Nodes.js'; // Import the nodes

// // Create your InstancedMesh
// const geometry = new THREE.BoxGeometry(1, 1, 1);
// const material = new THREE.MeshStandardMaterial(); // Initially use a standard material
// const instancedMesh = new THREE.InstancedMesh(geometry, material, 100);

// // Define nodes for Phong lighting using TSL

// // Light position as a uniform node (replace with your light's position)
// const lightPositionNode = new nodes.UniformNode(new THREE.Vector3(10, 10, 10));

// // Normal in world space
// const normalNode = new nodes.NormalNode(nodes.NormalNode.WORLD);

// // Position of vertices in world space
// const positionNode = new nodes.PositionNode(nodes.PositionNode.WORLD);

// // Calculate the light direction
// const lightDirectionNode = nodes.normalize(nodes.sub(lightPositionNode, positionNode));

// // Calculate the diffuse component using the dot product between light direction and normal
// const diffuseNode = nodes.max(nodes.dot(lightDirectionNode, normalNode), 0.0);

// // Calculate view direction from the camera
// const viewDirectionNode = nodes.normalize(nodes.sub(positionNode, new nodes.CameraNode()));

// // Calculate reflection direction
// const reflectionDirectionNode = nodes.reflect(lightDirectionNode, normalNode);

// // Specular component (Phong specular)
// const shininess = 30.0; // Adjust the shininess factor as needed
// const specularNode = nodes.pow(nodes.max(nodes.dot(reflectionDirectionNode, viewDirectionNode), 0.0), shininess);

// // Combine ambient, diffuse, and specular components for Phong shading
// const ambientColorNode = new nodes.ColorNode(new THREE.Color(0.1, 0.1, 0.1)); // Adjust ambient color as needed
// const diffuseColorNode = new nodes.ColorNode(new THREE.Color(1, 1, 1)); // Diffuse color
// const specularColorNode = new nodes.ColorNode(new THREE.Color(1, 1, 1)); // Specular color

// const phongLightingNode = nodes.add(
//   ambientColorNode,
//   nodes.mul(diffuseColorNode, diffuseNode),
//   nodes.mul(specularColorNode, specularNode)
// );

// // Create a Phong-like material using nodes
// const phongMaterial = new nodes.MeshStandardNodeMaterial();
// phongMaterial.colorNode = phongLightingNode; // Assign the calculated Phong lighting

// instancedMesh.material = phongMaterial;
