import { Vector2, Box3, Vector3, Raycaster, MeshBasicMaterial } from 'three';
// import { PuppetRecording } from 'services/puppet/puppetRecording';
import Recording from 'services/puppet/Recording';
import { pointIsInsideTriangle } from 'services/util/math';
import { clearObject } from 'services/util/threeUtil';
import dranimate from '../dranimate/dranimate';
import SkinnedMesh from '../skinning/skinned-mesh';
import eventManager from '../eventManager/event-manager';
import ControlPoint from './control-point';

class Puppet {
	private current: any;
	private previous: any;
	private selectionState: any;
	private name: string;
	private id: string;
	private recording = new Recording();
	private image: any;
	private imageNoBG: any;
	private controlPointPositions: ControlPoint[];
	private backgroundRemovalData: any;
	private verts: any;
	private faces: any;
	private controlPoints: any;
	private vertsFlatArray: any;
	private facesFlatArray: any;
	private skin: SkinnedMesh;
	private controlPointPlanes: THREE.Mesh[];
	private group: any;
	private undeformedVertices: any;
	private needsUpdate: boolean;
	private playRecording: boolean;
	private selectionBox: any;
	private arapMeshID: any;

	constructor(puppetData) {
		this.current = {
			position: new Vector2(0, 0),
			center: puppetData.center.clone(),
			rotation: 0,
			scale: 1,
		};
		this.previous = {
			position: this.current.position.clone(),
			scale: this.current.scale,
			rotation: this.current.rotation
		};
		this.selectionState = {
			isBeingDragged: false,
			lastPosition: new Vector2(0, 0)
		};
		this.name = puppetData.name;
		this.id = puppetData.id;

		this.image = puppetData.image;
		this.imageNoBG = puppetData.imageNoBG;
		this.controlPointPositions = puppetData.controlPointPositions; // are these just unedited control points?
		this.backgroundRemovalData = puppetData.backgroundRemovalData;
		this.verts = puppetData.verts;
		this.faces = puppetData.faces;
		this.controlPoints = puppetData.controlPoints;
		this.vertsFlatArray = puppetData.vertsFlatArray;
		this.facesFlatArray = puppetData.facesFlatArray;
		this.skin = puppetData.skin;
		this.controlPointPlanes = puppetData.controlPointPlanes;
		this.group = puppetData.group;
		this.undeformedVertices = this.verts;
		this.needsUpdate = true;
		this.playRecording = false;
		this.selectionBox = puppetData.selectionBox;

		for(let i = 0; i < this.controlPoints.length; i++) {
			const cpi = this.controlPoints[i];
			this.skin.updateHandle(i, this.verts[cpi][0], this.verts[cpi][1]);
		}

		this.incrementPosition(-puppetData.center.x, -puppetData.center.y);
	}

	incrementPosition = (x, y): void => {
		const position = new Vector2(x, y);
		const delta = position.clone()
			.sub(this.selectionState.lastPosition)
			.multiplyScalar(1 / this.getScale())
		this.current.center.add(
			position.clone().sub(this.selectionState.lastPosition)
		);
		this.current.position.add(delta);
		this.selectionState.lastPosition = position;
	}

	setName = (name: string): void => {
		this.name = name;
	}

	getName = (): string => {
		return this.name;
	}

	getId = (): string => {
		return this.id;
	}

	setScale = (scale: number): void => {
		this.current.scale = scale;
	}

	getScale = (): number => {
		return this.current.scale;
	}

	setRotation = (rotation: number): void => {
		this.current.rotation = rotation;
	}

	getRotation = (): number => {
		return this.current.rotation;
	}

	hasRecording = (): boolean => {
		return this.recording.hasRecording();
	}

	clearRecording = (): void => {
		this.recording.clear();
		this.updateControlPointColors();
	}

	setRenderWireframe = (shouldRender: boolean): void => {
		//SKTODO this.threeMesh.material = shouldRender ? this.wireframeMaterial : this.texturedMaterial;
	}

