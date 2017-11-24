import { Vector2, Vector3 } from 'three';

function getPuppetAndControlPointFromPostion(puppets, x, y, distanceThreshold, zoom) {
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
      return (dist < distanceThreshold * zoom);
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

export { getPuppetAndControlPointFromPostion };
