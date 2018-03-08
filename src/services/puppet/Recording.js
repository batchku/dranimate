import { PuppetRecording } from 'services/puppet/puppetRecording';

export default class Recording {

  constructor() {
    this.recordings = [];
  }

  clear() {
    this.recordings = [];
  }

  getLastRecording() {
    return this.recordings[this.recordings.length - 1];
  }

  start(timestamp) {
    this.recordings.push(
      new PuppetRecording(timestamp, true)
    );
  }

  stop(timestamp) {
    const lastRecording = this.getLastRecording();
    lastRecording.stop(timestamp);
  }

  isRecording() {
    if (!this.recordings.length) { return false; }
    return this.getLastRecording().isRecording;
  }

  setFrame(frame, timestamp) {
    if (!this.isRecording()) {
      throw new Error('Recording.setFrame: cannot set frame when not recording');
    }
    this.getLastRecording().setFrame(frame, timestamp);
  }

  hasRecording() {
    return this.recordings.some(recording => recording.hasRecording);
  }

  getActiveIndices() {
    return this.recordings.reduce((allIndices, recording) => {
      recording.indices.forEach(index => allIndices.add(index));
      return allIndices;
    }, new Set());
  }

  getCurrentFrame(timestamp) {
    return this.recordings
      .filter(recording => recording.hasRecording)
      .map(recording => recording.update(timestamp))
      .filter(frame => frame);
  }

}