	setSelectionState = (isBeingDragged: boolean, x: number, y: number): void => {
		this.selectionState.isBeingDragged = isBeingDragged;
		if (isBeingDragged) {
			this.selectionState.lastPosition.x = x;
			this.selectionState.lastPosition.y = y;
		}
	}

	startRecording = (): void => {
		this.recording.start(performance.now());
	}

	stopRecording = (): void => {
		this.recording.stop(performance.now());
		this.updateControlPointColors();
	}

	updateControlPointColors = (): void => {
		const activeIndices = this.recording.getActiveIndices();
		this.controlPoints.forEach((controlPoint, index) => {
			const controlPointSphere = this.controlPointPlanes[index];
			const color = activeIndices.has(index) ? 0xEE1111 : 0x1144FF;
			if (controlPointSphere.material instanceof MeshBasicMaterial) {
				controlPointSphere.material.color.setHex(color);
			}
		});
	}

	setControlPointPositions = (controlPoints): void => {
		this.needsUpdate = true;
		controlPoints.forEach(controlPoint => {
			this.skin.updateHandle(controlPoint.cpi, controlPoint.position.x, controlPoint.position.y);
		});
	
		if (this.recording.isRecording()) {
			const puppetCenter = this.getPuppetCenter2d();
			const normalizedControlPoints = controlPoints.map((controlPoint) => {
				const position = controlPoint.position.clone()
					.rotateAround(puppetCenter, -this.getRotation())
					.sub(puppetCenter);
				return {
					cpi: controlPoint.cpi,
					position
				};
			});
			this.recording.setFrame(normalizedControlPoints, performance.now());
		}
	}

	setControlPointPosition = (controlPointIndex, position) => {
		this.needsUpdate = true;
		this.skin.updateHandle(controlPointIndex, position.x, position.y);
		// NOTE: there still might be some unforseen problems with over recording
		if (this.recording.isRecording()) {
			const puppetCenter = this.getPuppetCenter2d();
			const point = position
				.rotateAround(puppetCenter, -this.getRotation())
				.sub(puppetCenter);
			const frame = [{
				cpi: controlPointIndex,
				position: point,
			}];
			this.recording.setFrame(frame, performance.now());
		}
	}

