export default class PanHandler {

  constructor() {
    this.isEnabled = false;
    this.needsUpdate = false;
    this.panPosition = { x: 0, y:0 };
    this.panFromPosition = { x: 0, y: 0 };
  }

  setPanEnabled(isEnabled) {
    this.isEnabled = isEnabled;
  }

  getPanEnabled() {
    return this.isEnabled;
  }

  onMouseDown(x, y, zoom) {
    if (!this.isEnabled) {
      return;
    }
    this.panFromPosition.x = x / zoom;
    this.panFromPosition.y = y / zoom;
  }

  onMouseMove(x, y, zoom) {
    if (!this.isEnabled) {
      return;
    }
    this.panPosition.x += x / zoom - this.panFromPosition.x;
    this.panPosition.y += y / zoom - this.panFromPosition.y;
    this.panFromPosition.x = x / zoom;
    this.panFromPosition.y = y / zoom;
    this.needsUpdate = true;
  }

  getPanPosition() {
    return this.panPosition;
  }

  update(camera) {
    if (!this.isEnabled || !this.needsUpdate) {
      return;
    }
    camera.position.x = -this.panPosition.x;
    camera.position.y = -this.panPosition.y;
    this.needsUpdate = false;
  }

}
