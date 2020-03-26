import * as THREE from 'three';
import Stats from 'stats.js';

import DranimateMouseHandler from 'services/dranimate/mouseHandler';
import DranimateLeapHandler from 'services/dranimate/leapHandler';
import DranimateTouchHandler from 'services/dranimate/touchHandler';
import { GifRecording, GifBuilder } from 'services/util/GifRecorder';
import PanHandler from 'services/util/panHandler';
import { clamp } from 'services/util/math';
import { loadTexture } from 'services/util/threeUtil';
import loadImage from 'services/util/imageLoader';
import HandTrackingService from 'services/hand-tracking/HandTrackingService';

const ZOOM = {
	MIN: 0.5,
	MAX: 1.5
};
const CAMERA_DEPTH = 10000;
const OUTLINE_Z_INDEX = 5;

class Dranimate {
	constructor() {
		this.container;
		this.camera;
		this.scene;
		this.renderer;
		this.puppets = [];

		this.zoom = 1.0;
		this.panHandler = new PanHandler();
		this.leapHandler;
		this.mouseHandler;
		this.touchHandler;

		this.palmBaseMesh = null;

		this.lastUpdateTimestamp = performance.now();
		this.animationRequest;

		this.isInRenderLoop = true;
		this.gifRecording = new GifRecording(performance.now(), false);
		this.handTrackingService = new HandTrackingService();

		this.backgroundColorMesh;
		this.backgroundImageMesh;
		this.backgroundWidthHeightRatio = 1;

		this.handParts = [
			'thumb-1', 'thumb-2', 'thumb-3', 'thumb-4',
			'indexFinger-1', 'indexFinger-2', 'indexFinger-3', 'indexFinger-4',
			'middleFinger-1', 'middleFinger-2', 'middleFinger-3', 'middleFinger-4',
			'ringFinger-1', 'ringFinger-2', 'ringFinger-3', 'ringFinger-4',
			'pinky-1', 'pinky-2', 'pinky-3', 'pinky-4',
			'palmBase-1',
		];

		window.addEventListener('resize', $event => refreshCamera(), false );
	}

	getSelectedPuppet = () => {
		return this.mouseHandler.getSelectedPuppet() || this.touchHandler.getSelectedPuppet();
	}

/*****************************
		API
*****************************/

	createPalmMeshes = () => {
		this.handParts.forEach((partName) => {
			this[partName] = this.createJointMesh(partName);
		});
	}

	createJointMesh = (name) => {
		var geometry = new THREE.BoxBufferGeometry(10, 10, 10);
		var material = new THREE.MeshBasicMaterial({
			color: 0x00ff00,
			depthTest: false,
			depthWrite: false,
		});

		const mesh = new THREE.Mesh(geometry, material);
		mesh.name = name;

		this.scene.add(mesh);

		return mesh;
	}

	updatePalmMeshPosition = () => {
		const handParts = ['thumb', 'indexFinger', 'middleFinger', 'ringFinger', 'pinky', 'palmBase'];

		handParts.forEach((partName) => {
			const partPositionData = this.handTrackingService.palmPositionData[partName];

			partPositionData.forEach((partData, index) => {
				this[`${partName}-${index + 1}`].position.set(
					partData[0] * 2 - window.innerWidth / 2 + window.innerWidth,
					partData[1] * 2 - window.innerHeight / 2,
					partData[2]
				);
			});
		});
	}

