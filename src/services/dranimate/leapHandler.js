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
    this.normalizeControlPoints(selectedPuppet, [
      { cpi: 0, position: new Vector2(thumb.x, thumb.y) },
      { cpi: 1, position: new Vector2(pointer.x, pointer.y) },
      { cpi: 2, position: new Vector2(middle.x, middle.y) },
      { cpi: 3, position: new Vector2(ring.x, ring.y) },
      { cpi: 4, position: new Vector2(pinky.x, pinky.y) }
    ]);
  }

  normalizeControlPoints(puppet, frames) {
    const puppetCenter = puppet.getCenter();
    const normalizedFrames = frames
      .map((frame) => {
        const position = frame.position
          .sub(puppetCenter)
          .multiplyScalar(1 / puppet.getScale())
          .add(puppetCenter);
        return {
          cpi: frame.cpi,
          position
        };
      });
    puppet.setControlPointPositions(normalizedFrames);
  }

}
