import * as Leap from 'leapjs';
import { Vector2 } from 'three';

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
      const [thumbX, thumbY] = hand.fingers[0].distal.center();
      const [middleX, middleY] = hand.fingers[2].distal.center();
      const [ringX, ringY] = hand.fingers[3].distal.center();
      this.moveControlPoint(this.puppets[0], 0, thumbX * 1.5, -thumbY * 1.5);
      this.moveControlPoint(this.puppets[0], 1, middleX * 1.5, -middleY * 1.5);
      this.moveControlPoint(this.puppets[0], 2, ringX * 1.5, -ringY * 1.5);

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
