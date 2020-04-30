import {
	Mesh,
	Texture,
	Matrix4,
	ShaderMaterial,
	DoubleSide,
	BufferGeometry,
	Float32BufferAttribute
} from 'three';

import FAST from 'dranimate-fast';

export default class SkinnedMesh {
	constructor(verts: Array<Array<number>>, faces: Array<number>, handles: Array<number>, texture: Texture) {
		/* Create flat vertex array */
		const vertsFlatArray: Array<number> = verts.reduce((flatArray, vert) => flatArray.concat(vert[0], vert[1]), []);
		/* Flat faces array */
		const facesFlatArray: Array<number> = faces;
		/* Create flat handle array */
		this.handlesFlatArray = []; 
		handles.forEach(cp => {
			this.handlesFlatArray.push(vertsFlatArray[cp*2]);
			this.handlesFlatArray.push(vertsFlatArray[cp*2+1]);
		});
		/* Create FAST shape */
		const fastShape: any = FAST.createShape(vertsFlatArray, facesFlatArray, this.handlesFlatArray, 2);
		/* Get skinning weights from FAST shape */
		const weightsFlatArray: Array<number> = fastShape.getWeights();
		/* Promote 2D vertices to 3D */
		const verts3DFlatArray: Array<number> = [];
		for(var i=0; i<vertsFlatArray.length; i+=2) {
			verts3DFlatArray.push(vertsFlatArray[i]);
			verts3DFlatArray.push(vertsFlatArray[i+1]);
			verts3DFlatArray.push(0.0);
		}
		/* Split weights into an array per handle */
		const weights0: Array<number> = [];
		const weights1: Array<number> = [];
		const weights2: Array<number> = [];
		const weights3: Array<number> = [];
		const weights4: Array<number> = [];
		for(var i=0; i<weightsFlatArray.length; i+=5) {
			weights0.push(weightsFlatArray[i]);
			weights1.push(weightsFlatArray[i+1]);
			weights2.push(weightsFlatArray[i+2]);
			weights3.push(weightsFlatArray[i+3]);
			weights4.push(weightsFlatArray[i+4]);
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
		geometry.setIndex(facesFlatArray);
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
	}
	/* Get three.js mesh instance*/
	public getMesh(): Mesh {
		return this.mesh;
	}
	/* Call when handle position changed */
	public updateHandle(index: number, x: number, y:number): void {
		const originalX = this.handlesFlatArray[index*2+0];
		const originalY = this.handlesFlatArray[index*2+1];
		const handleTransform = new Matrix4().makeTranslation(x - originalX, y - originalY, 0.0);
		//handleTransform.premultiply(new Matrix4().makeRotationZ(0.0));
		handleTransform.transpose();
		// Testing temp
		const flat = handleTransform.toArray();
		this.skinningMaterial.uniforms.handleTransforms.value[index*16+0] = flat[0];
		this.skinningMaterial.uniforms.handleTransforms.value[index*16+1] = flat[1];
		this.skinningMaterial.uniforms.handleTransforms.value[index*16+2] = flat[2];
		this.skinningMaterial.uniforms.handleTransforms.value[index*16+3] = flat[3];
		this.skinningMaterial.uniforms.handleTransforms.value[index*16+4] = flat[4];
		this.skinningMaterial.uniforms.handleTransforms.value[index*16+5] = flat[5];
		this.skinningMaterial.uniforms.handleTransforms.value[index*16+6] = flat[6];
		this.skinningMaterial.uniforms.handleTransforms.value[index*16+7] = flat[7];
		this.skinningMaterial.uniforms.handleTransforms.value[index*16+8] = flat[8];
		this.skinningMaterial.uniforms.handleTransforms.value[index*16+9] = flat[9];
		this.skinningMaterial.uniforms.handleTransforms.value[index*16+10] = flat[10];
		this.skinningMaterial.uniforms.handleTransforms.value[index*16+11] = flat[11];
		this.skinningMaterial.uniforms.handleTransforms.value[index*16+12] = flat[12];
		this.skinningMaterial.uniforms.handleTransforms.value[index*16+13] = flat[13];
		this.skinningMaterial.uniforms.handleTransforms.value[index*16+14] = flat[14];
		this.skinningMaterial.uniforms.handleTransforms.value[index*16+15] = flat[15];
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
			depthWrite: false,
			wireframe: true,
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
			vec4 blendPosition;
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
			gl_FragColor = vec4(1.0,0.0,0.0,1.0);//texture2D(texture, vUv).rgb, 1.0);
		}
	`;
	private mesh: Mesh;
	private handlesFlatArray: Array<number>;
	private skinningMaterial: ShaderMaterial;
} 
