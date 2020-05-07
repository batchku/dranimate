import {
	Mesh,
	Texture,
	Vector2,
	Vector3,
	Matrix4,
	Face3,
	MeshBasicMaterial,
	ShaderMaterial,
	DoubleSide,
	Geometry,
	BufferGeometry,
	Float32BufferAttribute
} from 'three';

import { Shape } from 'dranimate-fast'; 

export default class SkinnedMesh {
	constructor(verts: Array<Array<number>>, faces: Array<number>, handles: Array<number>, texture: Texture) {
		/* Create flat vertex array */
		this.vertsFlatArray = verts.reduce((flatArray, vert) => flatArray.concat(vert[0], vert[1]), []);
		/* Flat faces array */
		this.facesFlatArray = faces;
		/* Create flat handle array */
		this.handlesFlatArray = [];
		this.handleTranslationsFlatArray = [];
		handles.forEach(cp => {
			this.handlesFlatArray.push(this.vertsFlatArray[cp*2]);
			this.handlesFlatArray.push(this.vertsFlatArray[cp*2+1]);
			this.handleTranslationsFlatArray.push(this.vertsFlatArray[cp*2]);
			this.handleTranslationsFlatArray.push(this.vertsFlatArray[cp*2+1]);
		});
		/* Create FAST shape */
		this.fastShape = new Shape(this.vertsFlatArray, this.facesFlatArray, this.handlesFlatArray, 2);
		/* Get skinning weights from FAST shape */
		this.weightsFlatArray = this.fastShape.getWeights();
		/* Promote 2D vertices to 3D */
		const verts3DFlatArray: Array<number> = [];
		for(var i=0; i<this.vertsFlatArray.length; i+=2) {
			verts3DFlatArray.push(this.vertsFlatArray[i]);
			verts3DFlatArray.push(this.vertsFlatArray[i+1]);
			verts3DFlatArray.push(0.0);
		}
		/* Split weights into an array per handle */
		const weights0: Array<number> = [];
		const weights1: Array<number> = [];
		const weights2: Array<number> = [];
		const weights3: Array<number> = [];
		const weights4: Array<number> = [];
		for(var i=0; i<this.weightsFlatArray.length; i+=5) {
			weights0.push(this.weightsFlatArray[i]);
			weights1.push(this.weightsFlatArray[i+1]);
			weights2.push(this.weightsFlatArray[i+2]);
			weights3.push(this.weightsFlatArray[i+3]);
			weights4.push(this.weightsFlatArray[i+4]);
		}
		/* Create UVs */
		const uvs: Array<number> = [];
		const width = texture.image.width;
		const height = texture.image.height;
		for(var i=0; i<verts.length; i++) {
			const vert = verts[i];
			uvs.push(vert[0] / width);
			uvs.push(1.0 - (vert[1] / height));
		}
		/* Create geoemetry */
		const geometry = new BufferGeometry();
		geometry.setIndex(this.facesFlatArray);
		geometry.setAttribute('position', new Float32BufferAttribute(verts3DFlatArray, 3));  
		geometry.setAttribute('weight0', new Float32BufferAttribute(weights0, 1));
		geometry.setAttribute('weight1', new Float32BufferAttribute(weights1, 1));
		geometry.setAttribute('weight2', new Float32BufferAttribute(weights2, 1));
		geometry.setAttribute('weight3', new Float32BufferAttribute(weights3, 1));
		geometry.setAttribute('weight4', new Float32BufferAttribute(weights4, 1));
		geometry.setAttribute('uv', new Float32BufferAttribute(uvs, 2));
		/* Create skinning material */
		this.createMaterial(texture, this.handlesFlatArray);
		/* Create mesh */
		this.mesh = new Mesh(geometry, this.skinningMaterial);
		/* Create cpu side proxy mesh */
		this.proxyGeometry = new Geometry();
		this.proxyMesh = new Mesh(this.proxyGeometry, new MeshBasicMaterial({wireframe: true}));
		verts.map((vertex) => new Vector3(vertex[0], vertex[1], 0)).forEach(vertex => this.proxyGeometry.vertices.push(vertex));
		for(let i = 0; i < this.facesFlatArray.length-9; i+=3) {
			const f1 = this.facesFlatArray[i];
			const f2 = this.facesFlatArray[i + 1];
			const f3 = this.facesFlatArray[i + 2];
			this.proxyGeometry.faces.push(new Face3(f1, f2, f3));
		}
		/* Initial update */
		this.update(1.0);
		/* Initialise proxy mesh */	
		this.updateProxy({x: 0.0, y: 0.0}, 1.0);
	}
	/* Get three.js mesh instance*/
	getMesh(): Mesh {
		return this.mesh;
	}
	/* Get three.js cpu side proxy mesh instance*/
	getProxyMesh(): Mesh {
		return this.proxyMesh;
	}
	/* Get three.js cpu side proxy mesh instance*/
	getProxyGeometry(): Geometry {
		return this.proxyGeometry;
	}
	/* Update skinned mesh */
	update(scale): void {
		const numHandles = this.handlesFlatArray.length / 2;
		// Update scale
		this.mesh.scale.set(scale, scale, 1.0);
		//this.handleTransformsFlatArray = this.fastShape.update(this.handleTranslationsFlatArray);
		//console.log('HANDLE TRANSFORMS: ', this.handleTransformsFlatArray);
		//console.log('----');
		var centerOfGravityX = 0.0;
		var centerOfGravityY = 0.0;
		for(var h=0; h<5; h++) {
			centerOfGravityX += this.handleTranslationsFlatArray[h*2+0];
			centerOfGravityY += this.handleTranslationsFlatArray[h*2+1];
		}
		centerOfGravityX /= 5;
		centerOfGravityY /= 5;
		var centerOfGravityOrigX = 0.0;
		var centerOfGravityOrigY = 0.0;
		for(var h=0; h<5; h++) {
			centerOfGravityOrigX += this.handlesFlatArray[h*2+0];
			centerOfGravityOrigY += this.handlesFlatArray[h*2+1];
		}
		centerOfGravityOrigX /= 5;
		centerOfGravityOrigY /= 5;
		var averageHandleRotation = 0.0;
		const handleDampers = []; 
		for(var h=0; h<5; h++) {
			const originalX = this.handlesFlatArray[h*2+0];
			const originalY = this.handlesFlatArray[h*2+1];
			const x = this.handleTranslationsFlatArray[h*2+0];
			const y = this.handleTranslationsFlatArray[h*2+1];
			const xFromCenter = x - centerOfGravityX;
			const yFromCenter = y - centerOfGravityY;
			const origXFromCenter = originalX - centerOfGravityOrigX;
			const origYFromCenter = originalY - centerOfGravityOrigY;
			const dot = origXFromCenter*xFromCenter + origYFromCenter*yFromCenter; // dot product between [x1, y1] and [x2, y2]
			const det = origXFromCenter*yFromCenter - origYFromCenter*xFromCenter; // determinant
			const zRotation = Math.atan2(det, dot); 
			const distanceFromCenter = Math.min(Math.sqrt(xFromCenter*xFromCenter+yFromCenter*yFromCenter)*0.01, 1.0);
			handleDampers.push({
				distanceFromCenter,
				zRotation
			});
			averageHandleRotation += zRotation * Math.min(((distanceFromCenter * distanceFromCenter - 0.8)), 1.0);
		}
		averageHandleRotation /= numHandles;
		console.log('av rot', averageHandleRotation);
		for(var h=0; h<5; h++) {
			const { distanceFromCenter } = handleDampers[h];
			const { zRotation } = handleDampers[h];
			const followFactor = distanceFromCenter;
			const finalRotation = lerp(0.0, zRotation, followFactor); 
			console.log(h, 'finalRot', finalRotation * 360 / (2*3.1415), zRotation * 360 / (2*3.1415), followFactor);
			const handleTransform = this.buildHandleTransform(h, finalRotation);
			const flat = handleTransform.toArray();
			// Update shader transform uniforms
			for(var t=0; t<16; t++) {
				this.skinningMaterial.uniforms.handleTransforms.value[h*16+t] = flat[t];
			}
		}
	}
	/* Update proxy mesh */
	updateProxy(puppetCenter, scale): void {
		const proxyGeometry = this.getProxyGeometry();
		for (let i = 0; i < this.vertsFlatArray.length; i += 2) {
			const vertexX = this.vertsFlatArray[i+0];
			const vertexY = this.vertsFlatArray[i+1];
			// Calculate vertex skinned position
			var skinnedX = vertexX;
			var skinnedY = vertexY;
			for (let h = 0; h < 5; h++) {
				const originalX = this.handlesFlatArray[h*2+0];
				const originalY = this.handlesFlatArray[h*2+1];
				const x = this.handleTranslationsFlatArray[h*2+0];
				const y = this.handleTranslationsFlatArray[h*2+1];
				const handleWeight = this.weightsFlatArray[(i/2)*5+h];
				//console.log('WEIGHT', this.weightsFlatArray[(i/2)*5+h]);	
				//console.log('H', h, handleX, handleY, handleWeight);
				skinnedX += (x - originalX) * handleWeight;
				skinnedY += (y - originalY) * handleWeight;
			}
			// Recenter
			// SKTODO: Remove
			const point = new Vector2(skinnedX, skinnedY)
				.sub(puppetCenter)
				.multiplyScalar(scale)
				.add(puppetCenter);
			const vertex = proxyGeometry.vertices[i / 2];
			vertex.x = point.x;
			vertex.y = point.y;
		}
		proxyGeometry.vertices[0].x = proxyGeometry.vertices[proxyGeometry.vertices.length-1].x;
		proxyGeometry.vertices[0].y = proxyGeometry.vertices[proxyGeometry.vertices.length-1].y;
		this.proxyGeometry.verticesNeedUpdate = true;
	}
	/* Call when handle position changed */
	updateHandle(index: number, x: number, y:number): void {
		this.handleTranslationsFlatArray[index*2+0] = x;
		this.handleTranslationsFlatArray[index*2+1] = y;
	}
	private buildHandleTransform(h: number, zRotation: number): Matrix4 {
		const originalX = this.handlesFlatArray[h*2+0];
		const originalY = this.handlesFlatArray[h*2+1];
		const x = this.handleTranslationsFlatArray[h*2+0];
		const y = this.handleTranslationsFlatArray[h*2+1];
		// Transform vertex into handle space
		const handleTransform = new Matrix4().makeTranslation(-originalX, -originalY, 0.0);
		// Rotate vertex around handle
		handleTransform.premultiply(new Matrix4().makeRotationZ(zRotation));
		// Transform vertex back into model space
		handleTransform.premultiply(new Matrix4().makeTranslation(originalX, originalY, 0.0));
		// Translate vertex toward handle
		handleTransform.premultiply(new Matrix4().makeTranslation(x-originalX, y-originalY, 0.0));
		handleTransform.transpose();
		return handleTransform;
	}
	/* Create three.js material for updating skin */
	private createMaterial(texture: object, handlesFlatArray: Array<number>) {
		var handleTransforms = [];
		for(var c=0; c<handlesFlatArray.length; c+=2) {
			const handleTransform = new Matrix4();
			handleTransform.transpose();
			handleTransforms = handleTransforms.concat(handleTransform.toArray());
		}
		const uniforms: object = {
			texture: { value: texture },
			handleTransforms: { value: Float32Array.from(handleTransforms) } 
		}
		this.skinningMaterial =  new ShaderMaterial({
			uniforms: uniforms,
			vertexShader: SkinnedMesh.vertexShader,
			fragmentShader: SkinnedMesh.fragmentShader,
			side: DoubleSide,
			transparent: true,
			depthWrite: false
		})
	}

