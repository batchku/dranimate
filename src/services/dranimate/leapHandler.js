import * as Leap from 'leapjs';
import { Vector2 } from 'three';

function transformLeapCoordinate(vector) {
  return {
    x:  vector[0] * 1.5,
    y: -(vector[1] - 200) * 1.5
  }
}

export default class DranimateLeapHandler {

  constructor(rendererElement, panHandler, puppets) {
    this.rendererElement = rendererElement;
    this.panHandler = panHandler;
    this.puppets = puppets;
    this.setUpLeapMotionLoop();
  }

  setUpLeapMotionLoop() {
    const zoom = 1;

    Leap.loop((frame) => {
      if (!frame.hands.length) { return; }
      if (!this.puppets.length) { return; }

      const hand = frame.hands[0];
      const thumb = transformLeapCoordinate(hand.fingers[0].distal.center());
      const middle = transformLeapCoordinate(hand.fingers[2].distal.center());
      const pinky = transformLeapCoordinate(hand.fingers[4].distal.center());
      this.moveControlPoint(this.puppets[0], 0, thumb.x, thumb.y);
      this.moveControlPoint(this.puppets[0], 1, middle.x, middle.y);
      this.moveControlPoint(this.puppets[0], 2, pinky.x, pinky.y);

      // console.log('thumb', thumb);
      // this.handRelative = {
      //   x: (x - boundingRect.left - halfWidth) / zoom - this.panHandler.getPanPosition().x,
      //   y: (y - boundingRect.top - halfHeight) / zoom - this.panHandler.getPanPosition().y
      // };
      // this.puppets[0].incrementPosition(this.handRelative.x, this.handRelative.y);
    });
    // .use('screenPosition', { scale: 0.25 });
  }

  moveControlPoint(puppet, controlPointIndex, x, y) {
    const positionVector = new Vector2(x / puppet.getScale(), y / puppet.getScale());
    positionVector.rotateAround(puppet.getRotationCenter(), -puppet.getRotation());
    puppet.setControlPointPosition(controlPointIndex, positionVector.x, positionVector.y);
  }

}
