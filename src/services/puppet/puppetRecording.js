import { Vector2 } from 'three';

const TIME_DELTA = 0.001;

class PuppetRecording {

  constructor(timestamp, isRecording) {
    const now = (timestamp !== undefined) ? timestamp : performance.now();
    this.hasRecording = false;
    this.isRecording = isRecording;
    this.controlPointFrames = [];
    this.relativePoints = [];
    this.startTime = now;
    this.stopTime = now;
    this.duration = 0;
    this.activeIndex = -1;
    // this.allIndices = new Set();
    this.id = Math.random();
    this.lastServedIndex;
  }

  stop(timestamp) {
    this.stopTime = timestamp;
    this.duration = this.stopTime - this.startTime;
    this.hasRecording = true;
    this.isRecording = false;
    // attach relative times to each frames
    this.controlPointFrames.forEach((frame) => {
      const relativeTime = (frame.timestamp - this.startTime) / this.duration;
      frame.relativeTime = relativeTime;
    });
    this.relativePoints = this.controlPointFrames.map((frame, index) => ({
      index,
      relativeTime: frame.relativeTime
    }));
  }

  setFrame(controlPoints, timestamp) {
    this.controlPointFrames.push({ controlPoints, timestamp });
  }

  update(timestamp) {
    if (!timestamp || timestamp <= this.stopTime) {
      throw new Error('Update must take place after recording has stopped');
    }
    if (!this.hasRecording) { return; }
    const timeSinceStop = timestamp - this.stopTime;
    const relativeTimeInLoop = (timeSinceStop / this.duration) % 1;
    const closestIndex = this._getNearestIndexForRelativePoint(relativeTimeInLoop);
    if (this.lastServedIndex !== closestIndex) {
      this.lastServedIndex = closestIndex;
      return this.controlPointFrames[closestIndex];
    }
  }

  // Binary search for nearset relativePoint
  _getNearestIndexForRelativePoint(relativeTimeInLoop) {
    let low = 0;
    let high = this.relativePoints.length - 1;
    while (low < high) {
      const mid = Math.floor((low + high) / 2);
      const d1 = Math.abs(this.relativePoints[mid].relativeTime - relativeTimeInLoop);
      const d2 = Math.abs(this.relativePoints[mid + 1].relativeTime - relativeTimeInLoop);
      if (d2 <= d1) {
        low = mid + 1;
      }
      else {
        high = mid;
      }
    }
    return this.relativePoints[high].index;
  }

}

export { PuppetRecording };
