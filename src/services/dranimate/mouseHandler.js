import { Vector2 } from 'three';
import * as THREE from 'three';
import { getPuppetAndControlPointFromPostion } from 'services/dranimate/util';

import puppetSelectedEvent from './../eventManager/puppet-selected-event';

import dranimate from './dranimate';

const MOUSE_STATE = {
	UP: 'UP',
	DOWN: 'DOWN',
	OUTSIDE: 'OUTSIDE',
};

export default class DranimateMouseHandler {

	constructor(rendererElement, panHandler) {
		this.rendererElement = rendererElement;
		this.panHandler = panHandler;
		this.mouseState = MOUSE_STATE.UP;
		this.mouseRelative = {x:0, y:0};
		this.mouseAbsolute = {x:0, y:0};
		this.selectedPuppet;
		this.puppetRotationData = {
			rotatingPuppet: false,
			previousMouseDirection: new THREE.Vector2(),
			currentMouseDirection: new THREE.Vector2(),
		};
		this.puppetScaleData = {
			scalingPuppet: false,
			previousMousePosition: new THREE.Vector2(),
			currentMousePosition: new THREE.Vector2(),
		};
		this.activeControlPoint = { hoveredOver: false, valid: false };
	}

	updateMousePosition(x, y, zoom) {
		const boundingRect = this.rendererElement.getBoundingClientRect();
		this.mouseAbsolute = {
			x: x - boundingRect.left,
			y: y - boundingRect.top
		};
		// TODO: set window width and height on resize
		this.mouseRelative = {
			x: (x - boundingRect.left - window.innerWidth / 2) / zoom - this.panHandler.getPanPosition().x,
			y: (y - boundingRect.top - window.innerHeight / 2) / zoom - this.panHandler.getPanPosition().y
		};
	}

	onMouseDown(event, puppets, zoom) {
		this.updateMousePosition(event.clientX, event.clientY, zoom);
		this.mouseState = MOUSE_STATE.DOWN;

		if(this.activeControlPoint.hoveredOver) {
			this.selectedPuppet = puppets[this.activeControlPoint.puppetIndex];
			this.activeControlPoint.beingDragged = true;
			puppets.forEach(puppet => puppet.setSelectionGUIVisible(puppet === this.selectedPuppet));
			return;
		}

		// the notion of a selected puppet is only relative to mouse / touch, not leap motion
		this.selectedPuppet = null;
		this.puppetRotationData.rotatingPuppet = false;
		this.puppetScaleData.scalingPuppet = false;
		for (let i = puppets.length - 1; i >= 0; i--) {
			if (puppets[i].pointInsideMesh(this.mouseRelative.x, this.mouseRelative.y, event.clientX, event.clientY)) {
				this.selectedPuppet = puppets[i];
				break;
			}
			if (puppets[i].pointOnRotateAnchor(this.mouseRelative.x, this.mouseRelative.y)) {
				this.selectedPuppet = puppets[i];
				this.puppetRotationData.rotatingPuppet = true;
				this.puppetRotationData.previousMouseDirection = this.getMouseDirection(this.mouseRelative.x, this.mouseRelative.y);
				break;
			}
			if (puppets[i].pointOnScaleAnchor(this.mouseRelative.x, this.mouseRelative.y)) {
				this.selectedPuppet = puppets[i];
				this.puppetScaleData.scalingPuppet = true;
				this.puppetScaleData.previousMousePosition = new THREE.Vector2(this.mouseRelative.x, this.mouseRelative.y);
				break;
			}
		}

		if (this.selectedPuppet && !this.puppetRotationData.rotatingPuppet && !this.puppetScaleData.scalingPuppet) {
			this.selectedPuppet.setSelectionState(true, this.mouseRelative.x, this.mouseRelative.y);
		}
		puppets.forEach(puppet => puppet.setSelectionGUIVisible(puppet === this.selectedPuppet));

		puppetSelectedEvent.emit({
			puppet: this.selectedPuppet
		});

		if (!this.selectedPuppet) {
			dranimate.setPanEnabled(true);

			this.panHandler.onMouseDown(this.mouseAbsolute.x, this.mouseAbsolute.y, zoom);
			return;
		}
	}