	update = (elapsedTime, targetTimestamp) => {
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

		const pickingGeometry = this.skin.getPickingGeometry();

		// ROTATE PUPPET
		if (shouldRotate) {
			const deltaRotation = this.current.rotation - this.previous.rotation;
			this.previous.rotation = this.current.rotation;
			const puppetCenter = this.getPuppetCenter2d();
			this.controlPoints.forEach((controlPoint, index) => {
				const {x, y} = pickingGeometry.vertices[controlPoint];
				const point = new Vector2(x, y)
					.sub(puppetCenter)
					.multiplyScalar(1 / this.getScale())
					.add(puppetCenter)
					.rotateAround(puppetCenter, deltaRotation)
				this.setControlPointPosition(index, point);
			});
		}
	
		// TRANSLATE PUPPET
		if(shouldMoveXY && !dranimate.handTrackingEnabled) {
			const puppetCenter = this.getPuppetCenter2d();
			const xyDelta = new Vector2(dx, dy);
			this.controlPoints.forEach((controlPoint, index) => {
				const position = pickingGeometry.vertices[controlPoint].clone();
				const vertexPosition = new Vector2(position.x, position.y);
				const point = vertexPosition
					.sub(puppetCenter)
					.multiplyScalar(1 / this.getScale())
					.add(puppetCenter)
					.add(xyDelta);
				this.setControlPointPosition(index, point);
			});
		}
	
		if (this.playRecording) {
			const recordingTimeStamp = targetTimestamp || performance.now();
	
			const recordedFrames = this.recording.getCurrentFrame(recordingTimeStamp);
			recordedFrames.forEach(recordedFrame => {
				const puppetCenter = this.getPuppetCenter2d();
				const absoluteControlPoints = recordedFrame.controlPoints.map((controlPoint) => {
					const point = controlPoint.position.clone()
						.add(puppetCenter)
						.rotateAround(puppetCenter, this.getRotation());
					return {
						cpi: controlPoint.cpi,
						position: point
					};
				});
				// calling this.setControlPointPositions here will over record, look into simplifying this
				this.needsUpdate = true;
				absoluteControlPoints.forEach(controlPoint => {
					this.skin.updateHandle(controlPoint.cpi, controlPoint.position.x, controlPoint.position.y);
				});
			});
		}
	
		// Update puppet skin
		if(this.needsUpdate) {
			// Update
			this.skin.update();
			// Scale 
			//this.skin.setTransform(this.getScale());	
			//ARAP.updateMeshDeformation(this.arapMeshID);
			//const deformedVerts = ARAP.getDeformedVertices(this.arapMeshID, this.vertsFlatArray.length);
			const puppetCenter = this.getPuppetCenter2d();
			/*
			for (let i = 0; i < deformedVerts.length; i += 2) {
				const vertex = this.threeMesh.geometry.vertices[i / 2];
				const point = new Vector2(deformedVerts[i], deformedVerts[i + 1])
					.sub(puppetCenter)
					.multiplyScalar(this.getScale())
					.add(puppetCenter);
	
				vertex.x = point.x;
				vertex.y = point.y;
			}
			*/
	
			// UPDATE CONTROL POINT GRAPHICS
			this.controlPoints.forEach((controlPoint, index) => {
				const vertex = pickingGeometry.vertices[controlPoint];
				const controlPointSphere = this.controlPointPlanes[index];
				controlPointSphere.position.x = vertex.x;
				controlPointSphere.position.y = vertex.y;
			});
	
			// UPDATE MISC THREEJS
			/*
			this.threeMesh.geometry.dynamic = true;
			this.threeMesh.geometry.verticesNeedUpdate = true;
			this.selectionBox.boxHelper.object.geometry.computeBoundingBox();
			this.selectionBox.boxHelper.update();
			this.selectionBox.boxHelper.scale.z = 1; // To make sure volume != 0 (this will cause that warning to show up)
			*/
			this.needsUpdate = false;
	
			this.updateSelectionBox();
		}
	}

	updateSelectionBox = () => {
		const boundingBox = new Box3();
		boundingBox.setFromObject(this.selectionBox.boxHelper.object);
		
		let center = new Vector3();
		center = boundingBox.getCenter(center);

		let size = new Vector3();
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

	getCenter = () => {
		return this.current.center.clone();
	}

	getPuppetCenter2d = (): Vector2 => {
		const boundingBox = new Box3();
		boundingBox.setFromObject(this.selectionBox.boxHelper.object);
		
		let center = new Vector3();
		center = boundingBox.getCenter(center);

		return new Vector2(center.x, center.y);
	}

	cleanup = () => {
		clearObject(this.group);
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
		this.controlPointPlanes.forEach(sphere => sphere.visible = visible);
	
		eventManager.emit('puppet-selected', {
			selected: visible,
			hasRecording: this.hasRecording(),
		});
	}

	pointInsideMesh = (xUntransformed, yUntransformed) => {
		const point = new Vector2(xUntransformed, yUntransformed)
		const pickingGeometry = this.skin.getPickingGeometry();
		const allFaces = pickingGeometry.faces;
		const allVerts = pickingGeometry.vertices;
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

	pointOnRotateAnchor = (x, y) => {
		const raycaster = new Raycaster(new Vector3(x, y, 100), new Vector3(0, 0, -1));
		const intersects = raycaster.intersectObject(this.selectionBox.topLeftAnchor);
		if (intersects.length > 0) {
			return true;
		}
		return false;
	}

	pointOnScaleAnchor = (x, y) => {
		const raycaster = new Raycaster(new Vector3(x, y, 100), new Vector3(0, 0, -1));
		const intersects = raycaster.intersectObject(this.selectionBox.bottomRightAnchor);
		if (intersects.length > 0) {
			return true;
		}
		return false;
	}
}

export default Puppet;
