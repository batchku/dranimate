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
		console.log('UVS', uvs);
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
		/* Create cpu side picking mesh */
		this.pickingGeometry = new Geometry();
		this.pickingMesh = new Mesh(this.pickingGeometry, new MeshBasicMaterial({wireframe: true}));
		verts.map((vertex) => new Vector3(vertex[0], vertex[1], 0)).forEach(vertex => this.pickingGeometry.vertices.push(vertex));
		for(let i = 0; i < this.facesFlatArray.length; i+=3) {
			const f1 = this.facesFlatArray[i];
			const f2 = this.facesFlatArray[i + 1];
			const f3 = this.facesFlatArray[i + 2];
			this.pickingGeometry.faces.push(new Face3(f1, f2, f3 ));
		}
		/* Initial update */
		this.update();
		/* Initialise picking mesh */	
		this.updatePicking({x: 0.0, y: 0.0}, 1.0);
	}
	/* Get three.js mesh instance*/
	getMesh(): Mesh {
		return this.mesh;
	}
	/* Get three.js cpu side picking mesh instance*/
	getPickingMesh(): Mesh {
		return this.pickingMesh;
	}
	/* Get three.js cpu side picking mesh instance*/
	getPickingGeometry(): Geometry {
		return this.pickingGeometry;
	}
	/* Update skinned mesh */
	update(): void {
		this.handleTransformsFlatArray = this.fastShape.update(this.handleTranslationsFlatArray);
		//console.log('HANDLE TRANSFORMS: ', this.handleTransformsFlatArray);
		for(var i=0; i<5; i++) {
			const originalX = this.handlesFlatArray[i*2+0];
			const originalY = this.handlesFlatArray[i*2+1];
			const x = this.handleTranslationsFlatArray[i*2+0];
			const y = this.handleTranslationsFlatArray[i*2+1];
			//const handleTransform = (new Matrix4()).fromArray(this.handleTransformsFlatArray, i*12);
			const handleTransform = new Matrix4().makeTranslation(x - originalX, y - originalY, 0.0);
			handleTransform.premultiply(new Matrix4().makeRotationZ(0.0));
			handleTransform.transpose();
			const flat = handleTransform.toArray();
			this.skinningMaterial.uniforms.handleTransforms.value[i*16+0] = flat[0];
			this.skinningMaterial.uniforms.handleTransforms.value[i*16+1] = flat[1];
			this.skinningMaterial.uniforms.handleTransforms.value[i*16+2] = flat[2];
			this.skinningMaterial.uniforms.handleTransforms.value[i*16+3] = flat[3];
			this.skinningMaterial.uniforms.handleTransforms.value[i*16+4] = flat[4];
			this.skinningMaterial.uniforms.handleTransforms.value[i*16+5] = flat[5];
			this.skinningMaterial.uniforms.handleTransforms.value[i*16+6] = flat[6];
			this.skinningMaterial.uniforms.handleTransforms.value[i*16+7] = flat[7];
			this.skinningMaterial.uniforms.handleTransforms.value[i*16+8] = flat[8];
			this.skinningMaterial.uniforms.handleTransforms.value[i*16+9] = flat[9];
			this.skinningMaterial.uniforms.handleTransforms.value[i*16+10] = flat[10];
			this.skinningMaterial.uniforms.handleTransforms.value[i*16+11] = flat[11];
			this.skinningMaterial.uniforms.handleTransforms.value[i*16+12] = flat[12];
			this.skinningMaterial.uniforms.handleTransforms.value[i*16+13] = flat[13];
			this.skinningMaterial.uniforms.handleTransforms.value[i*16+14] = flat[14];
			this.skinningMaterial.uniforms.handleTransforms.value[i*16+15] = flat[15];
		}
	}
	/* Update picking mesh */
	updatePicking(puppetCenter, scale): void {
		console.log('UPDATE PICKING');
		const pickingGeometry = this.getPickingGeometry();
		for (let i = 0; i < this.vertsFlatArray.length; i += 2) {
			const vertexX = this.vertsFlatArray[i+0];
			const vertexY = this.vertsFlatArray[i+1];
			// Calculate vertex skinned position
			var skinnedX = vertexX;
			var skinnedY = vertexY;
			/*
			for (let h = 0; h < 5; h++) {
				const handleX = this.handlesFlatArray[h*2+0];
				const handleY = this.handlesFlatArray[h*2+1];
				const handleWeight = this.weightsFlatArray[(i/2)*5+h];
				//console.log('WEIGHT', this.weightsFlatArray[(i/2)*5+h]);	
				//console.log('H', h, handleX, handleY, handleWeight);
				skinnedX += vertexX * handleX * handleWeight;
				skinnedY += vertexY * handleY * handleWeight;
			}
			*/
			// Recenter
			const point = new Vector2(skinnedX, skinnedY)
				.sub(puppetCenter)
				.multiplyScalar(scale)
				.add(puppetCenter);
			const vertex = pickingGeometry.vertices[i / 2];
			vertex.x = point.x;
			vertex.y = point.y;
		}
	}
	/* Call when handle position changed */
	updateHandle(index: number, x: number, y:number): void {
		this.handleTranslationsFlatArray[index*2+0] = x;
		this.handleTranslationsFlatArray[index*2+1] = y;
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
			vec4 blendPosition = vec4(0.0);
			blendPosition += pos * handleTransforms[0] * weight0; 
			blendPosition += pos * handleTransforms[1] * weight1; 
			blendPosition += pos * handleTransforms[2] * weight2; 
			blendPosition += pos * handleTransforms[3] * weight3; 
			blendPosition += pos * handleTransforms[4] * weight4; 
			vec4 modelViewPosition = modelViewMatrix * blendPosition;
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
	private pickingMesh: Mesh;
	private pickingGeometry: Geometry;
	private handlesFlatArray: Array<number>;
	private handleTranslationsFlatArray: Array<number>;
	private handleTransformsFlatArray: Array<number>;
	private skinningMaterial: ShaderMaterial;
	private fastShape;
} 
