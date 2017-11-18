

const MOUSE_STATE = {
  UP: 'UP',
  DOWN: 'DOWN',
  OUTSIDE: 'OUTSIDE',
};

const getPuppetAndControlPointFromPostion = (x, y, distanceThreshold, puppets) => {
  let activeControlPoint;
  for(var p = 0; p < puppets.length; p++) {
    const puppet = puppets[p];
    const verts = puppet.threeMesh.geometry.vertices;
    const controlPoints = puppet.controlPoints;

    const closeControlPointIndex = controlPoints.findIndex((controlPoint, index) => {
      const mouseVector = new THREE.Vector2(mouseRelative.x / puppet.getScale(), mouseRelative.y / puppet.getScale());
      mouseVector.rotateAround(puppet.getRotationCenter(), -puppet.getRotation());
      const vert = verts[controlPoint];
      const dist = vert.distanceTo(new THREE.Vector3(mouseVector.x, mouseVector.y, 0));
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

class DranimateClickHandler {

  constructor(rendererElement) {
    this.rendererElement = rendererElement;
    this.mouseState = MOUSE_STATE.UP;
    this.mouseRelative = {x:0, y:0};
    this.mouseAbsolute = {x:0, y:0};=
    this.selectedPuppet;
  }

  onMouseDown(event) {}

  onMouseMove(event) {}

  onMouseUp(event) {}

}