	setup = async (canvasContainer, cssClass) => {
		/* Initialize THREE canvas and scene */
		const halfWidth = window.innerWidth / 2;
		const halfHeight = window.innerHeight / 2;
		// OrthographicCamera: left, right, top, bottom, near, far
		// puppet.z = 0, controlPoint.z = 10
		this.camera = new THREE.OrthographicCamera(-halfWidth, halfWidth, -halfHeight, halfHeight, 0, CAMERA_DEPTH + 1);
		this.scene = new THREE.Scene();
		this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
		this.renderer.setPixelRatio(window.devicePixelRatio);
		this.renderer.setClearColor(0xFFFFFF, 0);
		canvasContainer.appendChild(this.renderer.domElement);
		this.camera.position.x = 0;
		this.camera.position.y = 0;
		this.camera.position.z = 1000;

		this.camera.lookAt(new THREE.Vector3(0, 0, 0));

		// TODO: make this a texture instead!!!
		this.renderer.domElement.classList.add(cssClass)

		this.mouseHandler = new DranimateMouseHandler(this.renderer.domElement, this.panHandler);
		this.touchHandler = new DranimateTouchHandler(this.renderer.domElement, this.panHandler);
		this.leapHandler = new DranimateLeapHandler(this.renderer.domElement, this.panHandler, this.puppets);

		await this.handTrackingService.loadAsync();
		this.handTrackingService.startTracking();

		const renderAreaSize = 1000;
		const scaleMultiplier = 2000;
		const halfSize = renderAreaSize / 2;
		const halfScale = scaleMultiplier / 2;

		const backgroundGeometry = new THREE.PlaneGeometry(renderAreaSize, renderAreaSize);
		const backgroundColorMaterial = new THREE.MeshBasicMaterial({color: 0xFFFFFF, side: THREE.BackSide});
		this.backgroundColorMesh = new THREE.Mesh(backgroundGeometry.clone(), backgroundColorMaterial);
		this.backgroundColorMesh.visible = false;
		this.scene.add(this.backgroundColorMesh);

		const backgroundImageMaterial = new THREE.MeshBasicMaterial({side: THREE.BackSide, transparent: true});
		this.backgroundImageMesh = new THREE.Mesh(backgroundGeometry.clone(), backgroundImageMaterial);
		this.backgroundImageMesh.visible = false;
		this.backgroundImageMesh.scale.y = -1;
		this.scene.add(this.backgroundImageMesh);

		const outlineSize = 10;
		const geometry = new THREE.PlaneGeometry(1, 1);
		const material = new THREE.MeshBasicMaterial({color: 0x666666, side: THREE.BackSide});

		const topPlane = new THREE.Mesh(geometry.clone(), material);
		const rightPlane = new THREE.Mesh(geometry.clone(), material);
		const bottomPlane = new THREE.Mesh(geometry.clone(), material);
		const leftPlane = new THREE.Mesh(geometry.clone(), material);

		topPlane.scale.x = renderAreaSize * scaleMultiplier;
		topPlane.scale.y = renderAreaSize * 2;
		rightPlane.scale.x = renderAreaSize * 2;
		rightPlane.scale.y = renderAreaSize * scaleMultiplier;
		bottomPlane.scale.x = renderAreaSize * scaleMultiplier;
		bottomPlane.scale.y = renderAreaSize * 2;
		leftPlane.scale.x = renderAreaSize * 2;
		leftPlane.scale.y = renderAreaSize * scaleMultiplier;

		const topPosition = new THREE.Vector3()
			.add(new THREE.Vector3(0, -renderAreaSize * 1.5, OUTLINE_Z_INDEX));
		const rightPosition = new THREE.Vector3()
			.add(new THREE.Vector3(renderAreaSize * 1.5, 0, OUTLINE_Z_INDEX));
		const bottomPosition = new THREE.Vector3()
			.add(new THREE.Vector3(0, renderAreaSize * 1.5, OUTLINE_Z_INDEX));
		const leftPosition = new THREE.Vector3()
			.add(new THREE.Vector3(-renderAreaSize * 1.5, 0, OUTLINE_Z_INDEX));
		topPlane.position.add(topPosition);
		rightPlane.position.add(rightPosition);
		bottomPlane.position.add(bottomPosition);
		leftPlane.position.add(leftPosition);
		this.scene.add(topPlane);
		this.scene.add(rightPlane);
		this.scene.add(bottomPlane);
		this.scene.add(leftPlane);

		this.createPalmMeshes();

		this.refreshCamera();
		this.animate();
	}

