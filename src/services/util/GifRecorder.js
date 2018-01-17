import GIF from 'gif.js';

export default class GifRecorder {

  constructor() {
    this.recordingFrequency = 150;
    this.recorder = new GIF({
      workers: 2,
      quality: 30,
      workerScript: 'workers/gif.worker.js'
    });
    this.lastRecordedFrame = 0;
  }

  stop(canvasElement) {
    const elapsedTime = performance.now() - this.lastRecordedFrame;
    this.recorder.addFrame(canvasElement, {
      delay: elapsedTime,
      copy: true
    });

    return new Promise((resolve, reject) => {
      try {
        this.recorder.on('finished', blob => {
          const objectUrl = URL.createObjectURL(blob);
          resolve(objectUrl);
        });
        this.recorder.render();
      }
      catch(error) {
        reject(error);
      }
    });
  }

  offerFrame(canvasElement) {
    const now = performance.now();

    // record first frame
    if (!this.lastRecordedFrame) {
      this.lastRecordedFrame = now;
      this.recorder.addFrame(canvasElement, { copy: true });
      return;
    }

    // record subsequent frames
    const elapsedTime = now - this.lastRecordedFrame;
    if (elapsedTime >= this.recordingFrequency) {
      this.lastRecordedFrame = now;
      this.recorder.addFrame(canvasElement, {
        delay: elapsedTime,
        copy: true
      });
    }
  }

}
