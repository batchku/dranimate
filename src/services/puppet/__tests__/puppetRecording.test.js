import { PuppetRecording } from '../puppetRecording';

function buildPuppetRecordingWithFrames(numFrames) {
  const puppetRecording = new PuppetRecording(0);
  new Array(numFrames).fill(null).forEach((nullVal, index) => {
    puppetRecording.setFrame([], index);
  });
  puppetRecording.stop(numFrames);
  return puppetRecording;
}

describe('PuppetRecording', () => {

  test('has necessary properties', () => {
    const NUM_FRAMES = 10;
    const puppetRecording = buildPuppetRecordingWithFrames(NUM_FRAMES);
    expect(puppetRecording instanceof PuppetRecording).toBe(true);
    expect(puppetRecording.hasRecording).toBe(true);
    expect(puppetRecording.stopTime).toEqual(NUM_FRAMES);
    expect(puppetRecording.duration).toEqual(NUM_FRAMES);
  });

  test('throws an error it update timestamp is premature', () => {
    const NUM_FRAMES = 10;
    const puppetRecording = buildPuppetRecordingWithFrames(NUM_FRAMES);
    expect(() => puppetRecording.update(-1))
      .toThrowError('Update must take place after recording has stopped');
    expect(() => puppetRecording.update(0))
      .toThrowError('Update must take place after recording has stopped');
    expect(() => puppetRecording.update(NUM_FRAMES))
      .toThrowError('Update must take place after recording has stopped');
    expect(puppetRecording.update(NUM_FRAMES + 1)).toBeDefined();
  });

  test('returns a well formated recorded frames', () => {
    const NUM_FRAMES = 10;
    const puppetRecording = buildPuppetRecordingWithFrames(NUM_FRAMES);
    const recordedFrame = puppetRecording.update(NUM_FRAMES + 1);
    expect(recordedFrame).toHaveProperty('controlPoints');
    expect(recordedFrame).toHaveProperty('timestamp');
    expect(recordedFrame).toHaveProperty('relativeTime');
    expect(Array.isArray(recordedFrame.controlPoints)).toBe(true);
  });

  test('Duplicate frames will not be returned', () => {
    const NUM_FRAMES = 15;
    const puppetRecording = buildPuppetRecordingWithFrames(NUM_FRAMES);
    expect(puppetRecording.update(NUM_FRAMES + 1)).toBeDefined();
    expect(puppetRecording.update(NUM_FRAMES + 1)).toBeUndefined();
    expect(puppetRecording.update(NUM_FRAMES * 2 + 1)).toBeUndefined();
    expect(puppetRecording.update(NUM_FRAMES + 3)).toBeDefined();
    expect(puppetRecording.update(NUM_FRAMES + 3)).toBeUndefined();
    expect(puppetRecording.update(NUM_FRAMES * 4 + 3)).toBeUndefined();
    expect(puppetRecording.update(NUM_FRAMES + 14)).toBeDefined();
    expect(puppetRecording.update(NUM_FRAMES * 10 + 14)).toBeUndefined();
    expect(puppetRecording.update(NUM_FRAMES * 150 + 14)).toBeUndefined();
    expect(puppetRecording.update(NUM_FRAMES * 150 + 15)).toBeDefined();
  });

  test('When updating in a linear sequence, each update will return a frame', () => {
    const NUM_FRAMES = 30;
    const puppetRecording = buildPuppetRecordingWithFrames(NUM_FRAMES);
    const frames = new Array(NUM_FRAMES).fill(null).map((nullVal, index) => {
      const offset = NUM_FRAMES + index;
      return puppetRecording.update(NUM_FRAMES + offset);
    });
    const allDefined = frames.every(frame => !!frame);
    expect(allDefined).toBe(true);
  });

});
