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
    this.controllerIsConnected = false;
    this.leapController = new Leap.Controller({
      frameEventName: 'deviceFrame',
    }).connect();
    this.lastFrameId;
  }

  update(selectedPuppet) {
    if (!selectedPuppet) {
      return;
    }
    const leapFrame = this.leapController.frame();
    if (!leapFrame.valid || !leapFrame.hands.length) {
      return;
    }
    const hand = leapFrame.hands[0];
    const thumb = transformLeapCoordinate(hand.fingers[0].distal.center());
    const pointer = transformLeapCoordinate(hand.fingers[1].distal.center());
    const middle = transformLeapCoordinate(hand.fingers[2].distal.center());
    const ring = transformLeapCoordinate(hand.fingers[3].distal.center());
    const pinky = transformLeapCoordinate(hand.fingers[4].distal.center());
    this.moveControlPoints(selectedPuppet, [
      { cpi: 0, x: thumb.x, y: thumb.y },
      { cpi: 1, x: pointer.x, y: pointer.y },
      { cpi: 2, x: middle.x, y: middle.y },
      { cpi: 3, x: ring.x, y: ring.y },
      { cpi: 4, x: pinky.x, y: pinky.y },
    ]);
  }

  moveControlPoints(puppet, frames) {
    const normalizedFrames = frames
      .map(frame => {
        const positionVector = new Vector2(frame.x / puppet.getScale(), frame.y / puppet.getScale());
        positionVector.rotateAround(puppet.getCenter(), -puppet.getRotation());
        return {
          cpi: frame.cpi,
          x: positionVector.x,
          y: positionVector.y
        };
      });
    puppet.setControlPointPositions(normalizedFrames);
  }

  moveControlPoint(puppet, controlPointIndex, x, y) {
    const positionVector = new Vector2(x / puppet.getScale(), y / puppet.getScale());
    positionVector.rotateAround(puppet.getCenter(), -puppet.getRotation());
    puppet.setControlPointPosition(controlPointIndex, positionVector.x, positionVector.y);
  }

}
