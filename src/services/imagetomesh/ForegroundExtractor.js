import loadImage from 'services/util/imageLoader';

export default function extractForeground (originalImageData, imageNoBackgroundData) {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  canvas.width = originalImageData.width;
  canvas.height = originalImageData.height;
  for (let i = 0; i < imageNoBackgroundData.data.length; i += 4) {
    if(imageNoBackgroundData.data[i + 3] !== 255) {
      originalImageData.data[i]     = 0;
      originalImageData.data[i + 1] = 0;
      originalImageData.data[i + 2] = 0;
      originalImageData.data[i + 3] = 0;
    }
  }
  context.putImageData(originalImageData, 0, 0);
  return loadImage(canvas.toDataURL('image/png'));
}
