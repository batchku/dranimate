
export default function loadImage(imageSource) {
  return new Promise((resolve, reject) => {
    try {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = error => reject(error);
      image.src = imageSource;
    }
    catch(error) {
      reject(error);
    }
  });
}