	onMouseWheel = (event) => {
		let d = ((typeof e.wheelDelta != "undefined")?(-e.wheelDelta):e.detail);
		d *= 0.01;
		this.zoom += d;
		this.zoom = clamp(zoom, ZOOM.MIN, ZOOM.MAX);
		this.refreshCamera();
	};

	onMouseDown = event => this.mouseHandler.onMouseDown(event, this.puppets, this.zoom);

	onMouseMove = event => this.mouseHandler.onMouseMove(event, this.puppets, this.zoom);

	onMouseUp = event => this.mouseHandler.onMouseUp(event, this.puppets, this.zoom);

	onTouchStart = event => this.touchHandler.onTouchStart(event, this.puppets, this.zoom);

	onTouchMove = event => this.touchHandler.onTouchMove(event, this.puppets, this.zoom);

	onTouchEnd = event => this.touchHandler.onTouchEnd(event, this.puppets, this.zoom);

	hasPuppet = () => this.puppets.length > 0;

	setBackgroundColor = hexString => {
		const color = new THREE.Color(hexString);
		this.backgroundColorMesh.material.color = color;
		if (!this.backgroundColorMesh.visible) {
			this.backgroundColorMesh.visible = true;
		}
		if (!this.isInRenderLoop) {
			this.animate();
		}
	};

	setBackgroundImage = imageSource => {
		Promise.all([
			loadImage(imageSource),
			loadTexture(imageSource)
		])
		.then(([image, texture]) => {
			const { width, height } = image;
			this.backgroundWidthHeightRatio = width / height;
			this.backgroundImageMesh.material.map && this.backgroundImageMesh.material.map.dispose();
			this.backgroundImageMesh.material.map = texture;
			this.backgroundImageMesh.scale.x = this.backgroundWidthHeightRatio;
			// if (width > height) {
			//   backgroundImageMesh.scale.y = -height / width;
			// }
			// else if (width < height) {
			//   backgroundImageMesh.scale.x = width / height;
			// }
			if (!this.backgroundImageMesh.visible) {
				this.backgroundImageMesh.visible = true;
			}
			if (!this.isInRenderLoop) {
				this.animate();
			}
		})
		.catch(error => console.log(error)); // TODO: error modal
	};

	setBackgroundImageSize = sizeMultiplier => {
		this.backgroundImageMesh.scale.x = this.backgroundWidthHeightRatio * sizeMultiplier;
		this.backgroundImageMesh.scale.y = -sizeMultiplier;
		if (!this.isInRenderLoop) {
			this.animate();
		}
	};

	clearBackground = () => {
		this.backgroundColorMesh.visible = false;
		this.backgroundImageMesh.visible = false;
		this.backgroundImageMesh.material.map && this.backgroundImageMesh.material.map.dispose();
		// TODO: clear and dispose texture
		if (!this.isInRenderLoop) {
			this.animate();
		}
	};

	addPuppet = (p) => {
		const matchingIndex = this.puppets.findIndex(puppet => puppet.id === p.id);
		if(matchingIndex > -1) {
			this.removePuppetByIndex(matchingIndex);
		}
		this.puppets.push(p);
		this.scene.add(p.group);
	}

	movePuppet = (puppet, val) => {
		const currentIndex = this.puppets.findIndex(p => p === puppet);
		if (currentIndex === undefined) { return; }
		const targetIndex = currentIndex + val;
		if (targetIndex < 0 || targetIndex >= this.puppets.length) { return; }

		this.puppets.splice(currentIndex, 1);
		this.puppets.splice(targetIndex, 0, puppet);
		this.scene.children.forEach((obj) => {
			if (obj.type !== 'Group') { return; }
			const puppetIndex = this.puppets.findIndex(puppet => puppet.group === obj);
			const renderIndex = puppetIndex + 1;
			obj.children.forEach(child => child.renderOrder = renderIndex);
		});
	}

