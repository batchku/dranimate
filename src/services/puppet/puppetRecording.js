import { Vector2 } from 'three';

const TIME_DELTA = 0.001;

class PuppetRecording {

  constructor() {
    const now = performance.now();
    this.controlPointFrames = [];
    this.startTime = now;
    this.stopTime = now;
    this.duration = 0;
    this.hasRecording = false;
    this.activeIndex = 0;
    this.allIndices = new Set();
    this.id = Math.random();
  }

  stop() {
    this.stopTime = performance.now();
    this.duration = this.stopTime - this.startTime;
    this.hasRecording = true;

    // attach relative times to each frames
    this.controlPointFrames.forEach((frame) => {
      const relativeTime = (frame.timestamp - this.startTime) / this.duration;
      frame.relativeTime = relativeTime;
    });

    // console.log('this.controlPointFrames', this.controlPointFrames)

    this.allIndices = this.controlPointFrames
      .reduce((indexSet, frame) => {
        frame.controlPoints.forEach(controlPoint => indexSet.add(controlPoint.cpi));
        return indexSet;
      }, new Set());
  }

  setFrame(cpi, x, y) {
    const controlPoints = [ { cpi, x, y } ];
    this.setFrames(controlPoints);
  }

  setFrames(controlPoints) {
    const timestamp = performance.now();
    this.controlPointFrames.push({ timestamp, controlPoints });
  }

  getIndices() {
    return this.allIndices;
  }

  update() {
    if (!this.hasRecording) { return; }
    const timeSinceStop = performance.now() - this.stopTime;
    const pointInLoop = (timeSinceStop / this.duration) % 1;

    const nextIndex = (this.activeIndex + 1) % (this.controlPointFrames.length - 1);
    const nextFrame = this.controlPointFrames[nextIndex];

    // if point in loop is greater than the next frame, get the lastest frame that is not ahead of point in loop
    if (pointInLoop > nextFrame.relativeTime) {
      let shouldLookahead = true;
      let lookaheadIndex = nextIndex;
      let targetIndex = nextIndex;

      while(shouldLookahead) {
        lookaheadIndex = (lookaheadIndex + 1) % (this.controlPointFrames.length - 1);
        if (pointInLoop < this.controlPointFrames[lookaheadIndex].relativeTime || lookaheadIndex === 0) {
          targetIndex = lookaheadIndex;
          shouldLookahead = false;
        }
        // console.log('lookahead')
      }

      this.activeIndex = targetIndex;
      return this.controlPointFrames[targetIndex];
    }

    if (Math.abs(pointInLoop - nextFrame.relativeTime) < TIME_DELTA) {
      this.activeIndex = nextIndex;
      return nextFrame;
    }

  }

}

export { PuppetRecording };
