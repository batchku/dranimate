import * as THREE from 'three';

import eventManager from 'services/eventManager/event-manager';

import BasePuppet from './base-puppet'
import { clearObject } from 'services/util/threeUtil';
import dranimate from 'services/dranimate/dranimate';

export default class LivedrawPuppet extends BasePuppet {
	public group: THREE.Group;
	public type: string;
	public isRecording: boolean;
	public playing: boolean;
	public frames: any[] = [];
	public currentFrame = 0;
	public playbackDirection = 1;

	constructor() {
		super();

		this.type = 'livedraw';
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
			this.needsUpdate = true;
		}
	
		// ROTATE PUPPET
		if (shouldRotate) {
			const deltaRotation = this.current.rotation - this.previous.rotation;
			this.previous.rotation = this.current.rotation;
		}
	
		// TRANSLATE PUPPET
		if(shouldMoveXY) {
			const puppetCenter = this.getPuppetCenter2d();
			const xyDelta = new THREE.Vector2(dx, dy);

			this.threeMesh.position.add(new THREE.Vector3(xyDelta.x, xyDelta.y, 0));
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

	pointInsideMesh = (xUntransformed, yUntransformed) => {
		const point = new THREE.Vector2(xUntransformed, yUntransformed);
		const center = this.getPuppetCenter2d();

		if (point.x > (center.x - 50) && point.x < center.x + 50 && point.y > center.y - 50 && point.y < center.y + 50) {
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
}