	private static vertexShader: string = `
		attribute float weight0;
		attribute float weight1;
		attribute float weight2;
		attribute float weight3;
		attribute float weight4;
		uniform mat4 handleTransforms[5]; 
		varying vec2 vUv;
		void main() {
			vUv = uv;
			vec4 pos = vec4(position, 1.0);
			mat4 skinTransform = handleTransforms[0] * weight0; 
			skinTransform += handleTransforms[1] * weight1; 
			skinTransform += handleTransforms[2] * weight2; 
			skinTransform += handleTransforms[3] * weight3; 
			skinTransform += handleTransforms[4] * weight4; 
			vec4 modelViewPosition = modelViewMatrix * (pos * skinTransform);
			gl_Position = projectionMatrix * modelViewPosition;
		}
	`;
	private static fragmentShader: string = `
		uniform sampler2D texture;
		varying vec2 vUv;
		void main() {
			gl_FragColor = vec4(texture2D(texture, vUv).rgb, 1.0);
		}
	`;
	private vertsFlatArray: Array<number>; 
	private facesFlatArray: Array<number>;
	private weightsFlatArray: Array<number>;
	private mesh: Mesh;
	private proxyMesh: Mesh;
	private proxyGeometry: Geometry;
	private handlesFlatArray: Array<number>;
	private handleTranslationsFlatArray: Array<number>;
	private handleTransformsFlatArray: Array<number>;
	private skinningMaterial: ShaderMaterial;
	private fastShape;
} 

function lerp(value1, value2, amount) {
	amount = amount < 0 ? 0 : amount;
	amount = amount > 1 ? 1 : amount;
	return value1 + (value2 - value1) * amount;
}
