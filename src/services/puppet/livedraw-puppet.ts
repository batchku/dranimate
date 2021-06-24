import * as THREE from 'three';

import eventManager from 'services/eventManager/event-manager';

import BasePuppet from './base-puppet'
import { clearObject } from 'services/util/threeUtil';
import dranimate from 'services/dranimate/dranimate';
import generateUniqueId from 'services/util/uuid';

export default class LivedrawPuppet extends BasePuppet {
	public type: string;
	public isRecording: boolean;
	public playing: boolean;
	public frames: any[] = [];
	public currentFrame = 0;
	public playbackDirection = 1;
	public opacity = 1;
	public invert = 1;
	public softness = 1;
	public threshold = 0.5;

	constructor() {
		super();

		this.type = 'livedraw';

		this.id = generateUniqueId();
	}

	public clearRecording(): void {
		this.frames = [];
		this.playing = false;
		this.playbackDirection = 1;
		this.currentFrame = 0;

		if (this.threeMesh.material instanceof THREE.ShaderMaterial) {
			this.threeMesh.material.uniforms.tex0.value = dranimate.liveFeedRenderTarget.texture;
		}
	}

	public update(): void {
		const dx = this.current.position.x - this.previous.position.x;
		const dy = this.current.position.y - this.previous.position.y;
		const shouldMoveXY = dx !== 0 || dy !== 0;
		const shouldScale = this.previous.scale !== this.current.scale;
		const shouldRotate = this.previous.rotation !== this.current.rotation;
		this.previous.position.x = this.current.position.x;
		this.previous.position.y = this.current.position.y;
	
		// SCALE PUPPET
		if (shouldScale) {
			this.previous.scale = this.current.scale;
			
			this.threeMesh.scale.set(this.current.scale, this.current.scale, this.current.scale);
		}
	
		// ROTATE PUPPET
		if (shouldRotate) {
			const deltaRotation = this.current.rotation - this.previous.rotation;
			this.previous.rotation = this.current.rotation;

			this.threeMesh.rotateZ(-deltaRotation);
		}
	
		// TRANSLATE PUPPET
		if(shouldMoveXY) {
			const puppetCenter = this.getPuppetCenter2d();
			const xyDelta = new THREE.Vector2(dx, dy);

			this.threeMesh.position.add(new THREE.Vector3(xyDelta.x * this.threeMesh.scale.x, xyDelta.y * this.threeMesh.scale.y, 0));
		}
	
		// UPDATE MISC THREEJS
		(this.threeMesh.geometry as any).dynamic = true;
		(this.threeMesh.geometry as THREE.Geometry).verticesNeedUpdate = true;
		this.selectionBox.boxHelper.object.geometry.computeBoundingBox();
		this.selectionBox.boxHelper.update();
		this.selectionBox.boxHelper.scale.z = 1; // To make sure volume != 0 (this will cause that warning to show up)
		this.needsUpdate = false;

		if (this.playing && this.threeMesh.material instanceof THREE.ShaderMaterial) {
			this.threeMesh.material.uniforms.tex0.value = this.frames[this.currentFrame];
			this.currentFrame += this.playbackDirection;

			if (this.currentFrame >= this.frames.length - 1) {
				this.playbackDirection = -1;
			}
			if (this.currentFrame === 0) {
				this.playbackDirection = 1;
			}
		}

		this.updateSelectionBox();
	}

	renderFrame = (frame: number) => {
		const clampedFrame = frame % this.frames.length;

		if (this.threeMesh.material instanceof THREE.ShaderMaterial) {
			this.threeMesh.material.uniforms.tex0.value = this.frames[clampedFrame];
		}
	}

	updateSelectionBox = () => {
		const boundingBox = new THREE.Box3();
		boundingBox.setFromObject(this.selectionBox.boxHelper.object);
		
		let center = new THREE.Vector3();
		center = boundingBox.getCenter(center);

		let size = new THREE.Vector3();
		size = boundingBox.getSize(size);
	
		this.selectionBox.topAnchor.position.set(center.x, center.y - size.y / 2, center.z);
		this.selectionBox.bottomAnchor.position.set(center.x, center.y + size.y / 2, center.z);
		this.selectionBox.leftAnchor.position.set(center.x - size.x / 2, center.y, center.z);
		this.selectionBox.rightAnchor.position.set(center.x + size.x / 2, center.y, center.z);
	
		this.selectionBox.topLeftAnchor.position.set(center.x - size.x / 2, center.y - size.y / 2, center.z);
		this.selectionBox.bottomRightAnchor.position.set(center.x + size.x / 2, center.y + size.y / 2, center.z);
	
		this.selectionBox.topRightAnchor.position.set(center.x + size.x / 2, center.y - size.y / 2, center.z);
		this.selectionBox.bottomLeftAnchor.position.set(center.x - size.x / 2, center.y + size.y / 2, center.z);
	}

	public hasRecording(): boolean {
		return false;
	}

	setSelectionGUIVisible = (visible) => {
		this.selectionBox.boxHelper.visible = visible;
		this.selectionBox.topLeftAnchor.visible = visible;
		this.selectionBox.topAnchor.visible = visible;
		this.selectionBox.topRightAnchor.visible = visible;
		this.selectionBox.rightAnchor.visible = visible;
		this.selectionBox.bottomRightAnchor.visible = visible;
		this.selectionBox.bottomAnchor.visible = visible;
		this.selectionBox.bottomLeftAnchor.visible = visible;
		this.selectionBox.leftAnchor.visible = visible;
	
		eventManager.emit('puppet-selected', {
			selected: visible,
			hasRecording: this.hasRecording(),
		});
	}

	pointInsideMesh = (xUntransformed: number, yUntransformed: number, clientX: number, clientY: number) => {
		const mousePosition = new THREE.Vector3();
		mousePosition.x = (clientX / window.innerWidth) * 2 - 1;
		mousePosition.y = - (clientY / window.innerHeight) * 2 + 1;

		const raycaster = new THREE.Raycaster();
		raycaster.setFromCamera(mousePosition, dranimate.camera);

		// calculate objects intersecting the picking ray
		const intersects = raycaster.intersectObject(this.threeMesh);

		if (intersects[0]) {
			return true;
		}
		else {
			return false;
		}
	}

	cleanup = () => {
		clearObject(this.group);
	}

	startRecording = (): void => {
		this.isRecording = true;
	}

	stopRecording = (): void => {
		this.isRecording = false;
		this.playing = true;
	}

	setOpacity = (opacity: number): void => {
		this.opacity = opacity;

		const material = this.threeMesh.material;

		if (material instanceof THREE.ShaderMaterial) {
			material.uniforms.opacity.value = this.opacity;
		}
	}

	setInvert = (invert: number): void => {
		this.invert = invert;

		const material = this.threeMesh.material;

		if (material instanceof THREE.ShaderMaterial) {
			material.uniforms.invert.value = this.invert;
		}
	}

	setSoftness = (softness: number): void => {
		this.softness = softness;

		const material = this.threeMesh.material;

		if (material instanceof THREE.ShaderMaterial) {
			material.uniforms.softness.value = this.softness;
		}
	}

	setThreshold = (threshold: number): void => {
		this.threshold = threshold;

		const material = this.threeMesh.material;

		if (material instanceof THREE.ShaderMaterial) {
			material.uniforms.thresh.value = this.threshold;
		}
	}
}
