import { Vector2, Vector3 } from 'three';

const MOUSE_STATE = {
  UP: 'UP',
  DOWN: 'DOWN',
  OUTSIDE: 'OUTSIDE',
};

const getPuppetAndControlPointFromPostion = (puppets, x, y, distanceThreshold, zoom) => {
  let activeControlPoint;
  for(var p = 0; p < puppets.length; p++) { // WHY LOOP OVER ALL PUPPETS?
    const puppet = puppets[p];
    const verts = puppet.threeMesh.geometry.vertices;
    const controlPoints = puppet.controlPoints;

    const closeControlPointIndex = controlPoints.findIndex((controlPoint, index) => {
      const mouseVector = new Vector2(x / puppet.getScale(), y / puppet.getScale());
      mouseVector.rotateAround(puppet.getRotationCenter(), -puppet.getRotation());
      const vert = verts[controlPoint];
      const dist = vert.distanceTo(new Vector3(mouseVector.x, mouseVector.y, 0)); //TODO: vector2?
      return (dist < 10 * zoom);
    });

    if (closeControlPointIndex > -1) {
      activeControlPoint = {
        valid: true,
        puppetIndex: p,
        hoveredOver: true,
        beingDragged: false,
        controlPointIndex: closeControlPointIndex
      };
    }

  }
  return activeControlPoint;
};

export default class DranimateMouseHandler {

  constructor(rendererElement, panHandler) {
    this.rendererElement = rendererElement;
    this.panHandler = panHandler;
    this.mouseState = MOUSE_STATE.UP;
    this.mouseRelative = {x:0, y:0};
    this.mouseAbsolute = {x:0, y:0};
    this.selectedPuppet;
    this.activeControlPoint = { hoveredOver: false, valid: false };
  }

  updateMousePosition(x, y, zoom) {
    const boundingRect = this.rendererElement.getBoundingClientRect();
    this.mouseAbsolute = {
      x: x - boundingRect.left,
      y: y - boundingRect.top
    };
    this.mouseRelative = {
      x: (x - boundingRect.left - window.innerWidth / 2) / zoom - this.panHandler.getPanPosition().x,
      y: (y - boundingRect.top - window.innerHeight / 2) / zoom - this.panHandler.getPanPosition().y
    };
  }

  onMouseDown(event, puppets, zoom) {
    this.updateMousePosition(event.clientX, event.clientY, zoom);
    this.mouseState = MOUSE_STATE.DOWN;

    if(this.panHandler.getPanEnabled()) {
      this.panHandler.onMouseDown(this.mouseAbsolute.x, this.mouseAbsolute.y, zoom);
      return;
    }

    if(this.activeControlPoint.hoveredOver) {
      this.selectedPuppet = puppets[this.activeControlPoint.puppetIndex];
      this.activeControlPoint.beingDragged = true;
      puppets.forEach(puppet => puppet.setSelectionGUIVisible(puppet === this.selectedPuppet));
      return;
    }

    // the notion of a selected puppet is only relative to mouse / touch, not leap motion
    this.selectedPuppet = puppets.find(puppet => puppet.pointInsideMesh(this.mouseRelative.x, this.mouseRelative.y));
    if (this.selectedPuppet) {
      this.selectedPuppet.setSelectionState(true, this.mouseRelative.x, this.mouseRelative.y);
    }
    puppets.forEach(puppet => puppet.setSelectionGUIVisible(puppet === this.selectedPuppet));
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
      const mouseVector = new Vector2(this.mouseRelative.x / puppet.getScale(), this.mouseRelative.y / puppet.getScale());
      mouseVector.rotateAround(puppet.getRotationCenter(), -puppet.getRotation());
      puppet.setControlPointPosition(ci, mouseVector.x, mouseVector.y);
      return;
    }

    if(this.selectedPuppet && this.selectedPuppet.selectionState.isBeingDragged) {
      this.selectedPuppet.incrementPosition(this.mouseRelative.x, this.mouseRelative.y);
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
    if (this.panHandler.getPanEnabled()) {
      return;
    }
    this.activeControlPoint.beingDragged = false;
    if (this.selectedPuppet) {
      this.selectedPuppet.setSelectionState(false);
    }
  }

  getSelectedPuppet() {
    return this.selectedPuppet;
  }

  onRemovePuppet() {
    this.selectedPuppet = null;
  }

}
