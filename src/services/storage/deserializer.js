import requestPuppetCreation from 'services/puppet/PuppetFactory';
import loadImage from 'services/util/imageLoader';

function loadTextFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = event => resolve(reader.result);
    reader.onerror = error => reject(error);
    reader.readAsText(file);
  });
}

function loadPuppetImageFiles(textFile) {
  const puppetData = JSON.parse(textFile);
  return Promise.all([
    loadImage(puppetData.imageData),
    loadImage(puppetData.imageNoBGData),
    Promise.resolve(puppetData)
  ]);
}

// TODO:  validate json fields
function buildPuppetFromImagesAndJson(image, imageNoBG, puppetData) {
  const backgroundRemovalData = new ImageData(
    Uint8ClampedArray.from(puppetData.backgroundRemovalData.data),
    puppetData.backgroundRemovalData.width,
    puppetData.backgroundRemovalData.height
  );
  const puppetParams = {
    vertices: puppetData.verts,
    faces: puppetData.faces,
    controlPoints: puppetData.controlPoints,
    controlPointPositions: puppetData.controlPointPositions,
    image,
    imageNoBG,
    backgroundRemovalData
  };
  // TODO: move this logic to caller
  return requestPuppetCreation(puppetParams);
}

function loadPuppetFromFile(file) {
  return loadTextFile(file)
    .then(textFile => loadPuppetImageFiles(textFile))
    .then((result) => {
      const [image, imageNoBG, puppetData] = result;
      return buildPuppetFromImagesAndJson(image, imageNoBG, puppetData);
    });
}

export default loadPuppetFromFile;
