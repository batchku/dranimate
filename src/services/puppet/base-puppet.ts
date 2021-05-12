import * as THREE from 'three';

import { pointIsInsideTriangle } from "services/util/math";

import eventManager from 'services/eventManager/event-manager';

export default abstract class BasePuppet {
	public threeMesh: THREE.Mesh;
	public selectionState: any;
	public selectionBox: any;
	public current: any;
	public previous: any;
	public needsUpdate: boolean;

	constructor() {
		this.selectionState = {
			isBeingDragged: false,
			lastPosition: new THREE.Vector2(0, 0)
		};

		this.current = {
			position: new THREE.Vector2(0, 0),
			center: new THREE.Vector2(0, 0),
			rotation: 0,
			scale: 1,
		};

		this.previous = {
			position: this.current.position.clone(),
			scale: this.current.scale,
			rotation: this.current.rotation
		};

		this.needsUpdate = true;
	}

	pointInsideMesh = (xUntransformed, yUntransformed, clientX?: number, clientY?: number): boolean => {
		const point = new THREE.Vector2(xUntransformed, yUntransformed);
		const allFaces = (this.threeMesh.geometry as THREE.Geometry).faces;
		const allVerts = (this.threeMesh.geometry as THREE.Geometry).vertices;
		for(let i = 0; i < allFaces.length; i++) {
			const v1 = allVerts[allFaces[i].a];
			const v2 = allVerts[allFaces[i].b];
			const v3 = allVerts[allFaces[i].c];
			if (pointIsInsideTriangle(point.x, point.y, v1, v2, v3)) {
				return true;
			}
		}
		return false;
	}

	setSelectionState = (isBeingDragged: boolean, x: number, y: number): void => {
		this.selectionState.isBeingDragged = isBeingDragged;
		if (isBeingDragged) {
			this.selectionState.lastPosition.x = x;
			this.selectionState.lastPosition.y = y;
		}
	}

	incrementPosition = (x, y): void => {
		const position = new THREE.Vector2(x, y);
		const delta = position.clone()
			.sub(this.selectionState.lastPosition)
			.multiplyScalar(1 / this.getScale())
		this.current.center.add(
			position.clone().sub(this.selectionState.lastPosition)
		);
		this.current.position.add(delta);
		this.selectionState.lastPosition = position;
	}

	setScale = (scale: number): void => {
		this.current.scale = scale;
	}

	getScale = (): number => {
		return this.current.scale;
	}

	getRotation = (): number => {
		return this.current.rotation;
	}

	setRotation = (rotation: number): void => {
		this.current.rotation = rotation;
	}

	getPuppetCenter2d = (): THREE.Vector2 => {
		const boundingBox = new THREE.Box3();
		boundingBox.setFromObject(this.selectionBox.boxHelper.object);
		
		let center = new THREE.Vector3();
		center = boundingBox.getCenter(center);

		return new THREE.Vector2(center.x, center.y);
	}

	pointOnRotateAnchor = (x, y) => {
		const raycaster = new THREE.Raycaster(new THREE.Vector3(x, y, 100), new THREE.Vector3(0, 0, -1));
		const intersects = raycaster.intersectObject(this.selectionBox.topLeftAnchor);
		if (intersects.length > 0) {
			return true;
		}
		return false;
	}

	pointOnScaleAnchor = (x, y) => {
		const raycaster = new THREE.Raycaster(new THREE.Vector3(x, y, 100), new THREE.Vector3(0, 0, -1));
		const intersects = raycaster.intersectObject(this.selectionBox.bottomRightAnchor);
		if (intersects.length > 0) {
			return true;
		}
		return false;
	}

	abstract setSelectionGUIVisible(visible: boolean): void;
	abstract hasRecording(): boolean;
}
