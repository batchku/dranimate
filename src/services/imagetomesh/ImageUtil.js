import loadImage from 'services/util/imageLoader';

function getImageDataFromImage(image, w, h) {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  canvas.width = w || image.width;
  canvas.height = h || image.height;
  context.drawImage(image, 0, 0, image.width, image.height, 0, 0, canvas.width, canvas.height);
  return context.getImageData(0, 0, canvas.width, canvas.height);
}

function extractForeground (originalImageData, imageNoBackgroundData) {
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

export { extractForeground, getImageDataFromImage };