	onMouseMove(event, puppets, zoom) {
		this.updateMousePosition(event.clientX, event.clientY, zoom);

		/* Find control point closest to the mouse */

		if(this.panHandler.getPanEnabled() && this.mouseState === MOUSE_STATE.DOWN) {
			this.panHandler.onMouseMove(this.mouseAbsolute.x, this.mouseAbsolute.y, zoom);
			return;
		}

		if (this.activeControlPoint.beingDragged) {
			// control point is being dragged by mouse
			const puppet = puppets[this.activeControlPoint.puppetIndex];
			const ci = this.activeControlPoint.controlPointIndex;
			const puppetCenter = puppet.getPuppetCenter2d();
			const mouseVector = new Vector2(this.mouseRelative.x, this.mouseRelative.y)
				.sub(puppetCenter)
				.multiplyScalar(1 / puppet.getScale())
				.add(puppetCenter);
			puppet.setControlPointPosition(ci, mouseVector);
			return;
		}

		if (this.puppetRotationData.rotatingPuppet) {
			this.puppetRotationData.currentMouseDirection = this.getMouseDirection(this.mouseRelative.x, this.mouseRelative.y);

			const angle = this.getVectorsAngle(this.puppetRotationData.previousMouseDirection, this.puppetRotationData.currentMouseDirection);
			const currentPuppetRotation = this.selectedPuppet.getRotation();
			const newPuppetRotation = currentPuppetRotation + angle;
			this.selectedPuppet.setRotation(newPuppetRotation);

			this.puppetRotationData.previousMouseDirection = this.puppetRotationData.currentMouseDirection.clone();
		}

		if (this.puppetScaleData.scalingPuppet) {
			this.puppetScaleData.currentMousePosition = new THREE.Vector2(this.mouseRelative.x, this.mouseRelative.y);

			const xDiff = (this.puppetScaleData.currentMousePosition.x - this.puppetScaleData.previousMousePosition.x) / 100;
			const currentPuppetScale = this.selectedPuppet.getScale();
			const newPuppetScale = Math.max(0.1, currentPuppetScale + xDiff);
			this.selectedPuppet.setScale(newPuppetScale);

			this.puppetScaleData.previousMousePosition = this.puppetScaleData.currentMousePosition.clone();
		}

		if(this.selectedPuppet && this.selectedPuppet.selectionState.isBeingDragged) {
			const mouseVector = new Vector2(this.mouseRelative.x, this.mouseRelative.y)
			this.selectedPuppet.incrementPosition(mouseVector.x, mouseVector.y);
			return;
		}

		const activeCp = getPuppetAndControlPointFromPostion(puppets, this.mouseRelative.x, this.mouseRelative.y, 10, zoom);
		if (activeCp) {
			this.activeControlPoint = activeCp;
			this.rendererElement.parentNode.style.cursor = 'pointer';
		}
		else {
			this.rendererElement.parentNode.style.cursor = 'default';
			this.activeControlPoint.hoveredOver = false;
		}
	}

	onMouseUp(event, puppets, zoom) {
		this.updateMousePosition(event.clientX, event.clientY, zoom);
		this.mouseState = MOUSE_STATE.UP;
		
		dranimate.setPanEnabled(false);

		this.activeControlPoint.beingDragged = false;
		this.puppetRotationData.rotatingPuppet = false;
		this.puppetScaleData.scalingPuppet = false;
		if (this.selectedPuppet) {
			this.selectedPuppet.setSelectionState(false);
		}
	}

	onMouseWheel(event) {
		if (event.deltaY > 0) {
			dranimate.zoomOut(event);
		}
		else if (event.deltaY < 0) {
			dranimate.zoomIn(event);
		}
	}

	getSelectedPuppet() {
		return this.selectedPuppet;
	}

	onRemovePuppet() {
		this.selectedPuppet = null;
	}

	getMouseDirection(x, y) {
		const center = this.selectedPuppet.getPuppetCenter2d();
		const mousePosition = new THREE.Vector2(x, y);

		return new THREE.Vector2().subVectors(center, mousePosition).normalize();
	}

	getVectorsAngle(v1, v2) {
		const dot = v1.x * v2.x + v1.y * v2.y;
		const det = v1.x * v2.y - v1.y * v2.x;

		return Math.atan2(det, dot);
	}
}