	zoomIn = () => {
		if (this.zoom >= ZOOM.MAX) { return; }
		this.zoom += 0.1;
		//panPosition.x -= (0.1)*window.innerWidth/2;
		//panPosition.y -= (0.1)*window.innerHeight/2;
		this.refreshCamera();
	}

	zoomOut = () => {
		if (this.zoom <= ZOOM.MIN) { return; }
		this.zoom -= 0.1;
		//panPosition.x += (0.1)*window.innerWidth/2;
		//panPosition.y += (0.1)*window.innerHeight/2;
		this.refreshCamera();
	}

	setPanEnabled = (isEnabled) => {
		this.panHandler.setPanEnabled(isEnabled);
		this.renderer.domElement.style.cursor = isEnabled ? 'move' : 'default';
	}

	deleteSelectedPuppet = () => {
		const selectedPuppet = this.getSelectedPuppet();
		if (!selectedPuppet) {
			return;
		}
		const index = this.puppets.indexOf(selectedPuppet);
		this.removePuppetByIndex(index);
		this.mouseHandler.onRemovePuppet();
		this.touchHandler.onRemovePuppet();
	}

	removePuppetByIndex = (index) => {
		const puppet = this.puppets[index];
		if (!puppet) {
			return;
		}
		this.scene.remove(puppet.group);
		puppet.cleanup();
		this.puppets.splice(index, 1);
	}

	setRecording = (isRec) => {
		if (this.getSelectedPuppet()) {
			isRec ?
				this.getSelectedPuppet().startRecording() :
				this.getSelectedPuppet().stopRecording();
		}
	};

	setGifIsRecording = (isRec) => {
		if (isRec) {
			this.gifRecording = new GifRecording(performance.now(), true);
			return;
		}
		else {
			this.stopRenderLoop();
			const gifBuilder = new GifBuilder();
			const { targetTimestamps, gifTimestep } = this.gifRecording.stop(performance.now(), this.puppets);
			targetTimestamps.forEach((targetTimestamp) => {
				this.puppets.forEach(puppet => puppet.update(gifTimestep, targetTimestamp));
				this.renderer.render(this.scene, camera);
				gifBuilder.recordFrame(this.renderer.domElement, gifTimestep);
			});
			return gifBuilder;
		}
	}

	startRenderLoop = () => {
		if (this.isInRenderLoop) { return; }
		this.isInRenderLoop = true;
		this.animate();
	};

	stopRenderLoop = () => {
		this.isInRenderLoop = false;
		cancelAnimationFrame(this.animationRequest);
		setTimeout(() => this.animate());
	};

/*****************************
		Dom events
*****************************/

/*****************************
		Draw/update loop
*****************************/

	refreshCamera = () => {
		const width = window.innerWidth / 2 / this.zoom;
		const height = window.innerHeight / 2 / this.zoom
		this.camera.left = -width;
		this.camera.right = width;
		this.camera.top = -height;
		this.camera.bottom = height;
		this.camera.updateProjectionMatrix();
		this.renderer.setSize(window.innerWidth, window.innerHeight);
		if (!this.isInRenderLoop) {
			this.animate();
		}
	}

	animate = () => {
		const now = performance.now();
		const elapsedTime = now - this.lastUpdateTimestamp;
		// stats.begin();
		this.lastUpdateTimestamp = now;
		this.update(elapsedTime);
		this.render(elapsedTime);
		if (this.isInRenderLoop) {
			this.animationRequest = requestAnimationFrame(this.animate);
		}
	}

	update = (elapsedTime) => {
		this.leapHandler.update(this.getSelectedPuppet());
		this.puppets.forEach(puppet => puppet.update(elapsedTime));
		this.panHandler.update(this.camera);
	}

	render = (elapsedTime) => {
		if (this.handTrackingService.palmPositionData) {
			this.updatePalmMeshPosition();
		}

		this.renderer.render(this.scene, this.camera);
		this.gifRecording.setFrame(performance.now());
		// stats.end();
	}
};

const dranimate = new Dranimate();
export default dranimate;
