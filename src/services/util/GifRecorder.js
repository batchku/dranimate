import GIF from 'gif.js';

const GIF_TIME_RESOLUTION = 100; // in milliseconds

class GifRecording {

  constructor(timestamp, isRecording) {
    const now = timestamp;
    this.startTime = now;
    this.stopTime = now;
    this.duration = 0;
    this.frames = [];
    this.isRecording = isRecording;
  }

  stop(timestamp, puppets, canvasElement) {
    this.stopTime = timestamp;
    this.duration = this.stopTime - this.startTime;
    this.hasRecording = true;
    this.isRecording = false;

    const numFrames = Math.round(this.duration / GIF_TIME_RESOLUTION);
    const targetTimestamps = new Array(numFrames).fill(GIF_TIME_RESOLUTION)
      .map((timeResolution, index) => this.stopTime + timeResolution * index);
    return {
      targetTimestamps,
      gifTimestep: GIF_TIME_RESOLUTION
    };
  }

  setFrame(timestamp) {
    if (!this.isRecording) { return; }
    this.frames.push(timestamp);
  }

}

class GifBuilder {

  constructor(timestamp) {
    this.recorder = new GIF({
      workers: 2,
      quality: 30,
      workerScript: 'workers/gif.worker.js'
    });
  }

  recordFrame(canvasElement, delay) {
    this.recorder.addFrame(canvasElement, { copy: true, delay, });
  }

  buildGif() {
    return new Promise((resolve, reject) => {
      try {
        this.recorder.on('finished', blob => resolve(blob));
        this.recorder.render();
      }
      catch(error) {
        reject(error);
      }
    });
  }

}

export { GifRecording, GifBuilder };
