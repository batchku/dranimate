import requestPuppetCreation from 'services/puppet/PuppetFactory';


// TODO: helper function to load image, validate json fields
function loadPuppetFromFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = event => {
      var puppetData = JSON.parse(reader.result);
      var image = new Image();
      image.onload = function () {
        var imageNoBG = new Image();
        imageNoBG.onload = function () {
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
          const puppet = requestPuppetCreation(puppetParams);
          console.log('success?', puppet);
          resolve(puppet);
        };
        imageNoBG.src = puppetData.imageNoBGData;
      };
      image.src = puppetData.imageData;
    };
    reader.onerror = error => reject(error);
    reader.readAsText(file);
  });
}

export default loadPuppetFromFile;
